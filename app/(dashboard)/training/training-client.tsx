"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { CourseCard } from "@/components/training/course-card"
import { AddCourseForm } from "@/components/training/add-course-form"
import { PracticeTab } from "@/components/training/practice-tab"
import { cn } from "@/lib/utils"

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
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
              tab === t.id
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "courses" && (
        <>
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
          <AddCourseForm onAdd={handleAdd} />

          {courses.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
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

      {tab === "practice" && <PracticeTab userTrack={userTrack} />}
    </div>
  )
}
