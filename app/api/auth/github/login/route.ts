import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

function getAppOrigin(req: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configured) {
    try {
      return new URL(configured).origin
    } catch {
      // Fall through to header-based origin.
    }
  }

  // In production the app sits behind a TLS-terminating reverse proxy.
  // req.nextUrl.origin resolves to http:// when the inner proxy ($scheme)
  // sees HTTP — which breaks Supabase's redirect_to allowlist check.
  // Derive the origin from forwarded headers instead so it is always https.
  if (process.env.NODE_ENV === "production") {
    const host =
      req.headers.get("x-forwarded-host")?.split(",")[0].trim() ??
      req.headers.get("host")
    if (host) return `https://${host}`
  }

  return req.nextUrl.origin
}

export async function GET(req: NextRequest) {
  const appOrigin = getAppOrigin(req)
  const nextParam = req.nextUrl.searchParams.get("next") ?? "/dashboard"
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard"

  try {
    // Collect cookies explicitly so they land on the redirect response.
    // Relying on cookies() from next/headers with NextResponse.redirect() can
    // silently drop Set-Cookie headers (Next.js does not merge them into a
    // custom Response object). Using the same pattern as proxy.ts instead.
    const cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cs) {
            cs.forEach(({ name, value }) => req.cookies.set(name, value))
            cookiesToSet.push(...cs)
          },
        },
      }
    )

    const redirectTo = `${appOrigin}/api/auth/callback?next=${encodeURIComponent(next)}`
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo,
        scopes: "read:user user:email",
      },
    })

    if (error || !data?.url) {
      console.error("[auth/github/login] Failed to start GitHub OAuth", {
        message: error?.message,
        appOrigin,
      })
      return NextResponse.redirect(new URL("/login?error=auth", appOrigin))
    }

    console.info("[auth/github/login] Starting OAuth flow", {
      appOrigin,
      redirectTo,
      pkceVerifierCookieSet: cookiesToSet.some((c) => c.name.endsWith("-code-verifier")),
    })

    const response = NextResponse.redirect(data.url)
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, {
        ...(options as Parameters<typeof response.cookies.set>[2]),
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
    })
    return response
  } catch (err) {
    console.error("[auth/github/login] Unexpected failure", err)
    return NextResponse.redirect(new URL("/login?error=auth", appOrigin))
  }
}
