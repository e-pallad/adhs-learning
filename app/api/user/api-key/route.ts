import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"

// Generate a new API key
export async function POST() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const apiKey = `df_${crypto.randomUUID().replace(/-/g, "")}`
  await prisma.user.update({ where: { id: user.id }, data: { apiKey } })
  return NextResponse.json({ apiKey })
}

// Revoke API key
export async function DELETE() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await prisma.user.update({ where: { id: user.id }, data: { apiKey: null } })
  return NextResponse.json({ success: true })
}
