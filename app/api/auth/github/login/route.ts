import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function getAppOrigin(req: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configured) {
    try {
      return new URL(configured).origin
    } catch {
      // Fall through to request origin when env is invalid.
    }
  }

  return req.nextUrl.origin
}

export async function GET(req: NextRequest) {
  const appOrigin = getAppOrigin(req)
  const nextParam = req.nextUrl.searchParams.get("next") ?? "/dashboard"
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard"

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${appOrigin}/api/auth/callback?next=${encodeURIComponent(next)}`,
        scopes: "read:user user:email",
      },
    })

    if (error || !data?.url) {
      console.error("[auth/github/login] Failed to start GitHub OAuth", {
        message: error?.message,
      })
      return NextResponse.redirect(new URL("/login?error=auth", appOrigin))
    }

    return NextResponse.redirect(data.url)
  } catch (err) {
    console.error("[auth/github/login] Unexpected failure", err)
    return NextResponse.redirect(new URL("/login?error=auth", appOrigin))
  }
}
