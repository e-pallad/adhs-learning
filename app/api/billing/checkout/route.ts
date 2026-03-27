import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getCurrentUser } from "@/lib/user"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { interval } = body

  if (interval !== "month" && interval !== "year") {
    return NextResponse.json({ error: "Invalid interval" }, { status: 400 })
  }

  const priceId =
    interval === "month"
      ? process.env.STRIPE_PRICE_MONTHLY_ID!
      : process.env.STRIPE_PRICE_ANNUAL_ID!

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    ...(user.stripeCustomerId
      ? { customer: user.stripeCustomerId }
      : { customer_email: user.email }),
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgraded=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  })

  return NextResponse.json({ url: session.url })
}
