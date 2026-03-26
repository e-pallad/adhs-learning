import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/user"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const state = crypto.randomUUID()
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`,
    scope: "read:user",
    state,
  })
  const res = NextResponse.redirect(`https://github.com/login/oauth/authorize?${params}`)
  res.cookies.set("github_oauth_state", state, { httpOnly: true, maxAge: 300, path: "/" })
  return res
}
