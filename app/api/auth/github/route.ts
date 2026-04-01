import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/user"

function getAppOrigin(req: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configured) {
    try {
      return new URL(configured).origin
    } catch {
      // Fall through to request origin when env is invalid.
    }
  }
  // Do not trust forwarded headers — they can be client-influenced in pass-through
  // proxy configurations. NEXT_PUBLIC_APP_URL must be set in production.
  return req.nextUrl.origin
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const appOrigin = getAppOrigin(req)
  const state = crypto.randomUUID()
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: `${appOrigin}/api/auth/github/callback`,
    scope: "read:user",
    state,
  })
  const res = NextResponse.redirect(`https://github.com/login/oauth/authorize?${params}`)
  res.cookies.set("github_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  })
  return res
}
