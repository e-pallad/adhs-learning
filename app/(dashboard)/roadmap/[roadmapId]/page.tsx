import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import { getRoadmapSections, AVAILABLE_ROADMAPS } from "@/lib/roadmap"
import { RoadmapList } from "@/components/roadmap/roadmap-list"
import Link from "next/link"

interface Props {
  params: Promise<{ roadmapId: string }>
}

export async function generateMetadata({ params }: Props) {
  const { roadmapId } = await params
  const meta = AVAILABLE_ROADMAPS.find((r) => r.id === roadmapId)
  return { title: meta ? `${meta.title} Roadmap — Devfluent` : "Roadmap — Devfluent" }
}

export default async function RoadmapDetailPage({ params }: Props) {
  const { roadmapId } = await params

  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const meta = AVAILABLE_ROADMAPS.find((r) => r.id === roadmapId)
  if (!meta) notFound()

  const [sections, progressRecords] = await Promise.all([
    getRoadmapSections(roadmapId),
    prisma.roadmapProgress.findMany({
      where: { userId: user.id, roadmapId },
      select: { nodeId: true, status: true },
    }),
  ])

  if (sections.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/roadmap" className="hover:text-gray-600">Roadmaps</Link>
          <span>/</span>
          <span className="text-gray-900">{meta.title}</span>
        </div>
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">Could not load roadmap data. Try again later.</p>
        </div>
      </div>
    )
  }

  const initialProgress: Record<string, "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED"> = {}
  for (const r of progressRecords) {
    initialProgress[r.nodeId] = r.status as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED"
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/roadmap" className="hover:text-gray-600">Roadmaps</Link>
        <span>/</span>
        <span className="text-gray-900">{meta.title}</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">{meta.title} Roadmap</h1>
        <p className="text-sm text-gray-500 mt-0.5">{meta.description}</p>
      </div>

      {/* List */}
      <RoadmapList
        sections={sections}
        roadmapId={roadmapId}
        initialProgress={initialProgress}
      />
    </div>
  )
}
