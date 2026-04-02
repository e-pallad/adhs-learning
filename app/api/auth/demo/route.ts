import { NextResponse } from "next/server"
import { DEMO_SESSION_COOKIE } from "@/lib/demo"

const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(DEMO_SESSION_COOKIE, "1", {
    httpOnly: true,
    path: "/",
    maxAge: ONE_WEEK_SECONDS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(DEMO_SESSION_COOKIE)
  return response
}
