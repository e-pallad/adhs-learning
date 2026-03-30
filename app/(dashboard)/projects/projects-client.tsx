"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Month } from "@/content/curriculum"
import { ExternalLink } from "lucide-react"

type ProjectStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"

interface Project {
  id: string | null
  month: number
  title: string
  description: string
  repoUrl: string | null
  liveUrl: string | null
  status: ProjectStatus
  xpEarned: number
}

interface ProjectsClientProps {
  projects: Project[]
  curriculum: Pick<Month, "month" | "projectTitle" | "projectDescription">[]
}

export function ProjectsClient({ projects, curriculum }: ProjectsClientProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [editingMonth, setEditingMonth] = useState<number | null>(null)
  const [form, setForm] = useState({ repoUrl: "", liveUrl: "" })
  const [loading, setLoading] = useState(false)

  const post = (body: object) =>
    fetch("/api/progress/project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

  const handleStart = async (month: number) => {
    await post({ action: "start", month })
    startTransition(() => router.refresh())
  }

  const handleComplete = async (month: number) => {
    setLoading(true)
    await post({ action: "complete", month, repoUrl: form.repoUrl, liveUrl: form.liveUrl })
    setEditingMonth(null)
    setForm({ repoUrl: "", liveUrl: "" })
    setLoading(false)
    startTransition(() => router.refresh())
  }

  const STATUS_COLORS: Record<ProjectStatus, string> = {
    NOT_STARTED: "default",
    IN_PROGRESS: "info",
    COMPLETED: "success",
  }

  const STATUS_LABELS: Record<ProjectStatus, string> = {
    NOT_STARTED: "Not started",
    IN_PROGRESS: "In progress",
    COMPLETED: "Completed",
  }

  return (
    <div className="space-y-4">
      {curriculum.map((m) => {
        const proj = projects.find((p) => p.month === m.month) ?? {
          id: null,
          month: m.month,
          title: m.projectTitle,
          description: m.projectDescription,
          repoUrl: null,
          liveUrl: null,
          status: "NOT_STARTED" as ProjectStatus,
          xpEarned: 0,
        }

        return (
          <Card
            key={m.month}
            className={proj.status === "COMPLETED" ? "border-green-300" : undefined}
          >
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Month {m.month}</p>
                    <Badge variant={STATUS_COLORS[proj.status] as "default" | "info" | "success"}>
                      {STATUS_LABELS[proj.status]}
                    </Badge>
                    {proj.xpEarned > 0 && (
                      <span className="text-xs text-indigo-600">+{proj.xpEarned} XP</span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{proj.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{proj.description}</p>
                </div>

                <div className="flex-shrink-0 flex gap-2">
                  {proj.status === "NOT_STARTED" && (
                    <Button size="sm" variant="secondary" onClick={() => handleStart(m.month)}>
                      Start
                    </Button>
                  )}
                  {proj.status === "IN_PROGRESS" && editingMonth !== m.month && (
                    <Button size="sm" onClick={() => { setEditingMonth(m.month); setForm({ repoUrl: proj.repoUrl ?? "", liveUrl: proj.liveUrl ?? "" }) }}>
                      Mark done
                    </Button>
                  )}
                </div>
              </div>

              {/* Links for completed */}
              {proj.status === "COMPLETED" && (proj.repoUrl || proj.liveUrl) && (
                <div className="flex gap-3">
                  {proj.repoUrl && (
                    <a href={proj.repoUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 transition-colors">
                      Repo <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {proj.liveUrl && (
                    <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 transition-colors">
                      Live <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Complete form */}
              {editingMonth === m.month && (
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-3">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Add links (optional)</p>
                  <div className="space-y-2">
                    <input
                      type="url"
                      autoComplete="url"
                      placeholder="GitHub repo URL"
                      value={form.repoUrl}
                      onChange={(e) => setForm((f) => ({ ...f, repoUrl: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-gray-100"
                    />
                    <input
                      type="url"
                      autoComplete="url"
                      placeholder="Live demo URL"
                      value={form.liveUrl}
                      onChange={(e) => setForm((f) => ({ ...f, liveUrl: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleComplete(m.month)} loading={loading}>
                      Complete (+100 XP)
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingMonth(null)}>Cancel</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
