import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import { getXPProgress } from "@/lib/xp"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [blockStats, roadmapStats, courseStats, recentLogs, achievements] = await Promise.all([
    prisma.blockProgress.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: true,
    }),
    prisma.roadmapProgress.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: true,
    }),
    prisma.externalCourse.aggregate({
      where: { userId: user.id },
      _count: { id: true },
      _sum: { xpEarned: true },
    }),
    prisma.dailyLog.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 7,
    }),
    prisma.achievement.findMany({
      where: { userId: user.id },
      orderBy: { unlockedAt: "desc" },
      take: 5,
    }),
  ])

  const xpProgress = getXPProgress(user.totalXP)

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      totalXP: user.totalXP,
      streak: user.streak,
      ...xpProgress,
    },
    blocks: blockStats,
    roadmap: roadmapStats,
    courses: courseStats,
    recentActivity: recentLogs,
    achievements,
  })
}
