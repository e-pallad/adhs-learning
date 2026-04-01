import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const nextParam = url.searchParams.get("next") ?? "/dashboard"
  // Prevent open redirect: only allow relative paths
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Auto-wire GitHub token for Activity Sync when user signs in with GitHub.
      // Validate provider_token via the GitHub API to confirm it is a GitHub token
      // (not a token from a different OAuth provider the user may also have linked).
      if (session?.provider_token) {
        const ghRes = await fetch("https://api.github.com/user", {
          headers: { Authorization: `Bearer ${session.provider_token}`, "User-Agent": "Devfluent" },
        }).catch(() => null)
        if (ghRes?.ok) {
          const ghUser = await ghRes.json() as { login?: string }
          const githubUsername = ghUser.login
          const email = session.user.email
          if (githubUsername && email) {
            // upsert: create the row on first-ever login, or update if it already exists
            await prisma.user.upsert({
              where: { id: session.user.id },
              update: { githubUsername, githubAccessToken: session.provider_token },
              create: {
                id: session.user.id,
                email,
                name: (session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? null) as string | null,
                avatarUrl: (session.user.user_metadata?.avatar_url ?? null) as string | null,
                githubUsername,
                githubAccessToken: session.provider_token,
              },
            }).catch((err) => { console.error("[auth/callback] Failed to persist GitHub credentials:", err) })
          }
        }
      }
      return NextResponse.redirect(new URL(next, req.url))
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", req.url))
}
