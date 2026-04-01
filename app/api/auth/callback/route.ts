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
      // Auto-wire GitHub token for Activity Sync when user signs in with GitHub
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.provider_token && session.user.app_metadata?.provider === "github") {
        const githubUsername = session.user.user_metadata?.user_name as string | undefined
        if (githubUsername) {
          await prisma.user.update({
            where: { id: session.user.id },
            data: { githubUsername, githubAccessToken: session.provider_token },
          }).catch(() => { /* user row may not exist yet on very first login — the next request will upsert it */ })
        }
      }
      return NextResponse.redirect(new URL(next, req.url))
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", req.url))
}
