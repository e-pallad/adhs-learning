import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import { TrainingClient } from "./training-client"

export const metadata = { title: "Courses — Devfluent" }

export default async function TrainingPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const { tab } = await searchParams
  const defaultTab = tab === "practice" ? "practice" : "courses"

  const courses = await prisma.externalCourse.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Training</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Practice exercises and external course tracking
        </p>
      </div>

      <TrainingClient courses={courses} defaultTab={defaultTab} userTrack={user.track} />
    </div>
  )
}
