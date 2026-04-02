import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import { getTrackById, CURRICULUM } from "@/content/curriculum"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Badge } from "@/components/ui/badge"
import { isDemoUser } from "@/lib/demo"
import { getLocale, getDictionary } from "@/lib/i18n"
import Link from "next/link"
import { WeekSection } from "./week-section"
import { ChevronRight, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react"

interface Props {
  params: Promise<{ month: string }>
}

export async function generateMetadata({ params }: Props) {
  const { month } = await params
  const user = await getCurrentUser()
  const months = user ? (getTrackById(user.track)?.months ?? CURRICULUM) : CURRICULUM
  const data = months.find((m) => m.month === Number(month))
  return { title: data ? `Month ${month}: ${data.title} — Devfluent` : "Learning — Devfluent" }
}

export default async function MonthPage({ params }: Props) {
  const { month: monthParam } = await params
  const monthNum = Number(monthParam)

  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()])
  if (!user) redirect("/login")
  const dict = await getDictionary(locale)
  const demoMode = isDemoUser(user)
  if (demoMode && monthNum !== 1) {
    redirect("/learning/1")
  }

  const months = getTrackById(user.track)?.months ?? CURRICULUM
  const monthData = months.find((m) => m.month === monthNum)
  if (!monthData) notFound()

  const visibleMonthData = demoMode
    ? { ...monthData, weeks: monthData.weeks.slice(0, 1) }
    : monthData

  const allBlockIds = visibleMonthData.weeks.flatMap((w) => w.blocks.map((b) => b.id))

  const blockProgress = demoMode
    ? []
    : await prisma.blockProgress.findMany({
      where: { userId: user.id, blockId: { in: allBlockIds } },
      select: { blockId: true, status: true, notes: true },
    })

  const statusMap: Record<string, "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED"> = {}
  const notesMap: Record<string, string> = {}
  for (const bp of blockProgress) {
    statusMap[bp.blockId] = bp.status as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED"
    if (bp.notes) notesMap[bp.blockId] = bp.notes
  }

  const completedCount = blockProgress.filter((b) => b.status === "COMPLETED").length
  const totalCount = allBlockIds.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const isCompleted = completedCount === totalCount

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-400">
        <Link href="/learning" className="hover:text-gray-600 transition-colors">Learning</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900">Month {monthNum}</span>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Month {monthNum}</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-0.5">{visibleMonthData.title}</h1>
              <p className="text-sm text-gray-500 mt-1">{visibleMonthData.description}</p>
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
        <p className="text-sm font-semibold text-gray-900">{visibleMonthData.projectTitle}</p>
        <p className="text-xs text-gray-500">{visibleMonthData.projectDescription}</p>
        <Link href="/projects" className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 mt-1 transition-colors">
          Track in Projects
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Weeks */}
      <div className="space-y-8">
        {visibleMonthData.weeks.map((week) => (
          <WeekSection
            key={week.week}
            weekNumber={week.week}
            theme={week.theme}
            blocks={week.blocks}
            statusMap={statusMap}
            notesMap={notesMap}
            readOnly={demoMode}
            dict={dict}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-100">
        {monthNum > 1 ? (
          <Link href={`/learning/${monthNum - 1}`} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Month {monthNum - 1}
          </Link>
        ) : <div />}
        {monthNum < 12 ? (
          <Link href={`/learning/${monthNum + 1}`} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 transition-colors">
            Month {monthNum + 1}
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : <div />}
      </div>
    </div>
  )
}
