import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import { TrainingClient } from "../training-client"
import Link from "next/link"
import { Timer, ArrowLeft } from "lucide-react"

export const metadata = { title: "Courses — Devfluent" }

export default async function CoursesPage({
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Courses</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Practice exercises and external course tracking
          </p>
        </div>
        <Link
          href="/training"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <Timer className="w-4 h-4" />
          Focus Timer
        </Link>
      </div>

      <TrainingClient courses={courses} defaultTab={defaultTab} userTrack={user.track} />
    </div>
  )
}
