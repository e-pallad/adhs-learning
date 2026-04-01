import { createServerClient } from "@supabase/ssr"
import type { NextRequest } from "next/server"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component — cookies can't be set
          }
        },
      },
    }
  )
}

/**
 * Creates a Supabase client scoped to an incoming NextRequest, collecting any
 * cookies the SDK wants to set into `pendingCookies` so the caller can apply
 * them directly to a manually-constructed NextResponse (e.g. a redirect).
 *
 * This is intentionally a synchronous factory — unlike createClient() it does
 * not need next/headers and is therefore safe to use in Route Handlers that
 * return custom NextResponse objects.
 */
export function createCallbackClient(
  req: NextRequest,
  pendingCookies: Array<{ name: string; value: string; options: Record<string, unknown> }>
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          pendingCookies.push(...(cookiesToSet as typeof pendingCookies))
        },
      },
    }
  )
}
