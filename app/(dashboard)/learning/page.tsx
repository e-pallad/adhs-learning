import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import { getTrackById, CURRICULUM } from "@/content/curriculum"
import { MonthCard } from "@/components/learning/month-card"
import { redirect } from "next/navigation"

export const metadata = { title: "Learning — Devfluent" }

export default async function LearningPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const months = getTrackById(user.track)?.months ?? CURRICULUM

  const blockProgress = await prisma.blockProgress.findMany({
    where: { userId: user.id },
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

  // Determine current month (first one not fully complete)
  let currentMonth = 1
  for (const m of months) {
    const done = completedByMonth[m.month] ?? 0
    const total = totalByMonth[m.month] ?? 1
    if (done < total) {
      currentMonth = m.month
      break
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Learning Path</h1>
        <p className="text-sm text-gray-500 mt-0.5">12-month curriculum — click a month to start studying</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {months.map((m) => {
          const done = completedByMonth[m.month] ?? 0
          const total = totalByMonth[m.month]
          const isCurrent = m.month === currentMonth

          return (
            <MonthCard
              key={m.month}
              month={m.month}
              completedBlocks={done}
              totalBlocks={total}
              isCurrent={isCurrent}
            />
          )
        })}
      </div>
    </div>
  )
}
