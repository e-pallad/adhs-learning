import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  // Unauthorized — redirect to login (OAuth callback cannot return 401, must redirect)
  if (!user) return NextResponse.redirect(new URL("/login", req.url))

  const { searchParams } = req.nextUrl
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const storedState = req.cookies.get("github_oauth_state")?.value

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL("/settings?error=github_auth_failed", req.url))
  }

  // Exchange code for token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`,
    }),
  })
  const tokenData = await tokenRes.json() as { access_token?: string }
  const accessToken = tokenData.access_token
  if (!accessToken) {
    return NextResponse.redirect(new URL("/settings?error=github_token_failed", req.url))
  }

  // Fetch GitHub username
  const ghUserRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": "Devfluent" },
  })
  const ghUser = await ghUserRes.json() as { login?: string }
  const githubUsername = ghUser.login
  if (!githubUsername) {
    return NextResponse.redirect(new URL("/settings?error=github_user_failed", req.url))
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { githubUsername, githubAccessToken: accessToken },
  })

  const res = NextResponse.redirect(new URL("/settings?github=connected", req.url))
  res.cookies.delete("github_oauth_state")
  return res
}
