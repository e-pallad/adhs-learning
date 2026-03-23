import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const nextParam = url.searchParams.get("next") ?? "/"
  // Prevent open redirect: only allow relative paths
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(next, req.url))
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", req.url))
}
