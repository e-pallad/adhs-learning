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
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Auto-wire GitHub token for Activity Sync when user signs in with GitHub.
      // Check `identities` (not `app_metadata.provider`) so users who originally
      // signed up via email and later link GitHub are also handled correctly.
      const { data: { session } } = await supabase.auth.getSession()
      const identities = (session?.user.identities ?? []) as Array<{ provider: string }>
      const hasGithubIdentity = identities.some((id) => id.provider === "github")
      if (session?.provider_token && hasGithubIdentity) {
        const githubUsername = session.user.user_metadata?.user_name as string | undefined
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
          }).catch(() => { /* no-op — next authenticated request will retry via user upsert */ })
        }
      }
      return NextResponse.redirect(new URL(next, req.url))
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", req.url))
}
