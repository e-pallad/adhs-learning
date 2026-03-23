import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name } = body

  if (name !== undefined && name !== null && (typeof name !== "string" || name.length > 100)) {
    return NextResponse.json({ error: "Name must be a string of 100 characters or fewer" }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name: name ?? null },
  })

  return NextResponse.json({ success: true, name: updated.name })
}
