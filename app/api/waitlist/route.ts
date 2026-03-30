import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  let email: string
  try {
    const body = await req.json()
    email = (body.email ?? "").trim().toLowerCase()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 })
  }

  if (email.length > 254) {
    return NextResponse.json({ error: "Email too long" }, { status: 400 })
  }

  try {
    await prisma.waitlistEntry.create({ data: { id: crypto.randomUUID(), email } })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    // Unique constraint violation — already on the list
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ success: true, alreadyRegistered: true })
    }
    console.error("[waitlist] insert error", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
