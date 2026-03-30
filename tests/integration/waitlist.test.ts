import { describe, it, expect, afterEach } from "vitest"
import { POST } from "@/app/api/waitlist/route"
import { prisma } from "@/lib/prisma"
import { makePost } from "../helpers/make-request"

const TEST_EMAIL = "waitlist-test@test.devfluent"

afterEach(async () => {
  await prisma.waitlistEntry.deleteMany({ where: { email: TEST_EMAIL } })
})

describe("POST /api/waitlist", () => {
  it("returns 400 when email is missing", async () => {
    const res = await POST(makePost("/api/waitlist", {}))
    expect(res.status).toBe(400)
  })

  it("returns 400 when email is invalid", async () => {
    const res = await POST(makePost("/api/waitlist", { email: "not-an-email" }))
    expect(res.status).toBe(400)
  })

  it("returns 400 when email exceeds 254 chars", async () => {
    const longEmail = `${"a".repeat(250)}@b.co`
    const res = await POST(makePost("/api/waitlist", { email: longEmail }))
    expect(res.status).toBe(400)
  })

  it("registers a new email and returns success", async () => {
    const res = await POST(makePost("/api/waitlist", { email: TEST_EMAIL }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)

    const entry = await prisma.waitlistEntry.findUnique({ where: { email: TEST_EMAIL } })
    expect(entry).not.toBeNull()
  })

  it("normalises email to lowercase before storing", async () => {
    const res = await POST(makePost("/api/waitlist", { email: TEST_EMAIL.toUpperCase() }))
    expect(res.status).toBe(200)

    const entry = await prisma.waitlistEntry.findUnique({ where: { email: TEST_EMAIL } })
    expect(entry).not.toBeNull()
  })

  it("returns success with alreadyRegistered when email is already on the list", async () => {
    await POST(makePost("/api/waitlist", { email: TEST_EMAIL }))
    const res = await POST(makePost("/api/waitlist", { email: TEST_EMAIL }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.alreadyRegistered).toBe(true)
  })
})
