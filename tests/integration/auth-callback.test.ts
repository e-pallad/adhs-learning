import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from "vitest"
import { GET } from "@/app/api/auth/callback/route"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { createTestUser, deleteTestUser } from "../helpers/test-user"

const ID = "test-user-auth-callback"

function makeGET(code: string | null, next?: string) {
  const url = new URL("http://localhost/api/auth/callback")
  if (code) url.searchParams.set("code", code)
  if (next) url.searchParams.set("next", next)
  return new NextRequest(url)
}

type MockOpts = {
  exchangeError?: boolean
  providerToken?: string | null
  identities?: Array<{ provider: string }>
  userId?: string
  email?: string
  userName?: string
}

function mockSupabaseClient(opts: MockOpts) {
  const user = {
    id: opts.userId ?? ID,
    email: opts.email ?? `${opts.userId ?? ID}@test.devfluent`,
    app_metadata: {},
    user_metadata: {
      user_name: opts.userName ?? null,
      full_name: "Test User",
      avatar_url: null,
    },
    identities: opts.identities ?? [],
  }
  return {
    auth: {
      getUser: vi.fn(async () => ({ data: { user } })),
      exchangeCodeForSession: vi.fn(async () => ({
        error: opts.exchangeError ? { message: "invalid_grant" } : null,
      })),
      getSession: vi.fn(async () => ({
        data: {
          session: opts.exchangeError
            ? null
            : { provider_token: opts.providerToken ?? null, user },
        },
      })),
    },
  }
}

describe("GET /api/auth/callback", () => {
  beforeAll(async () => { await createTestUser(ID) })
  beforeEach(async () => {
    await prisma.user.update({
      where: { id: ID },
      data: { githubUsername: null, githubAccessToken: null },
    })
  })
  afterAll(async () => { await deleteTestUser(ID) })

  // ─── redirect logic ────────────────────────────────────────────────────────

  it("redirects to /login?error=auth when no code param", async () => {
    const res = await GET(makeGET(null))
    expect(res.status).toBe(307)
    expect(res.headers.get("location")).toContain("/login?error=auth")
  })

  it("redirects to /login?error=auth when code exchange fails", async () => {
    vi.mocked(createClient).mockImplementationOnce(
      async () => mockSupabaseClient({ exchangeError: true }) as unknown as ReturnType<typeof createClient>
    )
    const res = await GET(makeGET("bad-code"))
    expect(res.status).toBe(307)
    expect(res.headers.get("location")).toContain("/login?error=auth")
  })

  it("redirects to /dashboard by default on success", async () => {
    vi.mocked(createClient).mockImplementationOnce(
      async () => mockSupabaseClient({}) as unknown as ReturnType<typeof createClient>
    )
    const res = await GET(makeGET("valid-code"))
    expect(res.status).toBe(307)
    expect(res.headers.get("location")).toMatch(/\/dashboard$/)
  })

  it("honours a safe relative `next` param", async () => {
    vi.mocked(createClient).mockImplementationOnce(
      async () => mockSupabaseClient({}) as unknown as ReturnType<typeof createClient>
    )
    const res = await GET(makeGET("valid-code", "/learning"))
    expect(res.headers.get("location")).toContain("/learning")
  })

  it("blocks open redirect: //evil.com falls back to /dashboard", async () => {
    vi.mocked(createClient).mockImplementationOnce(
      async () => mockSupabaseClient({}) as unknown as ReturnType<typeof createClient>
    )
    const res = await GET(makeGET("valid-code", "//evil.com"))
    expect(res.headers.get("location")).toMatch(/\/dashboard$/)
  })

  // ─── GitHub credential upsert ──────────────────────────────────────────────

  it("does NOT upsert credentials when provider_token is absent (email login)", async () => {
    vi.mocked(createClient).mockImplementationOnce(
      async () => mockSupabaseClient({ providerToken: null }) as unknown as ReturnType<typeof createClient>
    )
    await GET(makeGET("valid-code"))
    const user = await prisma.user.findUnique({ where: { id: ID } })
    expect(user!.githubAccessToken).toBeNull()
  })

  it("does NOT upsert credentials when no GitHub identity exists", async () => {
    vi.mocked(createClient).mockImplementationOnce(
      async () => mockSupabaseClient({
        providerToken: "some-token",
        identities: [{ provider: "email" }],
      }) as unknown as ReturnType<typeof createClient>
    )
    await GET(makeGET("valid-code"))
    const user = await prisma.user.findUnique({ where: { id: ID } })
    expect(user!.githubAccessToken).toBeNull()
  })

  it("upserts credentials when GitHub is the only identity (first-time signup)", async () => {
    vi.mocked(createClient).mockImplementationOnce(
      async () => mockSupabaseClient({
        identities: [{ provider: "github" }],
        providerToken: "gh-token-signup",
        userName: "octocat",
      }) as unknown as ReturnType<typeof createClient>
    )
    await GET(makeGET("valid-code"))
    const user = await prisma.user.findUnique({ where: { id: ID } })
    expect(user!.githubAccessToken).toBe("gh-token-signup")
    expect(user!.githubUsername).toBe("octocat")
  })

  it("upserts credentials for email user who linked GitHub (regression: app_metadata.provider was checked)", async () => {
    // This was the bug: user originally signed up with email so app_metadata.provider = "email",
    // but they have a GitHub identity linked. Old code would skip the upsert.
    vi.mocked(createClient).mockImplementationOnce(
      async () => mockSupabaseClient({
        identities: [{ provider: "email" }, { provider: "github" }],
        providerToken: "gh-token-linked",
        userName: "octocat-linked",
      }) as unknown as ReturnType<typeof createClient>
    )
    await GET(makeGET("valid-code"))
    const user = await prisma.user.findUnique({ where: { id: ID } })
    expect(user!.githubAccessToken).toBe("gh-token-linked")
    expect(user!.githubUsername).toBe("octocat-linked")
  })

  it("creates a new User row on first-ever GitHub login (upsert create path)", async () => {
    const NEW_ID = "test-user-auth-callback-new"
    try {
      vi.mocked(createClient).mockImplementationOnce(
        async () => mockSupabaseClient({
          userId: NEW_ID,
          email: `${NEW_ID}@test.devfluent`,
          identities: [{ provider: "github" }],
          providerToken: "gh-new-token",
          userName: "newdev",
        }) as unknown as ReturnType<typeof createClient>
      )
      await GET(makeGET("valid-code"))
      const user = await prisma.user.findUnique({ where: { id: NEW_ID } })
      expect(user).not.toBeNull()
      expect(user!.githubUsername).toBe("newdev")
      expect(user!.githubAccessToken).toBe("gh-new-token")
    } finally {
      await prisma.user.deleteMany({ where: { id: NEW_ID } })
    }
  })

  it("does NOT upsert when githubUsername is absent from user_metadata", async () => {
    vi.mocked(createClient).mockImplementationOnce(
      async () => mockSupabaseClient({
        identities: [{ provider: "github" }],
        providerToken: "gh-token-no-name",
        userName: undefined, // GitHub returned no login
      }) as unknown as ReturnType<typeof createClient>
    )
    await GET(makeGET("valid-code"))
    const user = await prisma.user.findUnique({ where: { id: ID } })
    expect(user!.githubAccessToken).toBeNull()
  })
})
