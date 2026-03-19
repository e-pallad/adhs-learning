import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import { AVAILABLE_ROADMAPS } from "@/lib/roadmap"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { redirect } from "next/navigation"

export const metadata = { title: "Roadmap — Devfluent" }

export default async function RoadmapPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  // Get progress counts per roadmap
  const progressRecords = await prisma.roadmapProgress.findMany({
    where: { userId: user.id },
    select: { roadmapId: true, status: true },
  })

  const completedByRoadmap: Record<string, number> = {}
  const totalByRoadmap: Record<string, number> = {}
  for (const r of progressRecords) {
    totalByRoadmap[r.roadmapId] = (totalByRoadmap[r.roadmapId] ?? 0) + 1
    if (r.status === "COMPLETED") {
      completedByRoadmap[r.roadmapId] = (completedByRoadmap[r.roadmapId] ?? 0) + 1
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Roadmaps</h1>
        <p className="text-sm text-gray-500 mt-0.5">Pick a technology roadmap and track your progress through each topic</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {AVAILABLE_ROADMAPS.map((roadmap) => {
          const done = completedByRoadmap[roadmap.id] ?? 0
          const total = totalByRoadmap[roadmap.id] ?? 0
          const pct = total > 0 ? Math.round((done / total) * 100) : 0
          const started = total > 0

          return (
            <Link key={roadmap.id} href={`/roadmap/${roadmap.id}`} className="block">
              <Card className="hover:shadow-md transition-all hover:border-indigo-300">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-semibold text-gray-900">{roadmap.title}</h2>
                      <p className="text-xs text-gray-500 mt-0.5">{roadmap.description}</p>
                    </div>
                    {started && (
                      <Badge variant={pct === 100 ? "success" : "info"}>
                        {pct === 100 ? "Done" : `${pct}%`}
                      </Badge>
                    )}
                    {!started && <Badge variant="default">New</Badge>}
                  </div>

                  {started && (
                    <ProgressBar
                      value={pct}
                      label={`${done} / ${total} topics`}
                      color={pct === 100 ? "green" : "indigo"}
                    />
                  )}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
