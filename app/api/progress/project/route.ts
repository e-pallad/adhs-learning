import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, awardXP, checkAchievements } from "@/lib/user"
import { XP_VALUES } from "@/lib/xp"
import { CURRICULUM } from "@/content/curriculum"

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { action, month, repoUrl, liveUrl } = body

  if (!month || typeof month !== "number") {
    return NextResponse.json({ error: "Missing month" }, { status: 400 })
  }

  const monthData = CURRICULUM.find((m) => m.month === month)
  if (!monthData) return NextResponse.json({ error: "Month not found" }, { status: 404 })

  if (action === "start") {
    const project = await prisma.monthlyProject.upsert({
      where: { userId_month: { userId: user.id, month } },
      create: {
        userId: user.id,
        month,
        title: monthData.projectTitle,
        description: monthData.projectDescription,
        status: "IN_PROGRESS",
      },
      update: {
        status: "IN_PROGRESS",
      },
    })
    return NextResponse.json({ success: true, project })
  }

  if (action === "complete") {
    const { project, leveledUp, newLevel, justCompleted } = await prisma.$transaction(async (tx) => {
      const existing = await tx.monthlyProject.findUnique({
        where: { userId_month: { userId: user.id, month } },
      })
      const wasCompleted = existing?.status === "COMPLETED"

      const project = await tx.monthlyProject.upsert({
        where: { userId_month: { userId: user.id, month } },
        create: {
          userId: user.id,
          month,
          title: monthData.projectTitle,
          description: monthData.projectDescription,
          status: "COMPLETED",
          repoUrl: repoUrl || null,
          liveUrl: liveUrl || null,
          completedAt: new Date(),
          xpEarned: XP_VALUES.COMPLETE_PROJECT,
        },
        update: {
          status: "COMPLETED",
          repoUrl: repoUrl || null,
          liveUrl: liveUrl || null,
          completedAt: new Date(),
          ...(!wasCompleted ? { xpEarned: XP_VALUES.COMPLETE_PROJECT } : {}),
        },
      })

      let leveledUp = false
      let newLevel = user.level

      if (!wasCompleted) {
        const result = await awardXP(user.id, XP_VALUES.COMPLETE_PROJECT, { db: tx })
        leveledUp = result.leveledUp
        newLevel = result.newLevel
      }

      return { project, leveledUp, newLevel, justCompleted: !wasCompleted }
    })

    if (justCompleted) await checkAchievements(user.id)

    return NextResponse.json({ success: true, project, leveledUp, newLevel })
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
