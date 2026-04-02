import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest"
import { POST, GET, DELETE } from "@/app/api/accountability/route"
import { prisma } from "@/lib/prisma"
import { setTestUserId } from "../setup"
import { makePost } from "../helpers/make-request"
import { createTestUser, deleteTestUser } from "../helpers/test-user"

const ID_A = "test-acc-user-a"
const ID_B = "test-acc-user-b"
const EMAIL_A = `${ID_A}@test.devfluent`
const EMAIL_B = `${ID_B}@test.devfluent`

async function cleanupPairs() {
  await prisma.accountabilityPair.deleteMany({
    where: { OR: [{ requesterId: ID_A }, { partnerId: ID_A }, { requesterId: ID_B }, { partnerId: ID_B }] },
  })
}

describe("Accountability routes", () => {
  beforeAll(async () => {
    await createTestUser(ID_A)
    await createTestUser(ID_B)
  })
  beforeEach(async () => {
    setTestUserId(ID_A)
    await cleanupPairs()
    // Reset daily logs for both users
    await prisma.dailyLog.deleteMany({ where: { userId: { in: [ID_A, ID_B] } } })
    await prisma.user.updateMany({
      where: { id: { in: [ID_A, ID_B] } },
      data: { totalXP: 0, level: 1, streak: 0 },
    })
  })
  afterAll(async () => {
    await cleanupPairs()
    await deleteTestUser(ID_A)
    await deleteTestUser(ID_B)
  })

  // --- POST /api/accountability ---

  describe("POST /api/accountability", () => {
    it("returns 401 when unauthenticated", async () => {
      setTestUserId(null)
      const res = await POST(makePost("/api/accountability", { partnerEmail: EMAIL_B }))
      expect(res.status).toBe(401)
    })

    it("returns 400 when partnerEmail is missing", async () => {
      const res = await POST(makePost("/api/accountability", {}))
      expect(res.status).toBe(400)
    })

    it("returns 400 when linking to own email", async () => {
      const res = await POST(makePost("/api/accountability", { partnerEmail: EMAIL_A }))
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toMatch(/yourself/i)
    })

    it("returns 400 when linking to own email with different casing", async () => {
      const res = await POST(makePost("/api/accountability", { partnerEmail: EMAIL_A.toUpperCase() }))
      expect(res.status).toBe(400)
    })

    it("returns 200 with generic message when partner email does not exist", async () => {
      const res = await POST(makePost("/api/accountability", { partnerEmail: "nobody@example.com" }))
      // Generic response prevents email enumeration
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.message).toMatch(/registered/)
    })

    it("creates an accountability pair and returns partner name", async () => {
      const res = await POST(makePost("/api/accountability", { partnerEmail: EMAIL_B }))
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.partnerName).toBeTruthy()

      const pair = await prisma.accountabilityPair.findFirst({
        where: { requesterId: ID_A, partnerId: ID_B },
      })
      expect(pair).not.toBeNull()
    })

    it("is idempotent — second link request does not create duplicate", async () => {
      await POST(makePost("/api/accountability", { partnerEmail: EMAIL_B }))
      const res = await POST(makePost("/api/accountability", { partnerEmail: EMAIL_B }))
      expect(res.status).toBe(200)

      const count = await prisma.accountabilityPair.count({
        where: { requesterId: ID_A, partnerId: ID_B },
      })
      expect(count).toBe(1)
    })
  })

  // --- GET /api/accountability ---

  describe("GET /api/accountability", () => {
    it("returns 401 when unauthenticated", async () => {
      setTestUserId(null)
      const res = await GET()
      expect(res.status).toBe(401)
    })

    it("returns partner: null when no pair exists", async () => {
      const res = await GET()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.partner).toBeNull()
    })

    it("returns partner data when a pair exists (requester view)", async () => {
      await prisma.accountabilityPair.create({
        data: { requesterId: ID_A, partnerId: ID_B },
      })

      const res = await GET()
      expect(res.status).toBe(200)
      const body = await res.json()

      expect(body.partner).not.toBeNull()
      expect(body.partner.email).toBe(EMAIL_B)
      expect(body.partner).toHaveProperty("streak")
      expect(body.partner).toHaveProperty("level")
      expect(body.partner).toHaveProperty("totalXP")
      expect(body.partner).toHaveProperty("weeklyBlocks")
      expect(body.partner).toHaveProperty("weeklyGoal")
    })

    it("returns partner data when viewed from partner side", async () => {
      // B linked A
      await prisma.accountabilityPair.create({
        data: { requesterId: ID_B, partnerId: ID_A },
      })

      // A fetches — should still see B as their partner
      const res = await GET()
      const body = await res.json()

      expect(body.partner).not.toBeNull()
      expect(body.partner.email).toBe(EMAIL_B)
    })

    it("calculates partner weekly blocks from last 7 days of logs", async () => {
      await prisma.accountabilityPair.create({
        data: { requesterId: ID_A, partnerId: ID_B },
      })

      // Add 3 daily logs for B within the past 7 days
      for (let i = 0; i < 3; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        d.setHours(0, 0, 0, 0)
        await prisma.dailyLog.create({
          data: { userId: ID_B, date: d, blocksCompleted: 2 },
        })
      }

      const res = await GET()
      const body = await res.json()

      expect(body.partner.weeklyBlocks).toBe(6) // 3 days × 2 blocks
    })

    it("excludes logs older than 7 days from weekly count", async () => {
      await prisma.accountabilityPair.create({
        data: { requesterId: ID_A, partnerId: ID_B },
      })

      // 1 log today and 1 log 8 days ago (outside window)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const old = new Date()
      old.setDate(old.getDate() - 8)
      old.setHours(0, 0, 0, 0)

      await prisma.dailyLog.create({ data: { userId: ID_B, date: today, blocksCompleted: 3 } })
      await prisma.dailyLog.create({ data: { userId: ID_B, date: old, blocksCompleted: 10 } })

      const res = await GET()
      const body = await res.json()

      expect(body.partner.weeklyBlocks).toBe(3)
    })
  })

  // --- DELETE /api/accountability ---

  describe("DELETE /api/accountability", () => {
    it("returns 401 when unauthenticated", async () => {
      setTestUserId(null)
      const res = await DELETE()
      expect(res.status).toBe(401)
    })

    it("removes the accountability pair and returns success", async () => {
      await prisma.accountabilityPair.create({
        data: { requesterId: ID_A, partnerId: ID_B },
      })

      const res = await DELETE()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)

      const pair = await prisma.accountabilityPair.findFirst({
        where: { OR: [{ requesterId: ID_A }, { partnerId: ID_A }] },
      })
      expect(pair).toBeNull()
    })

    it("returns success even when no pair exists", async () => {
      const res = await DELETE()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
    })
  })
})
