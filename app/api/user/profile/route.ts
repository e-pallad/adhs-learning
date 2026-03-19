import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name } = body

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name: name ?? null },
  })

  return NextResponse.json({ success: true, name: updated.name })
}
