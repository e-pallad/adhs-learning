import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import { CURRICULUM } from "@/content/curriculum"
import { ProjectsClient } from "./projects-client"

export const metadata = { title: "Projects — Devfluent" }

export default async function ProjectsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const dbProjects = await prisma.monthlyProject.findMany({
    where: { userId: user.id },
    orderBy: { month: "asc" },
  })

  const projects = dbProjects.map((p) => ({
    id: p.id,
    month: p.month,
    title: p.title,
    description: p.description ?? "",
    repoUrl: p.repoUrl,
    liveUrl: p.liveUrl,
    status: p.status as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED",
    xpEarned: p.xpEarned,
  }))

  const curriculum = CURRICULUM.map((m) => ({
    month: m.month,
    projectTitle: m.projectTitle,
    projectDescription: m.projectDescription,
  }))

  const completedCount = projects.filter((p) => p.status === "COMPLETED").length
  const inProgressCount = projects.filter((p) => p.status === "IN_PROGRESS").length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Monthly Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Build something real every month — one project per month
          </p>
        </div>
        {(completedCount > 0 || inProgressCount > 0) && (
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-400">{completedCount} / 12 completed</p>
            {inProgressCount > 0 && (
              <p className="text-xs text-indigo-600">{inProgressCount} in progress</p>
            )}
          </div>
        )}
      </div>

      <ProjectsClient projects={projects} curriculum={curriculum} />
    </div>
  )
}
