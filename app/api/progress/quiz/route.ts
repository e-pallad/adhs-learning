import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, awardXP, checkAchievements } from "@/lib/user"
import { XP_VALUES } from "@/lib/xp"
import { getBlock } from "@/content/curriculum"

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { blockId, score, answers } = body

  if (!blockId || typeof blockId !== "string") {
    return NextResponse.json({ error: "blockId must be a non-empty string" }, { status: 400 })
  }

  const block = getBlock(blockId)
  if (!block) return NextResponse.json({ error: "Block not found" }, { status: 404 })

  if (typeof score !== "number" || !Number.isInteger(score) || score < 0 || score > 100) {
    return NextResponse.json({ error: "score must be an integer between 0 and 100" }, { status: 400 })
  }

  // answers is optional metadata — accept any record or undefined
  const safeAnswers = answers !== undefined ? answers : {}
  void safeAnswers // stored for future use; not persisted in this model yet

  const passed = score >= 70
  const perfect = score === 100

  // XP stacks: always award try XP; add pass and/or perfect bonuses on top
  let xpToAward = XP_VALUES.QUIZ_TRY
  if (passed) xpToAward += XP_VALUES.QUIZ_PASS
  if (perfect) xpToAward += XP_VALUES.QUIZ_PERFECT

  const { attempt, leveledUp, newLevel, newXP } = await prisma.$transaction(async (tx) => {
    const attempt = await tx.quizAttempt.create({
      data: {
        userId: user.id,
        blockId,
        score,
        passed,
        perfect,
        xpEarned: xpToAward,
      },
    })

    const result = await awardXP(user.id, xpToAward, { db: tx })

    return { attempt, leveledUp: result.leveledUp, newLevel: result.newLevel, newXP: result.newXP }
  })

  const unlockedAchievements = await checkAchievements(user.id)

  return NextResponse.json({
    xpEarned: xpToAward,
    passed,
    perfect,
    leveledUp,
    newLevel,
    newXP,
    attempt,
    achievements: unlockedAchievements,
  })
}
