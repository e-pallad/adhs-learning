/**
 * POST /api/stripe/portal
 *
 * Creates a Stripe Customer Portal session and returns the URL so Pro users
 * can manage their subscription (change plan, cancel, update payment method).
 *
 * Returns: { url: string }
 *
 * Security:
 *   - Requires authenticated session (getCurrentUser → 401 guard)
 *   - Only available to users who have a Subscription row with a stripeCustomerId
 *     (i.e. they actually went through Stripe Checkout at some point)
 *
 * Stripe Customer Portal must be configured in the Stripe dashboard
 * (Billing → Customer portal) before this endpoint returns usable URLs.
 */

import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { getCurrentUser } from "@/lib/user"
import { prisma } from "@/lib/prisma"

export async function POST() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 })
  }

  // Look up the stripeCustomerId for this user
  const sub = await prisma.subscription.findUnique({
    where: { userId: user.id },
    select: { stripeCustomerId: true },
  })

  if (!sub?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No Stripe customer found for this account" },
      { status: 404 }
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${appUrl}/settings`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("[stripe/portal] Error creating portal session:", err)
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 })
  }
}
