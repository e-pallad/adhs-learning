/**
 * Integration tests for POST /api/stripe/portal
 *
 * Creates a Stripe Customer Portal session for Pro users to manage/cancel.
 * Stripe client is mocked; real DB is used.
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from "vitest"
import { prisma } from "@/lib/prisma"
import { setTestUserId } from "../setup"
import { createTestUser, deleteTestUser } from "../helpers/test-user"

const ID = "test-user-stripe-portal"
const CUSTOMER_ID = "cus_portal_test"
const SUB_ID = "sub_portal_test"

process.env.NEXT_PUBLIC_APP_URL = "https://test.devfluent"

// ─── Stripe mock ─────────────────────────────────────────────────────────────

const mockPortalCreate = vi.fn()

vi.mock("@/lib/stripe", () => ({
  stripe: {
    checkout: { sessions: { create: vi.fn() } },
    billingPortal: { sessions: { create: mockPortalCreate } },
  },
  stripeWebhookSecret: "whsec_test",
}))

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("POST /api/stripe/portal", () => {
  let POST: () => Promise<Response>

  beforeAll(async () => {
    await createTestUser(ID)
    const mod = await import("@/app/api/stripe/portal/route")
    POST = mod.POST
  })

  beforeEach(async () => {
    vi.clearAllMocks()
    setTestUserId(ID)
    await prisma.subscription.deleteMany({ where: { userId: ID } })
  })

  afterAll(async () => {
    await deleteTestUser(ID)
  })

  it("returns 401 when unauthenticated", async () => {
    setTestUserId(null)
    const res = await POST()
    expect(res.status).toBe(401)
  })

  it("returns 404 when user has no Subscription row", async () => {
    const res = await POST()
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toMatch(/no stripe customer/i)
  })

  it("returns 404 when Subscription row has no stripeCustomerId", async () => {
    await prisma.subscription.create({
      data: { userId: ID, tier: "PRO", status: "ACTIVE" },
    })
    const res = await POST()
    expect(res.status).toBe(404)
  })

  it("creates portal session and returns URL for a customer with active subscription", async () => {
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
    mockPortalCreate.mockResolvedValueOnce({ url: "https://billing.stripe.com/portal_test" })

    const res = await POST()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.url).toBe("https://billing.stripe.com/portal_test")

    expect(mockPortalCreate).toHaveBeenCalledOnce()
    const call = mockPortalCreate.mock.calls[0][0]
    expect(call.customer).toBe(CUSTOMER_ID)
    expect(call.return_url).toContain("/settings")
  })

  it("returns 500 when Stripe portal create throws", async () => {
    await prisma.subscription.create({
      data: {
        userId: ID,
        tier: "PRO",
        status: "ACTIVE",
        stripeCustomerId: CUSTOMER_ID,
      },
    })
    mockPortalCreate.mockRejectedValueOnce(new Error("Stripe API error"))

    const res = await POST()
    expect(res.status).toBe(500)
  })
})
