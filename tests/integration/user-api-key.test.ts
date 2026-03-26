import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest"
import { POST, DELETE } from "@/app/api/user/api-key/route"
import { prisma } from "@/lib/prisma"
import { setTestUserId } from "../setup"
import { createTestUser, deleteTestUser } from "../helpers/test-user"

const ID = "test-user-api-key"

describe("API key routes", () => {
  beforeAll(async () => { await createTestUser(ID) })
  beforeEach(async () => {
    setTestUserId(ID)
    await prisma.user.update({ where: { id: ID }, data: { apiKey: null } })
  })
  afterAll(async () => { await deleteTestUser(ID) })

  // --- POST /api/user/api-key ---

  describe("POST /api/user/api-key", () => {
    it("returns 401 when unauthenticated", async () => {
      setTestUserId(null)
      const res = await POST()
      expect(res.status).toBe(401)
    })

    it("generates an API key with df_ prefix and 32 hex chars", async () => {
      const res = await POST()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.apiKey).toMatch(/^df_[a-f0-9]{32}$/)
    })

    it("persists the generated key in the database", async () => {
      const res = await POST()
      const body = await res.json()
      const user = await prisma.user.findUnique({ where: { id: ID } })
      expect(user!.apiKey).toBe(body.apiKey)
    })

    it("replaces an existing key on a second call", async () => {
      const res1 = await POST()
      const { apiKey: key1 } = await res1.json()
      const res2 = await POST()
      const { apiKey: key2 } = await res2.json()

      expect(key2).not.toBe(key1)
      const user = await prisma.user.findUnique({ where: { id: ID } })
      expect(user!.apiKey).toBe(key2)
    })
  })

  // --- DELETE /api/user/api-key ---

  describe("DELETE /api/user/api-key", () => {
    it("returns 401 when unauthenticated", async () => {
      setTestUserId(null)
      const res = await DELETE()
      expect(res.status).toBe(401)
    })

    it("sets apiKey to null and returns success", async () => {
      // Give the user a key first
      await POST()

      const res = await DELETE()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)

      const user = await prisma.user.findUnique({ where: { id: ID } })
      expect(user!.apiKey).toBeNull()
    })

    it("returns success even when no key was set", async () => {
      const res = await DELETE()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
    })
  })
})
