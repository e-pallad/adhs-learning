import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import { getTrackById, CURRICULUM } from "@/content/curriculum"
import { MonthCard } from "@/components/learning/month-card"
import { redirect } from "next/navigation"
import { isDemoUser } from "@/lib/demo"
import { getDictionary, getLocale } from "@/lib/i18n"

export const metadata = { title: "Learning — Devfluent" }

export default async function LearningPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  const locale = await getLocale()
  const t = await getDictionary(locale)

  const allMonths = getTrackById(user.track)?.months ?? CURRICULUM
  const demoMode = isDemoUser(user)
  const months = demoMode ? allMonths.filter((m) => m.month === 1) : allMonths
  const trackBlockIds = months.flatMap((m) => m.weeks.flatMap((w) => w.blocks.map((b) => b.id)))

  const blockProgress = demoMode
    ? []
    : await prisma.blockProgress.findMany({
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

  const totalDone = Object.values(completedByMonth).reduce((a, b) => a + b, 0)
  const totalAll = Object.values(totalByMonth).reduce((a, b) => a + b, 0)
  const overallProgress = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">{t.learning.pageTitle}</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{t.learning.pageSubtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-indigo-400">{overallProgress}%</p>
          <p className="text-[11px] text-zinc-600 mt-0.5">{totalDone} / {totalAll} blocks</p>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {months.map((m) => {
          const done = completedByMonth[m.month] ?? 0
          const total = totalByMonth[m.month]
          const isCurrent = m.month === currentMonth

          return (
            <MonthCard
              key={m.month}
              month={m.month}
              title={m.title}
              description={m.description}
              completedBlocks={done}
              totalBlocks={total}
              isCurrent={isCurrent}
              labels={{
                month: t.learning.monthLabel,
                current: t.learning.current,
                done: t.learning.done,
                blocks: t.learning.blocks,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
