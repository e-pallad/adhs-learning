/**
 * lib/stripe.ts — Stripe client singleton
 *
 * Import `stripe` wherever you need the Stripe API client.
 * Import `stripeWebhookSecret` for signature verification in the webhook route.
 *
 * Both values are undefined when the relevant env vars are absent so the app
 * still boots in environments where Stripe is not configured (e.g. local dev
 * without payment keys). The webhook handler returns 500 with a clear message
 * when the secret is missing rather than silently processing events.
 */

import Stripe from "stripe"

// Singleton — reused across hot-reloads in dev and across invocations in prod.
export const stripe: Stripe | null = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-03-31.basil",
      typescript: true,
    })
  : null

export const stripeWebhookSecret: string | undefined =
  process.env.STRIPE_WEBHOOK_SECRET
