import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, awardXP, updateStreak, checkAchievements } from "@/lib/user"
import { getBlock } from "@/content/curriculum"
import { XP_VALUES } from "@/lib/xp"
import { canAccessMonth } from "@/lib/plans"

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { blockId, status, minutesSpent, usedTimer } = body

  if (!blockId || !status) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const validStatuses = ["COMPLETED", "SKIPPED", "IN_PROGRESS"]
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const safeMinutes = typeof minutesSpent === "number" && minutesSpent >= 0 ? Math.floor(minutesSpent) : 0

  const block = getBlock(blockId)
  if (!block) return NextResponse.json({ error: "Block not found" }, { status: 404 })

  // Extract month/week — supports "m{month}w{week}-b{n}" and "{track}-m{month}w{week}-b{n}"
  const match = blockId.match(/m(\d+)w(\d+)-/)
  const month = match ? Number(match[1]) : 0
  const week = match ? Number(match[2]) : 0

  if (!canAccessMonth(user, month)) {
    return NextResponse.json({ error: "Upgrade to Pro to access this month" }, { status: 402 })
  }

  const isCompleting = status === "COMPLETED"
  const isSkipping = status === "SKIPPED"

  const xpToAward = isCompleting
    ? usedTimer ? XP_VALUES.COMPLETE_BLOCK_POMODORO : XP_VALUES.COMPLETE_BLOCK
    : isSkipping ? XP_VALUES.SKIP_BLOCK : 0

  // Wrap check + upsert + XP award in a transaction to prevent double-XP under concurrent requests
  const { record, alreadyCompleted, leveledUp, newLevel, newXP } = await prisma.$transaction(async (tx) => {
    const existing = await tx.blockProgress.findUnique({
      where: { userId_blockId: { userId: user.id, blockId } },
    })
    const alreadyCompleted = existing?.status === "COMPLETED"

    const record = await tx.blockProgress.upsert({
      where: { userId_blockId: { userId: user.id, blockId } },
      create: {
        userId: user.id,
        blockId,
        month,
        week,
        status,
        minutesSpent: safeMinutes,
        xpEarned: xpToAward,
        completedAt: isCompleting ? new Date() : null,
      },
      update: {
        status,
        minutesSpent: { increment: safeMinutes },
        completedAt: isCompleting ? new Date() : undefined,
        ...(xpToAward > 0 && !alreadyCompleted ? { xpEarned: xpToAward } : {}),
      },
    })

    let leveledUp = false
    let newLevel = user.level
    let newXP = user.totalXP

    if (xpToAward > 0 && !alreadyCompleted) {
      const result = await awardXP(user.id, xpToAward, { db: tx })
      leveledUp = result.leveledUp
      newLevel = result.newLevel
      newXP = result.newXP
    }

    // Increment blocksCompleted in DailyLog for today when completing a block
    if (isCompleting && !alreadyCompleted) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      await tx.dailyLog.upsert({
        where: { userId_date: { userId: user.id, date: today } },
        create: { userId: user.id, date: today, blocksCompleted: 1 },
        update: { blocksCompleted: { increment: 1 } },
      })
    }

    return { record, alreadyCompleted, leveledUp, newLevel, newXP }
  })

  if (isCompleting && !alreadyCompleted) {
    await updateStreak(user.id)
    await checkAchievements(user.id)
  }

  return NextResponse.json({ success: true, record, leveledUp, newLevel, newXP, xpAwarded: alreadyCompleted ? 0 : xpToAward })
}
