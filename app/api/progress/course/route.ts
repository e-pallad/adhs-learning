import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, awardXP, checkAchievements } from "@/lib/user"
import { XP_VALUES } from "@/lib/xp"

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { action, ...data } = body

  if (action === "create") {
    const { title, platform, url, totalLessons } = data
    if (!title || !platform) {
      return NextResponse.json({ error: "Title and platform are required" }, { status: 400 })
    }

    const course = await prisma.externalCourse.create({
      data: {
        userId: user.id,
        title,
        platform,
        url: url || null,
        totalLessons: Number(totalLessons) || 0,
        xpEarned: XP_VALUES.ADD_COURSE,
      },
    })

    await awardXP(user.id, XP_VALUES.ADD_COURSE)
    return NextResponse.json({ success: true, course })
  }

  if (action === "update") {
    const { id, completedLessons } = data
    if (!id) return NextResponse.json({ error: "Missing course id" }, { status: 400 })

    const course = await prisma.externalCourse.findUnique({ where: { id } })
    if (!course || course.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const isNowCompleted = course.totalLessons > 0 && completedLessons >= course.totalLessons
    const wasCompleted = course.isCompleted

    const updated = await prisma.externalCourse.update({
      where: { id },
      data: {
        completedLessons: Number(completedLessons),
        isCompleted: isNowCompleted,
        completedAt: isNowCompleted && !wasCompleted ? new Date() : course.completedAt,
      },
    })

    if (isNowCompleted && !wasCompleted) {
      await awardXP(user.id, XP_VALUES.COMPLETE_COURSE)
      await prisma.externalCourse.update({
        where: { id },
        data: { xpEarned: { increment: XP_VALUES.COMPLETE_COURSE } },
      })
      await checkAchievements(user.id)
    }

    return NextResponse.json({ success: true, course: updated })
  }

  if (action === "delete") {
    const { id } = data
    const course = await prisma.externalCourse.findUnique({ where: { id } })
    if (!course || course.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    await prisma.externalCourse.delete({ where: { id } })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
