import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { partnerEmail } = await req.json() as { partnerEmail?: string }
  if (!partnerEmail || typeof partnerEmail !== "string") {
    return NextResponse.json({ error: "partnerEmail required" }, { status: 400 })
  }

  // Prevent self-linking
  if (partnerEmail.toLowerCase() === user.email.toLowerCase()) {
    return NextResponse.json({ error: "Cannot partner with yourself" }, { status: 400 })
  }

  const partner = await prisma.user.findUnique({ where: { email: partnerEmail.toLowerCase() } })
  if (!partner) {
    // Generic message prevents email enumeration
    return NextResponse.json({ error: "If that email is registered, an invitation has been sent." }, { status: 200 })
  }

  // Upsert both directions
  await prisma.accountabilityPair.upsert({
    where: { requesterId_partnerId: { requesterId: user.id, partnerId: partner.id } },
    create: { requesterId: user.id, partnerId: partner.id },
    update: {},
  })

  return NextResponse.json({ success: true, partnerName: partner.name ?? partner.email })
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Find partner (sent or received)
  const pair = await prisma.accountabilityPair.findFirst({
    where: { OR: [{ requesterId: user.id }, { partnerId: user.id }] },
    include: {
      requester: { select: { id: true, name: true, email: true, streak: true, level: true, totalXP: true, weeklyGoalBlocks: true, dailyGoalBlocks: true } },
      partner:   { select: { id: true, name: true, email: true, streak: true, level: true, totalXP: true, weeklyGoalBlocks: true, dailyGoalBlocks: true } },
    },
  })

  if (!pair) return NextResponse.json({ partner: null })

  const partnerUser = pair.requesterId === user.id ? pair.partner : pair.requester

  // Get partner's weekly blocks
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)
  const partnerLogs = await prisma.dailyLog.findMany({
    where: { userId: partnerUser.id, date: { gte: sevenDaysAgo } },
  })
  const partnerWeeklyBlocks = partnerLogs.reduce((s, l) => s + l.blocksCompleted, 0)

  return NextResponse.json({
    partner: {
      name: partnerUser.name,
      email: partnerUser.email,
      streak: partnerUser.streak,
      level: partnerUser.level,
      totalXP: partnerUser.totalXP,
      weeklyBlocks: partnerWeeklyBlocks,
      weeklyGoal: partnerUser.weeklyGoalBlocks,
    }
  })
}

export async function DELETE() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await prisma.accountabilityPair.deleteMany({
    where: { OR: [{ requesterId: user.id }, { partnerId: user.id }] },
  })
  return NextResponse.json({ success: true })
}
