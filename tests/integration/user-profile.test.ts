import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest"
import { PATCH } from "@/app/api/user/profile/route"
import { prisma } from "@/lib/prisma"
import { setTestUserId } from "../setup"
import { makePatch } from "../helpers/make-request"
import { createTestUser, resetTestUser, deleteTestUser } from "../helpers/test-user"

const ID = "test-user-profile"

describe("PATCH /api/user/profile", () => {
  beforeAll(async () => { await createTestUser(ID) })
  beforeEach(async () => { setTestUserId(ID); await resetTestUser(ID) })
  afterAll(async () => { await deleteTestUser(ID) })

  it("returns 401 when unauthenticated", async () => {
    setTestUserId(null)
    const res = await PATCH(makePatch("/api/user/profile", { name: "Alice" }))
    expect(res.status).toBe(401)
  })

  it("updates the user name", async () => {
    const res = await PATCH(makePatch("/api/user/profile", { name: "Alice" }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.name).toBe("Alice")
    const user = await prisma.user.findUnique({ where: { id: ID } })
    expect(user!.name).toBe("Alice")
  })

  it("accepts null to clear the name", async () => {
    await PATCH(makePatch("/api/user/profile", { name: "Alice" }))
    const res = await PATCH(makePatch("/api/user/profile", { name: null }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.name).toBeNull()
  })

  it("returns 400 when name exceeds 100 characters", async () => {
    const longName = "a".repeat(101)
    const res = await PATCH(makePatch("/api/user/profile", { name: longName }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/100/)
  })

  it("returns 400 when name is a non-string (number)", async () => {
    const res = await PATCH(makePatch("/api/user/profile", { name: 42 }))
    expect(res.status).toBe(400)
  })

  it("accepts exactly 100-character name", async () => {
    const maxName = "a".repeat(100)
    const res = await PATCH(makePatch("/api/user/profile", { name: maxName }))
    expect(res.status).toBe(200)
  })
})
