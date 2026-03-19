import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import { CURRICULUM } from "@/content/curriculum"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { WeekSection } from "./week-section"

interface Props {
  params: Promise<{ month: string }>
}

export async function generateMetadata({ params }: Props) {
  const { month } = await params
  const data = CURRICULUM.find((m) => m.month === Number(month))
  return { title: data ? `Month ${month}: ${data.title} — Devfluent` : "Learning — Devfluent" }
}

export default async function MonthPage({ params }: Props) {
  const { month: monthParam } = await params
  const monthNum = Number(monthParam)

  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const monthData = CURRICULUM.find((m) => m.month === monthNum)
  if (!monthData) notFound()

  const allBlockIds = monthData.weeks.flatMap((w) => w.blocks.map((b) => b.id))

  const blockProgress = await prisma.blockProgress.findMany({
    where: { userId: user.id, blockId: { in: allBlockIds } },
    select: { blockId: true, status: true },
  })

  const statusMap: Record<string, "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED"> = {}
  for (const bp of blockProgress) {
    statusMap[bp.blockId] = bp.status as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED"
  }

  const completedCount = blockProgress.filter((b) => b.status === "COMPLETED").length
  const totalCount = allBlockIds.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const isCompleted = completedCount === totalCount

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/learning" className="hover:text-gray-600">Learning</Link>
        <span>/</span>
        <span className="text-gray-900">Month {monthNum}</span>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Month {monthNum}</p>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">{monthData.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{monthData.description}</p>
          </div>
          {isCompleted && <Badge variant="success">Completed</Badge>}
        </div>
        <ProgressBar
          value={progress}
          label={`${completedCount} / ${totalCount} blocks`}
          showPercentage
          color={isCompleted ? "green" : "indigo"}
        />
      </div>

      {/* Project info */}
      <div className="border border-indigo-100 bg-indigo-50 rounded-xl p-4 space-y-1">
        <p className="text-xs font-medium text-indigo-700 uppercase tracking-wide">Monthly project</p>
        <p className="text-sm font-semibold text-gray-900">{monthData.projectTitle}</p>
        <p className="text-xs text-gray-500">{monthData.projectDescription}</p>
        <Link href="/projects" className="text-xs text-indigo-600 hover:underline mt-1 block">
          Track in Projects →
        </Link>
      </div>

      {/* Weeks */}
      <div className="space-y-8">
        {monthData.weeks.map((week) => (
          <WeekSection
            key={week.week}
            weekNumber={week.week}
            theme={week.theme}
            blocks={week.blocks}
            statusMap={statusMap}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-100">
        {monthNum > 1 ? (
          <Link href={`/learning/${monthNum - 1}`} className="text-sm text-indigo-600 hover:underline">
            ← Month {monthNum - 1}
          </Link>
        ) : <div />}
        {monthNum < 12 ? (
          <Link href={`/learning/${monthNum + 1}`} className="text-sm text-indigo-600 hover:underline">
            Month {monthNum + 1} →
          </Link>
        ) : <div />}
      </div>
    </div>
  )
}
