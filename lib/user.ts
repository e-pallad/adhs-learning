import { startOfDay, differenceInCalendarDays } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { PrismaClient } from "@/app/generated/prisma/client"
import { getLevelFromXP, ACHIEVEMENT_DEFINITIONS, XP_VALUES } from "@/lib/xp"

// Accepts either the full PrismaClient or a transaction client
type DbClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">

/**
 * Gets the current authenticated user's database record.
 * Creates it if it doesn't exist yet (first login).
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  // upsert prevents unique constraint errors when concurrent requests race on first login
  const user = await prisma.user.upsert({
    where: { id: authUser.id },
    update: {},
    create: {
      id: authUser.id,
      email: authUser.email!,
      name: authUser.user_metadata?.name ?? null,
      avatarUrl: authUser.user_metadata?.avatar_url ?? null,
    },
  })

  return user
}

/**
 * Award the 5 XP daily login bonus — idempotent, at most once per calendar day.
 * Safe to call on every dashboard load.
 */
export async function awardDailyLoginXP(userId: string): Promise<void> {
  const today = new Date()
  const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  // Only award if there is no log entry for today yet
  const existing = await prisma.dailyLog.findUnique({
    where: { userId_date: { userId, date: dateOnly } },
  })
  if (!existing) {
    await awardXP(userId, XP_VALUES.DAILY_LOGIN)
  }
}

/**
 * Award XP to a user and recalculate level.
 * Returns the updated user and whether they leveled up.
 */
export async function awardXP(
  userId: string,
  amount: number,
  context: { date?: Date; db?: DbClient } = {}
): Promise<{ leveledUp: boolean; newLevel: number; newXP: number }> {
  const db = context.db ?? prisma
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error("User not found")

  const newXP = user.totalXP + amount
  const newLevel = getLevelFromXP(newXP)
  const leveledUp = newLevel > user.level

  await db.user.update({
    where: { id: userId },
    data: { totalXP: newXP, level: newLevel },
  })

  // Update or create today's daily log
  const today = context.date ?? new Date()
  const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  await db.dailyLog.upsert({
    where: { userId_date: { userId, date: dateOnly } },
    create: { userId, date: dateOnly, xpEarned: amount },
    update: { xpEarned: { increment: amount } },
  })

  return { leveledUp, newLevel, newXP }
}

/**
 * Update streak: call once per day on any meaningful action.
 * Returns new streak value.
 */
export async function updateStreak(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error("User not found")

  const today = startOfDay(new Date())
  const lastSeen = user.lastSeenAt ? startOfDay(new Date(user.lastSeenAt)) : null

  let newStreak = user.streak

  if (!lastSeen) {
    newStreak = 1
  } else {
    const daysDiff = differenceInCalendarDays(today, lastSeen)
    if (daysDiff === 0) {
      // Already logged today — no change
      return user.streak
    } else if (daysDiff === 1) {
      // Consecutive day
      newStreak = user.streak + 1
    } else {
      // Gap — reset
      newStreak = 1
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { streak: newStreak, lastSeenAt: new Date() },
  })

  // Streak bonuses — only award once per streak cycle (exact milestone, not re-award on re-reach)
  // Check via achievement record to prevent farming by breaking and rebuilding streak
  if (newStreak === 7) {
    const alreadyAwarded = await prisma.achievement.findFirst({ where: { userId, slug: "streak_bonus_7" } })
    if (!alreadyAwarded) {
      await prisma.achievement.create({ data: { userId, slug: "streak_bonus_7", label: "7-Day Streak Bonus", description: "Bonus XP for a 7-day streak", icon: "🔥", xpBonus: XP_VALUES.STREAK_BONUS_7 } })
      await awardXP(userId, XP_VALUES.STREAK_BONUS_7)
    }
  } else if (newStreak === 30) {
    const alreadyAwarded = await prisma.achievement.findFirst({ where: { userId, slug: "streak_bonus_30" } })
    if (!alreadyAwarded) {
      await prisma.achievement.create({ data: { userId, slug: "streak_bonus_30", label: "30-Day Streak Bonus", description: "Bonus XP for a 30-day streak", icon: "⚡", xpBonus: XP_VALUES.STREAK_BONUS_30 } })
      await awardXP(userId, XP_VALUES.STREAK_BONUS_30)
    }
  }

  return newStreak
}

/**
 * Check and unlock any newly earned achievements.
 */
export async function checkAchievements(userId: string): Promise<string[]> {
  const [user, existingAchievements, projects, blocks, quizAttempts, quizzesPassed, perfectQuizzes] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.achievement.findMany({ where: { userId }, select: { slug: true } }),
    prisma.monthlyProject.count({ where: { userId, status: "COMPLETED" } }),
    prisma.blockProgress.count({ where: { userId, status: "COMPLETED" } }),
    prisma.quizAttempt.count({ where: { userId } }),
    prisma.quizAttempt.count({ where: { userId, passed: true } }),
    prisma.quizAttempt.count({ where: { userId, perfect: true } }),
  ])

  if (!user) return []

  const existingSlugs = new Set(existingAchievements.map((a) => a.slug))
  const stats = {
    streak: user.streak,
    level: user.level,
    totalXP: user.totalXP,
    projectsCompleted: projects,
    blocksCompleted: blocks,
    quizAttempts,
    quizzesPassed,
    perfectQuizzes,
  }

  const toUnlock = ACHIEVEMENT_DEFINITIONS.filter(
    (def) => !existingSlugs.has(def.slug) && def.check(stats)
  )

  if (toUnlock.length === 0) return []

  // skipDuplicates prevents unique constraint errors from concurrent calls
  await prisma.achievement.createMany({
    data: toUnlock.map((def) => ({
      userId,
      slug: def.slug,
      label: def.label,
      description: def.description,
      icon: def.icon,
      xpBonus: def.xpBonus,
    })),
    skipDuplicates: true,
  })

  for (const def of toUnlock) {
    if (def.xpBonus > 0) {
      await awardXP(userId, def.xpBonus)
    }
  }

  return toUnlock.map((d) => d.slug)
}
