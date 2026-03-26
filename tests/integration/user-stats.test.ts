import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest"
import { GET } from "@/app/api/user/stats/route"
import { prisma } from "@/lib/prisma"
import { setTestUserId } from "../setup"
import { createTestUser, resetTestUser, deleteTestUser } from "../helpers/test-user"

const ID = "test-user-stats"

describe("GET /api/user/stats", () => {
  beforeAll(async () => { await createTestUser(ID) })
  beforeEach(async () => { setTestUserId(ID); await resetTestUser(ID) })
  afterAll(async () => { await deleteTestUser(ID) })

  it("returns 401 when unauthenticated", async () => {
    setTestUserId(null)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it("returns empty stats for a fresh user", async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()

    expect(body.blocks).toEqual([])
    expect(body.roadmap).toEqual([])
    expect(body.courses._count.id).toBe(0)
    expect(body.recentActivity).toEqual([])
    expect(body.achievements).toEqual([])
  })

  it("includes correct user identity and XP fields", async () => {
    const res = await GET()
    const body = await res.json()

    expect(body.user.id).toBe(ID)
    expect(body.user.totalXP).toBe(0)
    expect(body.user.level).toBe(1)
    expect(body.user.streak).toBe(0)
  })

  it("includes XP progress fields from getXPProgress", async () => {
    const res = await GET()
    const body = await res.json()

    expect(body.user).toHaveProperty("currentLevelXP")
    expect(body.user).toHaveProperty("nextLevelXP")
    expect(body.user).toHaveProperty("progress")
  })

  it("groups block progress by status with correct counts", async () => {
    await prisma.blockProgress.createMany({
      data: [
        { userId: ID, blockId: "stats-b1", month: 1, week: 1, status: "COMPLETED" },
        { userId: ID, blockId: "stats-b2", month: 1, week: 1, status: "COMPLETED" },
        { userId: ID, blockId: "stats-b3", month: 1, week: 1, status: "SKIPPED" },
      ],
    })

    const res = await GET()
    const body = await res.json()

    const completed = body.blocks.find((g: { status: string }) => g.status === "COMPLETED")
    const skipped = body.blocks.find((g: { status: string }) => g.status === "SKIPPED")
    expect(completed._count).toBe(2)
    expect(skipped._count).toBe(1)
  })

  it("reflects external course count and XP in courses aggregate", async () => {
    await prisma.externalCourse.createMany({
      data: [
        { userId: ID, title: "Course A", platform: "Udemy", xpEarned: 10 },
        { userId: ID, title: "Course B", platform: "Coursera", xpEarned: 50 },
      ],
    })

    const res = await GET()
    const body = await res.json()

    expect(body.courses._count.id).toBe(2)
    expect(body.courses._sum.xpEarned).toBe(60)
  })

  it("limits recentActivity to 7 most recent daily logs", async () => {
    for (let i = 0; i < 10; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      // Clear time to avoid duplicate date constraint
      d.setHours(0, 0, 0, 0)
      await prisma.dailyLog.create({
        data: { userId: ID, date: d, xpEarned: i * 5 },
      })
    }

    const res = await GET()
    const body = await res.json()

    expect(body.recentActivity).toHaveLength(7)
  })

  it("limits achievements to 5 most recent", async () => {
    for (let i = 0; i < 8; i++) {
      await prisma.achievement.create({
        data: { userId: ID, slug: `stats-ach-${i}`, label: `Achievement ${i}` },
      })
    }

    const res = await GET()
    const body = await res.json()

    expect(body.achievements).toHaveLength(5)
  })
})
