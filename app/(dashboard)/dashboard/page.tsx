import { prisma } from "@/lib/prisma"
import { getCurrentUser, awardDailyLoginXP } from "@/lib/user"
import { getXPProgress, LEVEL_THRESHOLDS } from "@/lib/xp"
import { getTrackById, CURRICULUM } from "@/content/curriculum"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

  if (!demoMode) {
    await awardDailyLoginXP(user.id)
  }

  const xpProgress = getXPProgress(user.totalXP)
  const nextLevel = LEVEL_THRESHOLDS.find((t) => t.level === xpProgress.level + 1)

  const curriculum = getTrackById(user.track)?.months ?? CURRICULUM
  const trackBlockIds = curriculum.flatMap((m) => m.weeks.flatMap((w) => w.blocks.map((b) => b.id)))

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

  const totalByMonth: Record<number, number> = {}
  for (const m of curriculum) {
    totalByMonth[m.month] = m.weeks.flatMap((w) => w.blocks).length
  }

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

  const recentAchievements = demoMode
    ? []
    : await prisma.achievement.findMany({
      where: { userId: user.id },
      orderBy: { unlockedAt: "desc" },
      take: 3,
    })

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const recentLogs = demoMode
    ? []
    : await prisma.dailyLog.findMany({
      where: { userId: user.id, date: { gte: sevenDaysAgo } },
      orderBy: { date: "asc" },
    })

  const days: { date: Date; xp: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const log = recentLogs.find((l) => new Date(l.date).toDateString() === d.toDateString())
    days.push({ date: d, xp: log?.xpEarned ?? 0 })
  }

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const todayLog = recentLogs.find((l) => new Date(l.date).toDateString() === today.toDateString())
  const todayBlocks = todayLog?.blocksCompleted ?? 0
  const weeklyBlocks = recentLogs.reduce((sum, l) => sum + l.blocksCompleted, 0)

  const totalBlocksDone = blockProgress.filter((b) => b.status === "COMPLETED").length
  const totalBlocksAll = curriculum.flatMap((m) => m.weeks.flatMap((w) => w.blocks)).length

  const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            {user.name ? `Hey, ${user.name.split(" ")[0]}` : "Dashboard"}
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {user.name ? "Ready to learn something today?" : "Welcome back!"}
          </p>
        </div>
        {resumeTarget && (
          <Link
            href={`/learning/${resumeTarget.month}#${resumeTarget.blockId}`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-all duration-150 shadow-lg shadow-primary/20"
          >
            Resume
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Stats row — bento */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Level */}
        <Card className="bg-[#111118] border-white/6 hover:border-primary/25 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-widest">Level</p>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Star className="w-3.5 h-3.5 text-indigo-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-indigo-400">{xpProgress.level}</p>
            <p className="text-[11px] text-zinc-600 mt-1">{xpProgress.label}</p>
          </CardContent>
        </Card>

        {/* Total XP */}
        <Card className="bg-[#111118] border-white/6 hover:border-violet-500/25 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-widest">Total XP</p>
              <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-violet-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-zinc-100">{user.totalXP.toLocaleString()}</p>
            <p className="text-[11px] text-zinc-600 mt-1">
              {nextLevel ? `${(nextLevel.xpRequired - user.totalXP).toLocaleString()} to Lv.${nextLevel.level}` : "Max level!"}
            </p>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card className="bg-[#111118] border-white/6 hover:border-orange-500/25 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-widest">Streak</p>
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-orange-400">{user.streak}</p>
            <p className="text-[11px] text-zinc-600 mt-1">day{user.streak !== 1 ? "s" : ""} in a row</p>
          </CardContent>
        </Card>

        {/* Blocks */}
        <Card className="bg-[#111118] border-white/6 hover:border-emerald-500/25 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-widest">Blocks</p>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{totalBlocksDone}</p>
            <p className="text-[11px] text-zinc-600 mt-1">of {totalBlocksAll} total</p>
          </CardContent>
        </Card>
      </div>

      {/* XP Progress to next level */}
      {nextLevel && (
        <Card className="bg-[#111118] border-white/6">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-zinc-200">Level {xpProgress.level} · {xpProgress.label}</span>
              <span className="text-zinc-500 text-xs">{xpProgress.currentLevelXP} / {xpProgress.nextLevelXP} XP</span>
            </div>
            <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                style={{ width: `${xpProgress.progress}%`, boxShadow: "0 0 8px rgba(99,102,241,0.4)" }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-zinc-600">
              <span>{xpProgress.currentLevelXP} XP</span>
              <span>{xpProgress.nextLevelXP} XP · Level {xpProgress.level + 1}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals row */}
      <div data-tour="daily-goal" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="bg-[#111118] border-white/6">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-200">Today&apos;s goal</p>
              <Badge variant={todayBlocks >= user.dailyGoalBlocks ? "success" : "default"} className="text-[11px]">
                {todayBlocks} / {user.dailyGoalBlocks} blocks
              </Badge>
            </div>
            <ProgressBar
              value={user.dailyGoalBlocks > 0 ? Math.min(100, Math.round((todayBlocks / user.dailyGoalBlocks) * 100)) : 0}
              color={todayBlocks >= user.dailyGoalBlocks ? "green" : "indigo"}
            />
            {todayBlocks >= user.dailyGoalBlocks && (
              <p className="text-xs text-emerald-400 font-medium">Goal reached!</p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-[#111118] border-white/6">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-200">This week</p>
              <Badge variant={weeklyBlocks >= user.weeklyGoalBlocks ? "success" : "default"} className="text-[11px]">
                {weeklyBlocks} / {user.weeklyGoalBlocks} blocks
              </Badge>
            </div>
            <ProgressBar
              value={user.weeklyGoalBlocks > 0 ? Math.min(100, Math.round((weeklyBlocks / user.weeklyGoalBlocks) * 100)) : 0}
              color={weeklyBlocks >= user.weeklyGoalBlocks ? "green" : "indigo"}
            />
            {weeklyBlocks >= user.weeklyGoalBlocks && (
              <p className="text-xs text-emerald-400 font-medium">Goal reached!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current month + Body-double row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Current month */}
        <Card className="bg-[#111118] border-white/6">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-indigo-400 font-semibold uppercase tracking-widest">Now studying — Month {currentMonth}</p>
                <h2 className="text-sm font-semibold text-zinc-100 mt-0.5">{currentMonthData.title}</h2>
              </div>
              <Link
                href={`/learning/${currentMonth}`}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                Open
                <ArrowRight className="w-3.5 h-3.5" />
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

        {/* Body-Double Mode */}
        <Card data-tour="body-double" className="bg-[#111118] border-white/6">
          <CardContent className="p-5">
            <BodyDoubleMode />
          </CardContent>
        </Card>
      </div>

      {/* AI + Accountability row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="bg-[#111118] border-white/6">
          <CardContent className="p-5">
            <AiRecommendations />
          </CardContent>
        </Card>
        <Card className="bg-[#111118] border-white/6">
          <CardContent className="p-5">
            <AccountabilityPartner />
          </CardContent>
        </Card>
      </div>

      {/* Activity + Achievements row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* 7-day activity */}
        <Card className="bg-[#111118] border-white/6">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4">7-day activity</h3>
            <div className="flex gap-2 items-end h-16">
              {days.map(({ date, xp }) => {
                const maxXp = Math.max(...days.map((d) => d.xp), 1)
                const height = xp === 0 ? 6 : Math.max(12, Math.round((xp / maxXp) * 64))
                const isToday = date.toDateString() === new Date().toDateString()
                return (
                  <div key={date.toISOString()} className="flex-1 flex flex-col items-center gap-1.5 justify-end">
                    <div
                      className={`w-full rounded-md transition-all ${
                        xp > 0
                          ? isToday
                            ? "bg-gradient-to-t from-indigo-500 to-violet-500"
                            : "bg-indigo-500/50"
                          : "bg-white/5"
                      }`}
                      style={{ height }}
                      title={`${xp} XP`}
                    />
                    <span className={`text-[10px] ${isToday ? "text-indigo-400 font-bold" : "text-zinc-600"}`}>
                      {DAY_LABELS[date.getDay()]}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent achievements */}
        <Card className="bg-[#111118] border-white/6">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-200">Recent achievements</h3>
              <Link href="/progress" className="flex items-center gap-0.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                View all
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recentAchievements.length === 0 ? (
              <p className="text-sm text-zinc-600">No achievements yet — keep going!</p>
            ) : (
              <ul className="space-y-2.5">
                {recentAchievements.map((a) => (
                  <li key={a.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center flex-shrink-0 text-base">
                      {a.icon ?? "🏆"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-200 truncate">{a.label}</p>
                      <p className="text-xs text-zinc-600 truncate">{a.description}</p>
                    </div>
                    {a.xpBonus > 0 && (
                      <span className="text-xs font-semibold text-emerald-400 flex-shrink-0">+{a.xpBonus} XP</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick navigation */}
      <div>
        <h3 className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest mb-3">Quick access</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: `/learning/${currentMonth}`, label: "Continue learning", desc: `Month ${currentMonth}: ${currentMonthData.title}`, icon: BookOpen, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
            { href: "/roadmap", label: "Roadmap", desc: "Track tech skills", icon: MapIcon, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
            { href: "/training", label: "Courses", desc: "External resources", icon: GraduationCap, color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
            { href: "/projects", label: "Projects", desc: "Monthly builds", icon: Rocket, color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
            { href: "/progress", label: "Progress", desc: "XP & achievements", icon: TrendingUp, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
            { href: "/settings", label: "Settings", desc: "Account & preferences", icon: Settings, color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-start gap-3 p-4 bg-[#111118] border border-white/6 rounded-2xl hover:border-white/12 hover:bg-white/3 transition-all duration-150 cursor-pointer group"
              >
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${item.color} group-hover:scale-105 transition-transform duration-150`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-200">{item.label}</p>
                  <p className="text-xs text-zinc-600 mt-0.5 truncate">{item.desc}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
