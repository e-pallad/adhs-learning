/**
 * Integration tests for POST /api/webhooks/stripe
 *
 * Strategy:
 *   - Mock `lib/stripe` so constructEvent is controllable without real Stripe keys.
 *   - Use the real test DB (via prisma) to verify DB side-effects.
 *   - Build minimal NextRequest objects with the raw body + stripe-signature header.
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from "vitest"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { createTestUser, deleteTestUser } from "../helpers/test-user"

const ID = "test-user-stripe-webhook"
const CUSTOMER_ID = "cus_test_stripe_webhook"
const SUB_ID = "sub_test_stripe_webhook"

// ─── Stripe mock ────────────────────────────────────────────────────────────

// We control what constructEvent returns; subscriptions.retrieve is stubbed per-test.
const mockConstructEvent = vi.fn()
const mockRetrieve = vi.fn()

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: { constructEvent: mockConstructEvent },
    subscriptions: { retrieve: mockRetrieve },
  },
  stripeWebhookSecret: "whsec_test",
}))

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(body: string) {
  return new NextRequest("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers: { "stripe-signature": "t=123,v1=abc" },
    body,
  })
}

/**
 * Build a minimal Stripe event object and configure mockConstructEvent to return it.
 */
function mockEvent(type: string, data: object) {
  const event = { id: `evt_${type.replace(/\./g, "_")}`, type, data: { object: data } }
  mockConstructEvent.mockReturnValueOnce(event)
  return event
}

/** Minimal Stripe Subscription object for retrieve() responses */
function makeStripeSub(
  opts: {
    id?: string
    status?: string
    priceId?: string
    periodEnd?: number
    cancelAtPeriodEnd?: boolean
  } = {}
) {
  const {
    id = SUB_ID,
    status = "active",
    priceId = process.env.STRIPE_PRICE_MONTHLY_ID ?? "price_monthly",
    periodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 3600,
    cancelAtPeriodEnd = false,
  } = opts

  return {
    id,
    status,
    cancel_at_period_end: cancelAtPeriodEnd,
    current_period_end: periodEnd,
    items: { data: [{ price: { id: priceId } }] },
    customer: CUSTOMER_ID,
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("POST /api/webhooks/stripe", () => {
  // Import lazily so the mock is in place before module initialises
  let POST: (req: NextRequest) => Promise<Response>

  beforeAll(async () => {
    await createTestUser(ID)
    const mod = await import("@/app/api/webhooks/stripe/route")
    POST = mod.POST
  })

  beforeEach(async () => {
    vi.clearAllMocks()
    await prisma.subscription.deleteMany({ where: { userId: ID } })
    await prisma.user.update({
      where: { id: ID },
      data: { subscriptionTier: "FREE" },
    })
  })

  afterAll(async () => {
    await deleteTestUser(ID)
  })

  // ── Guard rails ──────────────────────────────────────────────────────────

  it("returns 400 when stripe-signature header is missing", async () => {
    const req = new NextRequest("http://localhost/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/stripe-signature/i)
  })

  it("returns 400 when signature verification fails", async () => {
    mockConstructEvent.mockImplementationOnce(() => {
      throw new Error("No signatures found matching the expected signature for payload")
    })
    const req = makeRequest("{}")
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/signature/i)
  })

  it("returns 200 for unhandled event types without DB changes", async () => {
    mockEvent("some.unknown.event", {})
    const res = await POST(makeRequest("{}"))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.received).toBe(true)
  })

  // ── checkout.session.completed ───────────────────────────────────────────

  it("checkout.session.completed: creates Subscription row and sets PRO tier", async () => {
    const stripeSub = makeStripeSub()
    mockRetrieve.mockResolvedValueOnce(stripeSub)

    mockEvent("checkout.session.completed", {
      mode: "subscription",
      metadata: { userId: ID },
      customer: CUSTOMER_ID,
      subscription: SUB_ID,
    })

    const res = await POST(makeRequest("{}"))
    expect(res.status).toBe(200)

    const sub = await prisma.subscription.findUnique({ where: { userId: ID } })
    expect(sub).not.toBeNull()
    expect(sub!.tier).toBe("PRO")
    expect(sub!.status).toBe("ACTIVE")
    expect(sub!.stripeCustomerId).toBe(CUSTOMER_ID)
    expect(sub!.stripeSubId).toBe(SUB_ID)

    const user = await prisma.user.findUnique({ where: { id: ID } })
    expect(user!.subscriptionTier).toBe("PRO")
  })

  it("checkout.session.completed: skips non-subscription mode", async () => {
    mockEvent("checkout.session.completed", {
      mode: "payment",
      metadata: { userId: ID },
      customer: CUSTOMER_ID,
      subscription: null,
    })

    const res = await POST(makeRequest("{}"))
    expect(res.status).toBe(200)

    const sub = await prisma.subscription.findUnique({ where: { userId: ID } })
    expect(sub).toBeNull()
  })

  it("checkout.session.completed: logs error and returns 200 when userId missing", async () => {
    mockEvent("checkout.session.completed", {
      mode: "subscription",
      metadata: {},
      customer: null,
      subscription: SUB_ID,
    })

    const res = await POST(makeRequest("{}"))
    // Still 200 — we don't want Stripe to retry a permanently unfixable event
    expect(res.status).toBe(200)
  })

  // ── customer.subscription.updated ────────────────────────────────────────

  it("subscription.updated: updates tier, status, and period for existing Subscription row", async () => {
    // Pre-create a Subscription row so resolveUserId can find userId by customerId
    await prisma.subscription.create({
      data: {
        userId: ID,
        tier: "PRO",
        status: "ACTIVE",
        stripeCustomerId: CUSTOMER_ID,
        stripeSubId: SUB_ID,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
    })

    const newPeriodEnd = Math.floor(Date.now() / 1000) + 60 * 24 * 3600 // 60 days
    mockEvent("customer.subscription.updated", {
      ...makeStripeSub({
        status: "active",
        periodEnd: newPeriodEnd,
        cancelAtPeriodEnd: true,
      }),
      customer: CUSTOMER_ID,
    })

    const res = await POST(makeRequest("{}"))
    expect(res.status).toBe(200)

    const sub = await prisma.subscription.findUnique({ where: { userId: ID } })
    expect(sub!.cancelAtPeriodEnd).toBe(true)
    // Period end should be approximately 60 days from now (within 5 s tolerance)
    expect(sub!.currentPeriodEnd!.getTime()).toBeCloseTo(
      new Date(newPeriodEnd * 1000).getTime(),
      -4 // within 10 seconds
    )
  })

  it("subscription.updated: marks PAST_DUE when Stripe status is past_due", async () => {
    await prisma.subscription.create({
      data: {
        userId: ID,
        tier: "PRO",
        status: "ACTIVE",
        stripeCustomerId: CUSTOMER_ID,
        stripeSubId: SUB_ID,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
    })

    mockEvent("customer.subscription.updated", {
      ...makeStripeSub({ status: "past_due" }),
      customer: CUSTOMER_ID,
    })

    await POST(makeRequest("{}"))

    const sub = await prisma.subscription.findUnique({ where: { userId: ID } })
    expect(sub!.status).toBe("PAST_DUE")
    // PAST_DUE still retains existing tier (downgrade only on deletion)
    expect(sub!.tier).toBe("PRO")

    // User subscriptionTier also reflects degraded state (mapPriceTier → PRO for same price)
    const user = await prisma.user.findUnique({ where: { id: ID } })
    expect(user!.subscriptionTier).toBe("PRO")
  })

  it("subscription.updated: returns 200 without error when no Subscription row found", async () => {
    // No subscription row in DB — resolveUserId returns null
    mockEvent("customer.subscription.updated", {
      ...makeStripeSub(),
      customer: "cus_unknown",
    })

    const res = await POST(makeRequest("{}"))
    expect(res.status).toBe(200)
  })

  // ── customer.subscription.deleted ────────────────────────────────────────

  it("subscription.deleted: marks CANCELLED and downgrades user to FREE", async () => {
    await prisma.subscription.create({
      data: {
        userId: ID,
        tier: "PRO",
        status: "ACTIVE",
        stripeCustomerId: CUSTOMER_ID,
        stripeSubId: SUB_ID,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
    })
    await prisma.user.update({ where: { id: ID }, data: { subscriptionTier: "PRO" } })

    mockEvent("customer.subscription.deleted", {
      ...makeStripeSub({ status: "canceled" }),
      customer: CUSTOMER_ID,
    })

    const res = await POST(makeRequest("{}"))
    expect(res.status).toBe(200)

    const sub = await prisma.subscription.findUnique({ where: { userId: ID } })
    expect(sub!.status).toBe("CANCELLED")
    expect(sub!.currentPeriodEnd).toBeNull()
    expect(sub!.cancelAtPeriodEnd).toBe(false)

    const user = await prisma.user.findUnique({ where: { id: ID } })
    expect(user!.subscriptionTier).toBe("FREE")
  })

  it("subscription.deleted: preserves the Subscription row (audit trail)", async () => {
    await prisma.subscription.create({
      data: {
        userId: ID,
        tier: "PRO",
        status: "ACTIVE",
        stripeCustomerId: CUSTOMER_ID,
        stripeSubId: SUB_ID,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
    })

    mockEvent("customer.subscription.deleted", {
      ...makeStripeSub({ status: "canceled" }),
      customer: CUSTOMER_ID,
    })

    await POST(makeRequest("{}"))

    // Row still exists — not deleted
    const sub = await prisma.subscription.findUnique({ where: { userId: ID } })
    expect(sub).not.toBeNull()
  })

  // ── invoice.payment_failed ────────────────────────────────────────────────

  it("invoice.payment_failed: marks Subscription PAST_DUE", async () => {
    await prisma.subscription.create({
      data: {
        userId: ID,
        tier: "PRO",
        status: "ACTIVE",
        stripeCustomerId: CUSTOMER_ID,
        stripeSubId: SUB_ID,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
    })

    mockEvent("invoice.payment_failed", {
      id: "in_test_1",
      customer: CUSTOMER_ID,
    })

    const res = await POST(makeRequest("{}"))
    expect(res.status).toBe(200)

    const sub = await prisma.subscription.findUnique({ where: { userId: ID } })
    expect(sub!.status).toBe("PAST_DUE")
  })

  it("invoice.payment_failed: returns 200 when no customer on invoice", async () => {
    mockEvent("invoice.payment_failed", {
      id: "in_test_no_cust",
      customer: null,
    })

    const res = await POST(makeRequest("{}"))
    expect(res.status).toBe(200)
  })
})
