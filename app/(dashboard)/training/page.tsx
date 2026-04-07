import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/user"
import { getUserTier, getFeatureFlags } from "@/lib/subscription"
import { PomodoroTimer } from "@/components/learning/pomodoro-timer"
import { HyperfocusMode } from "@/components/learning/hyperfocus-mode"
import Link from "next/link"
import { GraduationCap, ArrowRight } from "lucide-react"

export const metadata = { title: "Focus Timer — Devfluent" }

export default async function TrainingPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const tier = await getUserTier(user.id)
  const flags = getFeatureFlags(tier)

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Focus Timer</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            25-minute Pomodoro sessions with ambient sounds
          </p>
        </div>
        <Link
          href="/training/courses"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <GraduationCap className="w-4 h-4" />
          Courses
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Centered timer with hyperfocus mode */}
      <div className="flex justify-center py-6 relative">
        <HyperfocusMode>
          <PomodoroTimer isProUser={flags.focusSounds} />
        </HyperfocusMode>
      </div>
    </div>
  )
}
