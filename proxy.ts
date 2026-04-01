import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { LOCALE_COOKIE, LOCALES, DEFAULT_LOCALE } from "@/lib/i18n/config"

const PUBLIC_PATHS = ["/", "/login", "/api/auth", "/impressum", "/datenschutz", "/offline", "/sw.js", "/manifest.webmanifest"]

function detectLocale(req: NextRequest): string {
  const accept = req.headers.get("accept-language") ?? ""
  for (const part of accept.split(",")) {
    const lang = part.trim().split(";")[0].trim().split("-")[0].toLowerCase()
    if ((LOCALES as readonly string[]).includes(lang)) return lang
  }
  return DEFAULT_LOCALE
}

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Ensure getLocale() sees the correct locale during this request.
  // Writing to req.cookies propagates into the cookies() store used by server
  // components, so first-time visitors get the right locale on the first render
  // (not only after a subsequent request when the browser sends the cookie back).
  const needsLocaleCookie = !req.cookies.get(LOCALE_COOKIE)
  if (needsLocaleCookie) {
    req.cookies.set(LOCALE_COOKIE, detectLocale(req))
  }

  // Allow public paths (exact match for "/" to avoid bypassing all auth)
  if (PUBLIC_PATHS.some((p) => p === "/" ? pathname === "/" : pathname.startsWith(p))) {
    const res = NextResponse.next()
    if (needsLocaleCookie) {
      res.cookies.set(LOCALE_COOKIE, req.cookies.get(LOCALE_COOKIE)!.value, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      })
    }
    return res
  }

  const res = NextResponse.next()

  if (needsLocaleCookie) {
    res.cookies.set(LOCALE_COOKIE, req.cookies.get(LOCALE_COOKIE)!.value, {
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
