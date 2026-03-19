"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { CourseCard } from "@/components/training/course-card"
import { AddCourseForm } from "@/components/training/add-course-form"

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
}

export function TrainingClient({ courses }: TrainingClientProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const post = (body: object) =>
    fetch("/api/progress/course", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

  const handleAdd = async (data: {
    title: string
    platform: string
    url: string
    totalLessons: number
  }) => {
    await post({ action: "create", ...data })
    startTransition(() => router.refresh())
  }

  const handleUpdate = async (id: string, completedLessons: number) => {
    await post({ action: "update", id, completedLessons })
    startTransition(() => router.refresh())
  }

  const handleDelete = async (id: string) => {
    await post({ action: "delete", id })
    startTransition(() => router.refresh())
  }

  return (
    <div className="space-y-6">
      <AddCourseForm onAdd={handleAdd} />

      {courses.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
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
    </div>
  )
}
