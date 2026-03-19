import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import { TrainingClient } from "./training-client"

export const metadata = { title: "Courses — Devfluent" }

export default async function TrainingPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const courses = await prisma.externalCourse.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })

  const totalXPFromCourses = courses.reduce((sum, c) => sum + c.xpEarned, 0)
  const completedCount = courses.filter((c) => c.isCompleted).length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">External Courses</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track Udemy, YouTube, and other courses alongside your curriculum
          </p>
        </div>
        {courses.length > 0 && (
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-400">{completedCount} / {courses.length} completed</p>
            <p className="text-xs text-indigo-600">{totalXPFromCourses} XP earned</p>
          </div>
        )}
      </div>

      <TrainingClient courses={courses} />
    </div>
  )
}
