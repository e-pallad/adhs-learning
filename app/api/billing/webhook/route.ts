import { NextRequest } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new Response("Webhook signature verification failed", { status: 400 })
  }

  const getUser = async (customerId: string) => {
    const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } })
    return user
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.mode !== "subscription") return new Response("OK", { status: 200 })

    const customerId = session.customer as string
    const subscriptionId = session.subscription as string

    await prisma.user.updateMany({
      where: { stripeCustomerId: customerId },
      data: { plan: "pro", stripeSubscriptionId: subscriptionId, planExpiresAt: null },
    })

    // First-time subscriber: store customerId by email
    if (!await getUser(customerId)) {
      const customerEmail = session.customer_details?.email
      if (customerEmail) {
        await prisma.user.updateMany({
          where: { email: customerEmail },
          data: {
            plan: "pro",
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            planExpiresAt: null,
          },
        })
      }
    }
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string
    const user = await getUser(customerId)
    if (!user) return new Response("OK", { status: 200 })

    // cancel_at is set by Stripe when cancel_at_period_end=true (it equals the period end date)
    const cancelAt = sub.cancel_at ? new Date(sub.cancel_at * 1000) : null
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripePeriodEnd: cancelAt,
        planExpiresAt: sub.cancel_at_period_end ? cancelAt : null,
      },
    })
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string
    const user = await getUser(customerId)
    if (!user) return new Response("OK", { status: 200 })

    await prisma.user.update({
      where: { id: user.id },
      data: { plan: "free", planExpiresAt: null, stripeSubscriptionId: null },
    })
  }

  return new Response("OK", { status: 200 })
}
