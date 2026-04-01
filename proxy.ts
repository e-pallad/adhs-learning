import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

const PUBLIC_PATHS = ["/", "/login", "/api/auth", "/impressum", "/datenschutz", "/offline", "/sw.js", "/manifest.webmanifest"]

const LOCALE_COOKIE = "NEXT_LOCALE"
const SUPPORTED_LOCALES = ["en", "de"]

function detectLocale(req: NextRequest): string {
  const accept = req.headers.get("accept-language") ?? ""
  for (const part of accept.split(",")) {
    const lang = part.trim().split(";")[0].trim().split("-")[0].toLowerCase()
    if (SUPPORTED_LOCALES.includes(lang)) return lang
  }
  return "en"
}

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Allow public paths (exact match for "/" to avoid bypassing all auth)
  if (PUBLIC_PATHS.some((p) => p === "/" ? pathname === "/" : pathname.startsWith(p))) {
    const res = NextResponse.next()
    // Auto-set locale cookie on first visit if not already set
    if (!req.cookies.get(LOCALE_COOKIE)) {
      res.cookies.set(LOCALE_COOKIE, detectLocale(req), {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      })
    }
    return res
  }

  const res = NextResponse.next()

  // Auto-set locale cookie if not already set
  if (!req.cookies.get(LOCALE_COOKIE)) {
    res.cookies.set(LOCALE_COOKIE, detectLocale(req), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    })
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            res.cookies.set(name, value, {
              ...options,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            })
          })
        },
      },
    }
  )

  let user
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (!user) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return res
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
