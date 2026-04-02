import { startOfDay, differenceInCalendarDays } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { PrismaClient } from "@/app/generated/prisma/client"
import { getLevelFromXP, ACHIEVEMENT_DEFINITIONS, XP_VALUES } from "@/lib/xp"
import { hasDemoSession, createDemoUser } from "@/lib/demo"

// Accepts either the full PrismaClient or a transaction client
type DbClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">

/**
 * Gets the current authenticated user's database record.
 * Creates it if it doesn't exist yet (first login).
 */
export async function getCurrentUser() {
  // E2E test bypass: Playwright sets x-test-user-id cookie instead of a real Supabase session
  if (process.env.E2E_TEST === 'true') {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const testUserId = cookieStore.get('x-test-user-id')?.value
    if (testUserId) {
      return prisma.user.upsert({
        where: { id: testUserId },
        update: {},
        create: { id: testUserId, email: `${testUserId}@test.devfluent`, name: 'Test User' },
      })
    }
  }

  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    if (await hasDemoSession()) {
      return createDemoUser()
    }
    return null
  }

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

  // Atomic: skipDuplicates ensures at most one record per (userId, date)
  // count=1 means we just created it (first login today) → award XP
  // count=0 means it already existed → skip
  const { count } = await prisma.dailyLog.createMany({
    data: [{ userId, date: dateOnly, xpEarned: 0 }],
    skipDuplicates: true,
  })
  if (count > 0) {
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
  let usedFreeze = false

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
    } else if (daysDiff === 2) {
      // Missed exactly one day — auto-consume freeze if available this week
      const freezeAvailable = !user.streakFreezeUsedAt ||
        differenceInCalendarDays(today, startOfDay(new Date(user.streakFreezeUsedAt))) >= 7
      if (freezeAvailable) {
        usedFreeze = true
        newStreak = user.streak + 1
      } else {
        newStreak = 1
      }
    } else {
      // Gap > 1 day — reset
      newStreak = 1
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      streak: newStreak,
      lastSeenAt: new Date(),
      ...(usedFreeze ? { streakFreezeUsedAt: new Date() } : {}),
    },
  })

  // Streak bonuses — only award once per streak cycle (exact milestone, not re-award on re-reach)
  // Wrapped in a transaction so the achievement record and XP are always consistent.
  if (newStreak === 7) {
    await prisma.$transaction(async (tx) => {
      const { count } = await tx.achievement.createMany({
        data: [{ userId, slug: "streak_bonus_7", label: "7-Day Streak Bonus", description: "Bonus XP for a 7-day streak", icon: "🔥", xpBonus: XP_VALUES.STREAK_BONUS_7 }],
        skipDuplicates: true,
      })
      if (count > 0) {
        await awardXP(userId, XP_VALUES.STREAK_BONUS_7, { db: tx })
      }
    })
  } else if (newStreak === 30) {
    await prisma.$transaction(async (tx) => {
      const { count } = await tx.achievement.createMany({
        data: [{ userId, slug: "streak_bonus_30", label: "30-Day Streak Bonus", description: "Bonus XP for a 30-day streak", icon: "⚡", xpBonus: XP_VALUES.STREAK_BONUS_30 }],
        skipDuplicates: true,
      })
      if (count > 0) {
        await awardXP(userId, XP_VALUES.STREAK_BONUS_30, { db: tx })
      }
    })
  }

  return newStreak
}

/**
 * Check and unlock any newly earned achievements.
 */
export async function checkAchievements(userId: string): Promise<string[]> {
  const [user, existingAchievements, projects, blocks, quizAttempts, quizzesPassed, perfectQuizzes, githubPushes, githubPRsMerged, accountabilityCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.achievement.findMany({ where: { userId }, select: { slug: true } }),
    prisma.monthlyProject.count({ where: { userId, status: "COMPLETED" } }),
    prisma.blockProgress.count({ where: { userId, status: "COMPLETED" } }),
    prisma.quizAttempt.count({ where: { userId } }),
    prisma.quizAttempt.count({ where: { userId, passed: true } }),
    prisma.quizAttempt.count({ where: { userId, perfect: true } }),
    prisma.githubEvent.count({ where: { userId, eventType: "PushEvent" } }),
    prisma.githubEvent.count({ where: { userId, eventType: "PullRequestEvent", xpAwarded: { gte: 20 } } }),
    prisma.accountabilityPair.count({ where: { OR: [{ requesterId: userId }, { partnerId: userId }] } }),
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
    githubPushes,
    githubPRsMerged,
    accountabilityLinked: accountabilityCount > 0,
  }

  const toUnlock = ACHIEVEMENT_DEFINITIONS.filter(
    (def) => !existingSlugs.has(def.slug) && def.check(stats)
  )

  if (toUnlock.length === 0) return []

  // skipDuplicates prevents unique constraint errors from concurrent calls
  // Wrap in transaction to ensure achievement creation and XP award are atomic
  await prisma.$transaction(async (tx) => {
    await tx.achievement.createMany({
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

    const totalXPBonus = toUnlock.reduce((sum, def) => sum + (def.xpBonus > 0 ? def.xpBonus : 0), 0)
    if (totalXPBonus > 0) {
      await awardXP(userId, totalXPBonus, { db: tx })
    }
  })

  return toUnlock.map((d) => d.slug)
}
