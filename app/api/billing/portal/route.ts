import { NextResponse } from "next/server"
import Stripe from "stripe"
import { getCurrentUser } from "@/lib/user"

if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set")
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!user.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found" }, { status: 400 })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  })

  return NextResponse.json({ url: session.url })
}
