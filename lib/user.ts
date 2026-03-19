import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { getLevelFromXP, ACHIEVEMENT_DEFINITIONS, XP_VALUES } from "@/lib/xp"

/**
 * Gets the current authenticated user's database record.
 * Creates it if it doesn't exist yet (first login).
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  let user = await prisma.user.findUnique({ where: { id: authUser.id } })

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email!,
        name: authUser.user_metadata?.name ?? null,
        avatarUrl: authUser.user_metadata?.avatar_url ?? null,
      },
    })
  }

  return user
}

/**
 * Award XP to a user and recalculate level.
 * Returns the updated user and whether they leveled up.
 */
export async function awardXP(
  userId: string,
  amount: number,
  context: { date?: Date } = {}
): Promise<{ leveledUp: boolean; newLevel: number; newXP: number }> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error("User not found")

  const newXP = user.totalXP + amount
  const newLevel = getLevelFromXP(newXP)
  const leveledUp = newLevel > user.level

  await prisma.user.update({
    where: { id: userId },
    data: { totalXP: newXP, level: newLevel },
  })

  // Update or create today's daily log
  const today = context.date ?? new Date()
  const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  await prisma.dailyLog.upsert({
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

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const lastSeen = user.lastSeenAt ? new Date(user.lastSeenAt) : null
  if (lastSeen) lastSeen.setHours(0, 0, 0, 0)

  let newStreak = user.streak

  if (!lastSeen) {
    newStreak = 1
  } else if (lastSeen.getTime() === today.getTime()) {
    // Already logged today — no change
    return user.streak
  } else if (lastSeen.getTime() === yesterday.getTime()) {
    // Consecutive day
    newStreak = user.streak + 1
  } else {
    // Gap — reset
    newStreak = 1
  }

  await prisma.user.update({
    where: { id: userId },
    data: { streak: newStreak, lastSeenAt: new Date() },
  })

  // Streak bonuses
  if (newStreak === 7) {
    await awardXP(userId, XP_VALUES.STREAK_BONUS_7)
  } else if (newStreak === 30) {
    await awardXP(userId, XP_VALUES.STREAK_BONUS_30)
  }

  return newStreak
}

/**
 * Check and unlock any newly earned achievements.
 */
export async function checkAchievements(userId: string): Promise<string[]> {
  const [user, existingAchievements, projects, blocks] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.achievement.findMany({ where: { userId }, select: { slug: true } }),
    prisma.monthlyProject.count({ where: { userId, status: "COMPLETED" } }),
    prisma.blockProgress.count({ where: { userId, status: "COMPLETED" } }),
  ])

  if (!user) return []

  const existingSlugs = new Set(existingAchievements.map((a) => a.slug))
  const stats = {
    streak: user.streak,
    level: user.level,
    totalXP: user.totalXP,
    projectsCompleted: projects,
    blocksCompleted: blocks,
  }

  const newlyUnlocked: string[] = []

  for (const def of ACHIEVEMENT_DEFINITIONS) {
    if (!existingSlugs.has(def.slug) && def.check(stats)) {
      await prisma.achievement.create({
        data: {
          userId,
          slug: def.slug,
          label: def.label,
          description: def.description,
          icon: def.icon,
          xpBonus: def.xpBonus,
        },
      })
      if (def.xpBonus > 0) {
        await awardXP(userId, def.xpBonus)
      }
      newlyUnlocked.push(def.slug)
    }
  }

  return newlyUnlocked
}
