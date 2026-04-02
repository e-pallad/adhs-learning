import { prisma } from "@/lib/prisma"
import { getCurrentUser, awardDailyLoginXP } from "@/lib/user"
import { getXPProgress, LEVEL_THRESHOLDS } from "@/lib/xp"
import { getTrackById, CURRICULUM } from "@/content/curriculum"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Card, CardContent } from "@/components/ui/card"
import { BodyDoubleMode } from "@/components/body-double-mode"
import { AiRecommendations } from "@/components/ai-recommendations"
import { AccountabilityPartner } from "@/components/accountability-partner"
import { isDemoUser } from "@/lib/demo"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  Star,
  Zap,
  Flame,
  CheckSquare,
  BookOpen,
  Map as MapIcon,
  GraduationCap,
  Rocket,
  TrendingUp,
  Settings,
  ArrowRight,
} from "lucide-react"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  const demoMode = isDemoUser(user)

  // Award daily login XP (idempotent — at most once per day)
  if (!demoMode) {
    await awardDailyLoginXP(user.id)
  }

  const xpProgress = getXPProgress(user.totalXP)
  const nextLevel = LEVEL_THRESHOLDS.find((t) => t.level === xpProgress.level + 1)

  const curriculum = getTrackById(user.track)?.months ?? CURRICULUM
  const trackBlockIds = curriculum.flatMap((m) => m.weeks.flatMap((w) => w.blocks.map((b) => b.id)))

  // Block completion stats grouped by month (scoped to active track)
  const blockProgress = demoMode
    ? []
    : await prisma.blockProgress.findMany({
      where: { userId: user.id, blockId: { in: trackBlockIds } },
      select: { blockId: true, month: true, status: true },
    })

  const progressByBlockId = new Map(blockProgress.map((bp) => [bp.blockId, bp.status]))
  let resumeTarget: { month: number; blockId: string } | null = null

  for (const month of curriculum) {
    for (const week of month.weeks) {
      for (const block of week.blocks) {
        const status = progressByBlockId.get(block.id)
        if (status === "IN_PROGRESS") {
          resumeTarget = { month: month.month, blockId: block.id }
          break
        }
      }
      if (resumeTarget) break
    }
    if (resumeTarget) break
  }

  if (!resumeTarget) {
    for (const month of curriculum) {
      for (const week of month.weeks) {
        for (const block of week.blocks) {
          const status = progressByBlockId.get(block.id)
          if (status !== "COMPLETED") {
            resumeTarget = { month: month.month, blockId: block.id }
            break
          }
        }
        if (resumeTarget) break
      }
      if (resumeTarget) break
    }
  }

  const completedByMonth: Record<number, number> = {}
  for (const bp of blockProgress) {
    if (bp.status === "COMPLETED") {
      completedByMonth[bp.month] = (completedByMonth[bp.month] ?? 0) + 1
    }
  }

  // Total blocks per month
  const totalByMonth: Record<number, number> = {}
  for (const m of curriculum) {
    totalByMonth[m.month] = m.weeks.flatMap((w) => w.blocks).length
  }

  // Determine current month (first month with < 100% completion)
  let currentMonth = 1
  for (const m of curriculum) {
    const done = completedByMonth[m.month] ?? 0
    const total = totalByMonth[m.month] ?? 1
    if (done < total) {
      currentMonth = m.month
      break
    }
  }

  const currentMonthData = curriculum.find((m) => m.month === currentMonth)!
  const currentMonthBlocks = currentMonthData.weeks.flatMap((w) => w.blocks)
  const currentMonthDone = completedByMonth[currentMonth] ?? 0

  // Recent achievements
  const recentAchievements = demoMode
    ? []
    : await prisma.achievement.findMany({
      where: { userId: user.id },
      orderBy: { unlockedAt: "desc" },
      take: 3,
    })

  // 7-day activity
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const recentLogs = demoMode
    ? []
    : await prisma.dailyLog.findMany({
      where: { userId: user.id, date: { gte: sevenDaysAgo } },
      orderBy: { date: "asc" },
    })

  // Build 7-day heatmap
  const days: { date: Date; xp: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const log = recentLogs.find((l) => new Date(l.date).toDateString() === d.toDateString())
    days.push({ date: d, xp: log?.xpEarned ?? 0 })
  }

  // Goal progress: today and this week (from DailyLog.blocksCompleted)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const todayLog = recentLogs.find((l) => new Date(l.date).toDateString() === today.toDateString())
  const todayBlocks = todayLog?.blocksCompleted ?? 0
  const weeklyBlocks = recentLogs.reduce((sum, l) => sum + l.blocksCompleted, 0)

  const totalBlocksDone = blockProgress.filter((b) => b.status === "COMPLETED").length
  const totalBlocksAll = curriculum.flatMap((m) => m.weeks.flatMap((w) => w.blocks)).length

  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Welcome back{user.name ? `, ${user.name}` : ""}!</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Level</p>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Star className="w-3.5 h-3.5 text-indigo-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-indigo-600">{xpProgress.level}</p>
            <p className="text-xs text-gray-400 mt-0.5">{xpProgress.label}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total XP</p>
              <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-violet-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.totalXP.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-0.5">{nextLevel ? `${nextLevel.xpRequired - user.totalXP} to level ${nextLevel.level}` : "Max level!"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Streak</p>
              <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-orange-500">{user.streak}</p>
            <p className="text-xs text-gray-400 mt-0.5">days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Blocks done</p>
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckSquare className="w-3.5 h-3.5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600">{totalBlocksDone}</p>
            <p className="text-xs text-gray-400 mt-0.5">of {totalBlocksAll}</p>
          </CardContent>
        </Card>
      </div>

      {/* XP progress to next level */}
      {nextLevel && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900 dark:text-gray-100">Level {xpProgress.level}: {xpProgress.label}</span>
              <span className="text-gray-400">{xpProgress.currentLevelXP} / {xpProgress.nextLevelXP} XP</span>
            </div>
            <ProgressBar value={xpProgress.progress} color="indigo" />
          </CardContent>
        </Card>
      )}

      {/* Daily & Weekly goals */}
      <div data-tour="daily-goal" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900 dark:text-gray-100">Today&apos;s goal</span>
              <span className="text-gray-400">{todayBlocks} / {user.dailyGoalBlocks} blocks</span>
            </div>
            <ProgressBar
              value={user.dailyGoalBlocks > 0 ? Math.min(100, Math.round((todayBlocks / user.dailyGoalBlocks) * 100)) : 0}
              color={todayBlocks >= user.dailyGoalBlocks ? "green" : "indigo"}
            />
            {todayBlocks >= user.dailyGoalBlocks && (
              <p className="text-xs text-green-600 font-medium">Goal reached!</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900 dark:text-gray-100">This week&apos;s goal</span>
              <span className="text-gray-400">{weeklyBlocks} / {user.weeklyGoalBlocks} blocks</span>
            </div>
            <ProgressBar
              value={user.weeklyGoalBlocks > 0 ? Math.min(100, Math.round((weeklyBlocks / user.weeklyGoalBlocks) * 100)) : 0}
              color={weeklyBlocks >= user.weeklyGoalBlocks ? "green" : "indigo"}
            />
            {weeklyBlocks >= user.weeklyGoalBlocks && (
              <p className="text-xs text-green-600 font-medium">Goal reached!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick resume */}
      {resumeTarget && (
        <Card className="border-indigo-200 bg-indigo-50/60 dark:bg-indigo-950/20">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">Quick Start</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">Jump straight back into your next learning block.</p>
            </div>
            <Link
              href={`/learning/${resumeTarget.month}#${resumeTarget.blockId}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors whitespace-nowrap"
            >
              Resume now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Body-Double Mode */}
      <Card data-tour="body-double">
        <CardContent className="p-5">
          <BodyDoubleMode />
        </CardContent>
      </Card>

      {/* Current month */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Now studying — Month {currentMonth}</p>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{currentMonthData.title}</h2>
            </div>
            <Link
              href={`/learning/${currentMonth}`}
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              Open
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ProgressBar
            value={currentMonthBlocks.length > 0 ? Math.round((currentMonthDone / currentMonthBlocks.length) * 100) : 0}
            label={`${currentMonthDone} / ${currentMonthBlocks.length} blocks`}
            showPercentage
            color="indigo"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Recommendations */}
        <Card>
          <CardContent className="p-5">
            <AiRecommendations />
          </CardContent>
        </Card>

        {/* Accountability Partner */}
        <Card>
          <CardContent className="p-5">
            <AccountabilityPartner />
          </CardContent>
        </Card>

        {/* 7-day activity */}
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Last 7 days</h3>
            <div className="flex gap-2 items-end">
              {days.map(({ date, xp }) => {
                const height = xp === 0 ? 8 : Math.min(64, 8 + Math.round((xp / 50) * 56))
                const isToday = date.toDateString() === new Date().toDateString()
                return (
                  <div key={date.toISOString()} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-sm transition-all ${xp > 0 ? "bg-indigo-500" : "bg-gray-100 dark:bg-gray-700"} ${isToday && xp > 0 ? "ring-1 ring-indigo-300 ring-offset-1" : ""}`}
                      style={{ height }}
                      title={`${xp} XP`}
                    />
                    <span className={`text-xs ${isToday ? "text-indigo-600 font-semibold" : "text-gray-400"}`}>
                      {DAY_LABELS[date.getDay()]}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent achievements */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent achievements</h3>
              <Link href="/progress" className="flex items-center gap-0.5 text-xs text-indigo-600 hover:text-indigo-700 transition-colors">
                View all
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recentAchievements.length === 0 ? (
              <p className="text-sm text-gray-400">No achievements yet — keep going!</p>
            ) : (
              <ul className="space-y-2">
                {recentAchievements.map((a) => (
                  <li key={a.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 text-base">
                      {a.icon ?? "🏆"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{a.label}</p>
                      <p className="text-xs text-gray-400 truncate">{a.description}</p>
                    </div>
                    {a.xpBonus > 0 && (
                      <span className="ml-auto text-xs font-medium text-indigo-600 flex-shrink-0">+{a.xpBonus} XP</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: `/learning/${currentMonth}`, label: "Continue learning", desc: `Month ${currentMonth}: ${currentMonthData.title}`, icon: BookOpen, color: "text-indigo-600 bg-indigo-50" },
          { href: "/roadmap", label: "Roadmap", desc: "Track tech skills", icon: MapIcon, color: "text-blue-600 bg-blue-50" },
          { href: "/training", label: "Courses", desc: "External resources", icon: GraduationCap, color: "text-violet-600 bg-violet-50" },
          { href: "/projects", label: "Projects", desc: "Monthly builds", icon: Rocket, color: "text-orange-600 bg-orange-50" },
          { href: "/progress", label: "Progress", desc: "XP & achievements", icon: TrendingUp, color: "text-green-600 bg-green-50" },
          { href: "/settings", label: "Settings", desc: "Account & preferences", icon: Settings, color: "text-gray-600 bg-gray-100" },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{item.desc}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
