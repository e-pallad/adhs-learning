"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition, lazy, Suspense } from "react"
import { CourseCard } from "@/components/training/course-card"
import { AddCourseForm } from "@/components/training/add-course-form"
import { cn } from "@/lib/utils"

const PracticeTab = lazy(() =>
  import("@/components/training/practice-tab").then((m) => ({ default: m.PracticeTab }))
)

interface Course {
  id: string
  title: string
  platform: string
  url: string | null
  totalLessons: number
  completedLessons: number
  isCompleted: boolean
  xpEarned: number
}

interface TrainingClientProps {
  courses: Course[]
  defaultTab: "courses" | "practice"
  userTrack: string
}

const TABS = [
  { id: "courses", label: "External Courses" },
  { id: "practice", label: "Practice" },
] as const

export function TrainingClient({ courses, defaultTab, userTrack }: TrainingClientProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<"courses" | "practice">(defaultTab)

  const completedCount = courses.filter((c) => c.isCompleted).length
  const totalXP = courses.reduce((sum, c) => sum + c.xpEarned, 0)

  const post = async (body: object): Promise<boolean> => {
    setError(null)
    const res = await fetch("/api/progress/course", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Something went wrong. Please try again.")
      return false
    }
    return true
  }

  const handleAdd = async (data: {
    title: string
    platform: string
    url: string
    totalLessons: number
  }) => {
    if (await post({ action: "create", ...data })) {
      startTransition(() => router.refresh())
    }
  }

  const handleUpdate = async (id: string, completedLessons: number) => {
    if (await post({ action: "update", id, completedLessons })) {
      startTransition(() => router.refresh())
    }
  }

  const handleDelete = async (id: string) => {
    if (await post({ action: "delete", id })) {
      startTransition(() => router.refresh())
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab switcher + live stats */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1 p-1 bg-[#0d0d14] border border-white/6 rounded-xl">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                tab === t.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "courses" && courses.length > 0 && (
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-zinc-500">{completedCount} / {courses.length} completed</p>
            <p className="text-xs text-indigo-400">{totalXP} XP earned</p>
          </div>
        )}
      </div>

      {tab === "courses" && (
        <>
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
          <AddCourseForm onAdd={handleAdd} />

          {courses.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <p className="text-sm">No courses yet. Add one to start tracking!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "practice" && (
        <Suspense fallback={
          <div className="text-center py-12 text-zinc-500">
            <p className="text-sm">Loading exercises…</p>
          </div>
        }>
          <PracticeTab userTrack={userTrack} />
        </Suspense>
      )}
    </div>
  )
}
