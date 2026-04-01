import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

async function persistGithubCredentials(args: {
  userId: string
  email: string
  name: string | null
  avatarUrl: string | null
  githubUsername: string
  githubAccessToken: string
}) {
  // Optional enhancement only: never block auth callback on DB/env issues.
  if (!process.env.DATABASE_URL) return

  try {
    const { prisma } = await import("@/lib/prisma")
    await prisma.user.upsert({
      where: { id: args.userId },
      update: {
        githubUsername: args.githubUsername,
        githubAccessToken: args.githubAccessToken,
      },
      create: {
        id: args.userId,
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
        githubUsername: args.githubUsername,
        githubAccessToken: args.githubAccessToken,
      },
    })
  } catch (err) {
    console.error("[auth/callback] Failed to persist GitHub credentials:", err)
  }
}

export async function GET(req: NextRequest) {
  const reqId = crypto.randomUUID().slice(0, 8)
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const nextParam = url.searchParams.get("next") ?? "/dashboard"
  const envSnapshot = {
    hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasSupabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    nodeEnv: process.env.NODE_ENV ?? "unknown",
  }
  // Prevent open redirect: only allow relative paths
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard"

  try {
    if (code) {
      const supabase = await createClient()
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        // Auto-wire GitHub token for Activity Sync when user signs in with GitHub.
        // Validate provider_token via the GitHub API to confirm it is a GitHub token
        // (not a token from a different OAuth provider the user may also have linked).
        if (session?.provider_token) {
          const abort = new AbortController()
          const timeout = setTimeout(() => abort.abort(), 5000)
          const ghRes = await fetch("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${session.provider_token}`, "User-Agent": "Devfluent" },
            signal: abort.signal,
          }).catch(() => null).finally(() => clearTimeout(timeout))
          if (ghRes?.ok) {
            const ghUser = await ghRes.json() as { login?: string }
            const githubUsername = ghUser.login
            const email = session.user.email
            if (githubUsername && email) {
              await persistGithubCredentials({
                userId: session.user.id,
                email,
                name: (session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? null) as string | null,
                avatarUrl: (session.user.user_metadata?.avatar_url ?? null) as string | null,
                githubUsername,
                githubAccessToken: session.provider_token,
              })
            }
          } else {
            console.warn(`[auth/callback:${reqId}] provider_token did not resolve to GitHub user`)
          }
        }
        console.info(`[auth/callback:${reqId}] Auth callback success`, {
          hasSession: Boolean(session),
          hasProviderToken: Boolean(session?.provider_token),
          next,
        })
        return NextResponse.redirect(new URL(next, req.url))
      }

      console.error(`[auth/callback:${reqId}] exchangeCodeForSession failed`, {
        message: error.message,
        status: error.status,
        env: envSnapshot,
      })
    } else {
      console.warn(`[auth/callback:${reqId}] Missing code query parameter`)
    }
  } catch (err) {
    console.error(`[auth/callback:${reqId}] Unexpected callback failure`, {
      error: err,
      env: envSnapshot,
      hasCode: Boolean(code),
      next,
    })
  }

  return NextResponse.redirect(new URL("/login?error=auth", req.url))
}
