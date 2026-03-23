import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest"
import { POST } from "@/app/api/progress/roadmap/route"
import { prisma } from "@/lib/prisma"
import { setTestUserId } from "../setup"
import { makePost } from "../helpers/make-request"
import { createTestUser, resetTestUser, deleteTestUser } from "../helpers/test-user"

const ID = "test-user-roadmap"
const ROADMAP = "frontend"
const NODE = "html-basics"

describe("POST /api/progress/roadmap", () => {
  beforeAll(async () => { await createTestUser(ID) })
  beforeEach(async () => { setTestUserId(ID); await resetTestUser(ID) })
  afterAll(async () => { await deleteTestUser(ID) })

  it("returns 401 when unauthenticated", async () => {
    setTestUserId(null)
    const res = await POST(makePost("/api/progress/roadmap", {
      roadmapId: ROADMAP, nodeId: NODE, status: "COMPLETED",
    }))
    expect(res.status).toBe(401)
  })

  it("returns 400 for invalid status", async () => {
    const res = await POST(makePost("/api/progress/roadmap", {
      roadmapId: ROADMAP, nodeId: NODE, status: "INVALID",
    }))
    expect(res.status).toBe(400)
  })

  it("returns 400 when required fields are missing", async () => {
    const res = await POST(makePost("/api/progress/roadmap", { roadmapId: ROADMAP }))
    expect(res.status).toBe(400)
  })

  it("completes a subtopic and awards ROADMAP_SUBTOPIC XP (5)", async () => {
    const res = await POST(makePost("/api/progress/roadmap", {
      roadmapId: ROADMAP, nodeId: NODE, nodeType: "subtopic", status: "COMPLETED",
    }))
    expect(res.status).toBe(200)
    const user = await prisma.user.findUnique({ where: { id: ID } })
    expect(user!.totalXP).toBe(5) // ROADMAP_SUBTOPIC
  })

  it("completes a topic and awards ROADMAP_TOPIC XP (10)", async () => {
    const res = await POST(makePost("/api/progress/roadmap", {
      roadmapId: ROADMAP, nodeId: NODE, nodeType: "topic", status: "COMPLETED",
    }))
    expect(res.status).toBe(200)
    const user = await prisma.user.findUnique({ where: { id: ID } })
    expect(user!.totalXP).toBe(10) // ROADMAP_TOPIC
  })

  it("does NOT re-award XP when completing an already-completed node", async () => {
    await POST(makePost("/api/progress/roadmap", {
      roadmapId: ROADMAP, nodeId: NODE, nodeType: "topic", status: "COMPLETED",
    }))
    await POST(makePost("/api/progress/roadmap", {
      roadmapId: ROADMAP, nodeId: NODE, nodeType: "topic", status: "COMPLETED",
    }))
    const user = await prisma.user.findUnique({ where: { id: ID } })
    expect(user!.totalXP).toBe(10) // Not 20
  })

  it("uses stored nodeType on re-submission to prevent XP manipulation", async () => {
    // First submission: stored as subtopic (5 XP), status NOT_STARTED (no XP yet)
    await POST(makePost("/api/progress/roadmap", {
      roadmapId: ROADMAP, nodeId: NODE, nodeType: "subtopic", status: "NOT_STARTED",
    }))
    // Re-submission: claim nodeType is topic but stored value (subtopic) should be used
    const res = await POST(makePost("/api/progress/roadmap", {
      roadmapId: ROADMAP, nodeId: NODE, nodeType: "topic", status: "COMPLETED",
    }))
    expect(res.status).toBe(200)
    const user = await prisma.user.findUnique({ where: { id: ID } })
    expect(user!.totalXP).toBe(5) // subtopic XP, not topic XP
  })
})
