import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"

function getAppOrigin(req: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configured) {
    try {
      return new URL(configured).origin
    } catch {
      // Fall through to forwarded/request origin when env is invalid.
    }
  }

  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
  if (forwardedHost) {
    const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https"
    return `${forwardedProto}://${forwardedHost}`
  }

  return req.nextUrl.origin
}

export async function GET(req: NextRequest) {
  const appOrigin = getAppOrigin(req)
  const user = await getCurrentUser()
  // Unauthorized — redirect to login (OAuth callback cannot return 401, must redirect)
  if (!user) return NextResponse.redirect(new URL("/login", appOrigin))

  const { searchParams } = req.nextUrl
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const storedState = req.cookies.get("github_oauth_state")?.value

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL("/settings?error=github_auth_failed", appOrigin))
  }

  // Exchange code for token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${appOrigin}/api/auth/github/callback`,
    }),
  })
  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/settings?error=github_token_failed", appOrigin))
  }
  const tokenData = await tokenRes.json() as { access_token?: string }
  const accessToken = tokenData.access_token
  if (!accessToken) {
    return NextResponse.redirect(new URL("/settings?error=github_token_failed", appOrigin))
  }

  // Fetch GitHub username
  const ghUserRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": "Devfluent" },
  })
  if (!ghUserRes.ok) {
    return NextResponse.redirect(new URL("/settings?error=github_user_failed", appOrigin))
  }
  const ghUser = await ghUserRes.json() as { login?: string }
  const githubUsername = ghUser.login
  if (!githubUsername) {
    return NextResponse.redirect(new URL("/settings?error=github_user_failed", appOrigin))
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { githubUsername, githubAccessToken: accessToken },
  })

  const res = NextResponse.redirect(new URL("/settings?github=connected", appOrigin))
  res.cookies.delete("github_oauth_state")
  return res
}
