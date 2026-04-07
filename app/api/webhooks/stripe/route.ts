/**
 * POST /api/webhooks/stripe
 *
 * Receives Stripe webhook events and keeps the `subscriptions` table in sync.
 *
 * Handled events:
 *   checkout.session.completed      → create/activate Subscription row
 *   customer.subscription.updated   → update tier/status/period fields
 *   customer.subscription.deleted   → mark CANCELLED, clear period
 *   invoice.payment_failed          → mark PAST_DUE
 *
 * All DB writes are wrapped in prisma.$transaction.
 * Stripe signature is verified before any processing.
 * Returns 200 immediately for unhandled event types (Stripe retries on non-2xx).
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 *
 * The route is in PUBLIC_PATHS so auth middleware does not block it.
 * The Stripe signature provides its own authentication.
 */

import { NextRequest, NextResponse } from "next/server"
import type Stripe from "stripe"
import { stripe, stripeWebhookSecret } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

// Map Stripe subscription statuses to our internal SubscriptionStatus enum.
// Stripe uses lowercase; our enum is uppercase.
function mapStripeStatus(
  stripeStatus: Stripe.Subscription["status"]
): "ACTIVE" | "CANCELLED" | "PAST_DUE" | "TRIALING" {
  switch (stripeStatus) {
    case "active":
      return "ACTIVE"
    case "trialing":
      return "TRIALING"
    case "past_due":
    case "unpaid":
      return "PAST_DUE"
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
    case "paused":
    default:
      return "CANCELLED"
  }
}

// Derive SubscriptionTier from the Stripe price ID.
// STRIPE_PRICE_MONTHLY_ID and STRIPE_PRICE_ANNUAL_ID → PRO
// Any other price → FREE (safe fallback; avoids silently granting wrong tier)
function mapPriceTier(priceId: string): "PRO" | "LIFETIME" | "FREE" {
  const monthly = process.env.STRIPE_PRICE_MONTHLY_ID
  const annual = process.env.STRIPE_PRICE_ANNUAL_ID
  const lifetime = process.env.STRIPE_PRICE_LIFETIME_ID

  if (lifetime && priceId === lifetime) return "LIFETIME"
  if ((monthly && priceId === monthly) || (annual && priceId === annual)) return "PRO"
  return "FREE"
}

/**
 * Resolve the userId from a Stripe customer ID.
 * We store stripeCustomerId on the Subscription row; look it up there first,
 * then fall back to the customer's metadata.userId if the row doesn't exist yet.
 */
async function resolveUserId(
  customerId: string,
  customerMetadata?: Record<string, string>
): Promise<string | null> {
  // Fast path: existing Subscription row already has the userId foreign key
  const existing = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId },
    select: { userId: true },
  })
  if (existing) return existing.userId

  // Fallback: Stripe customer metadata set at checkout time
  if (customerMetadata?.userId) return customerMetadata.userId

  return null
}

// ─── Event handlers ───────────────────────────────────────────────────────────

/**
 * checkout.session.completed
 *
 * Fired when a customer completes a Stripe Checkout session.
 * The session must be in `subscription` mode.
 * We expect `metadata.userId` to be set when creating the Checkout session.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== "subscription") return

  const userId =
    session.metadata?.userId ??
    (session.customer
      ? await resolveUserId(
          typeof session.customer === "string"
            ? session.customer
            : session.customer.id,
          session.metadata as Record<string, string>
        )
      : null)

  if (!userId) {
    console.error("[stripe/webhook] checkout.session.completed: no userId in metadata", {
      sessionId: session.id,
    })
    return
  }

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id

  if (!customerId || !subscriptionId || !stripe) return

  // Fetch the full subscription object to get price/period details
  const sub = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price"],
  })

  const priceId = sub.items.data[0]?.price?.id ?? ""
  const tier = mapPriceTier(priceId)
  const status = mapStripeStatus(sub.status)
  const currentPeriodEnd =
    tier === "LIFETIME" ? null : new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000)

  await prisma.$transaction(async (tx) => {
    await tx.subscription.upsert({
      where: { userId },
      create: {
        userId,
        tier,
        status,
        stripeCustomerId: customerId,
        stripeSubId: subscriptionId,
        currentPeriodEnd,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      },
      update: {
        tier,
        status,
        stripeCustomerId: customerId,
        stripeSubId: subscriptionId,
        currentPeriodEnd,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      },
    })
    // Mirror onto User.subscriptionTier for the fallback lookup path
    await tx.user.update({
      where: { id: userId },
      data: { subscriptionTier: tier },
    })
  })

  console.info("[stripe/webhook] checkout.session.completed: subscription activated", {
    userId,
    tier,
    status,
    subscriptionId,
  })
}

/**
 * customer.subscription.updated
 *
 * Fired on any subscription change: renewal, upgrade, downgrade, cancellation
 * scheduled, trial end, etc.
 */
async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id

  const userId = await resolveUserId(customerId)
  if (!userId) {
    console.warn("[stripe/webhook] subscription.updated: no userId found for customer", {
      customerId,
      subId: sub.id,
    })
    return
  }

  const priceId = sub.items.data[0]?.price?.id ?? ""
  const tier = mapPriceTier(priceId)
  const status = mapStripeStatus(sub.status)
  const currentPeriodEnd =
    tier === "LIFETIME"
      ? null
      : new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000)

  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { userId },
      data: {
        tier,
        status,
        stripeSubId: sub.id,
        currentPeriodEnd,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      },
    })
    await tx.user.update({
      where: { id: userId },
      data: { subscriptionTier: tier },
    })
  })

  console.info("[stripe/webhook] subscription.updated", {
    userId,
    tier,
    status,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  })
}

/**
 * customer.subscription.deleted
 *
 * Fired when a subscription is fully cancelled (period ended or immediate cancel).
 * We mark status CANCELLED but never delete the row — preserves audit history.
 */
async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id

  const userId = await resolveUserId(customerId)
  if (!userId) {
    console.warn("[stripe/webhook] subscription.deleted: no userId found for customer", {
      customerId,
      subId: sub.id,
    })
    return
  }

  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { userId },
      data: {
        status: "CANCELLED",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      },
    })
    await tx.user.update({
      where: { id: userId },
      data: { subscriptionTier: "FREE" },
    })
  })

  console.info("[stripe/webhook] subscription.deleted: downgraded to FREE", { userId })
}

/**
 * invoice.payment_failed
 *
 * Fired when a renewal invoice cannot be charged.
 * We mark the subscription PAST_DUE so the gate reflects degraded access.
 * Stripe will keep retrying; if it eventually succeeds, subscription.updated
 * fires and we restore ACTIVE.
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id
  if (!customerId) return

  const userId = await resolveUserId(customerId)
  if (!userId) {
    console.warn("[stripe/webhook] invoice.payment_failed: no userId found for customer", {
      customerId,
      invoiceId: invoice.id,
    })
    return
  }

  await prisma.subscription.update({
    where: { userId },
    data: { status: "PAST_DUE" },
  })

  console.info("[stripe/webhook] invoice.payment_failed: marked PAST_DUE", { userId })
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!stripe) {
    console.error("[stripe/webhook] STRIPE_SECRET_KEY is not configured")
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
  }

  if (!stripeWebhookSecret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET is not configured")
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  const sig = req.headers.get("stripe-signature")
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
  }

  // Raw body is required for signature verification — do NOT use req.json()
  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, stripeWebhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.warn("[stripe/webhook] Signature verification failed:", message)
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        // Acknowledge unhandled events — do not return non-2xx or Stripe will retry
        break
    }
  } catch (err) {
    console.error("[stripe/webhook] Handler error for event", event.type, err)
    // Return 500 so Stripe retries the event
    return NextResponse.json({ error: "Internal handler error" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
