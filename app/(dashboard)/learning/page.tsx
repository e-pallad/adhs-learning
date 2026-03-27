import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import { getTrackById, CURRICULUM } from "@/content/curriculum"
import { redirect } from "next/navigation"
import { canAccessMonth } from "@/lib/plans"
import { LearningClient } from "./learning-client"

export const metadata = { title: "Learning — Devfluent" }

export default async function LearningPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const months = getTrackById(user.track)?.months ?? CURRICULUM
  const trackBlockIds = months.flatMap((m) => m.weeks.flatMap((w) => w.blocks.map((b) => b.id)))

  const blockProgress = await prisma.blockProgress.findMany({
    where: { userId: user.id, blockId: { in: trackBlockIds } },
    select: { month: true, status: true },
  })

  const completedByMonth: Record<number, number> = {}
  for (const bp of blockProgress) {
    if (bp.status === "COMPLETED") {
      completedByMonth[bp.month] = (completedByMonth[bp.month] ?? 0) + 1
    }
  }

  const totalByMonth: Record<number, number> = {}
  for (const m of months) {
    totalByMonth[m.month] = m.weeks.flatMap((w) => w.blocks).length
  }

  let currentMonth = 1
  for (const m of months) {
    const done = completedByMonth[m.month] ?? 0
    const total = totalByMonth[m.month] ?? 1
    if (done < total) {
      currentMonth = m.month
      break
    }
  }

  const monthItems = months.map((m) => ({
    month: m.month,
    title: m.title,
    description: m.description,
    completedBlocks: completedByMonth[m.month] ?? 0,
    totalBlocks: totalByMonth[m.month],
    isCurrent: m.month === currentMonth,
    isLocked: !canAccessMonth(user, m.month),
  }))

  return <LearningClient months={monthItems} />
}
