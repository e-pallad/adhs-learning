import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, awardXP, updateStreak, checkAchievements } from "@/lib/user"
import { getBlock } from "@/content/curriculum"
import { XP_VALUES } from "@/lib/xp"

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { blockId, status, minutesSpent, usedTimer } = body

  if (!blockId || !status) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const block = getBlock(blockId)
  if (!block) return NextResponse.json({ error: "Block not found" }, { status: 404 })

  // Extract month/week from blockId format: m{month}w{week}-b{n}
  const match = blockId.match(/^m(\d+)w(\d+)-/)
  const month = match ? Number(match[1]) : 0
  const week = match ? Number(match[2]) : 0

  const isCompleting = status === "COMPLETED"
  const isSkipping = status === "SKIPPED"

  const xpToAward = isCompleting
    ? usedTimer ? XP_VALUES.COMPLETE_BLOCK_POMODORO : XP_VALUES.COMPLETE_BLOCK
    : isSkipping ? XP_VALUES.SKIP_BLOCK : 0

  // Check if already completed (no double-XP)
  const existing = await prisma.blockProgress.findUnique({
    where: { userId_blockId: { userId: user.id, blockId } },
  })
  const alreadyCompleted = existing?.status === "COMPLETED"

  const record = await prisma.blockProgress.upsert({
    where: { userId_blockId: { userId: user.id, blockId } },
    create: {
      userId: user.id,
      blockId,
      month,
      week,
      status,
      minutesSpent: minutesSpent ?? 0,
      xpEarned: xpToAward,
      completedAt: isCompleting ? new Date() : null,
    },
    update: {
      status,
      minutesSpent: { increment: minutesSpent ?? 0 },
      completedAt: isCompleting ? new Date() : undefined,
    },
  })

  let leveledUp = false
  let newLevel = user.level
  let newXP = user.totalXP

  if (xpToAward > 0 && !alreadyCompleted) {
    const result = await awardXP(user.id, xpToAward)
    leveledUp = result.leveledUp
    newLevel = result.newLevel
    newXP = result.newXP
  }

  if (isCompleting && !alreadyCompleted) {
    await updateStreak(user.id)
    await checkAchievements(user.id)
  }

  return NextResponse.json({ success: true, record, leveledUp, newLevel, newXP, xpAwarded: alreadyCompleted ? 0 : xpToAward })
}
