import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import { getXPProgress, LEVEL_THRESHOLDS, ACHIEVEMENT_DEFINITIONS } from "@/lib/xp"
import { getUserTier, getFeatureFlags } from "@/lib/subscription"
import { RarityBadge } from "@/components/gamification/rarity-badge"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProFeatureGate } from "@/components/ui/pro-feature-gate"
import { Zap, Star, CheckSquare, CalendarDays, Flame, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

export const metadata = { title: "Progress — Devfluent" }

export default async function ProgressPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const xpProgress = getXPProgress(user.totalXP)
  const tier = await getUserTier(user.id)
  const flags = getFeatureFlags(tier)

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  thirtyDaysAgo.setHours(0, 0, 0, 0)

  const [achievements, dailyLogs, blockStats, completedBlocks, allDailyLogs, yearLogs, blockXP, quizXP, githubXP] = await Promise.all([
    prisma.achievement.findMany({
      where: { userId: user.id },
      orderBy: { unlockedAt: "desc" },
    }),
    prisma.dailyLog.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 30,
    }),
    prisma.blockProgress.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: true,
    }),
    prisma.blockProgress.findMany({
      where: { userId: user.id, status: "COMPLETED" },
      select: { blockId: true, month: true, week: true, completedAt: true },
      orderBy: { completedAt: "asc" },
    }),
    prisma.dailyLog.count({
      where: { userId: user.id, OR: [{ blocksCompleted: { gt: 0 } }, { xpEarned: { gt: 0 } }] },
    }),
    // Full year for analytics heatmap (Pro feature)
    prisma.dailyLog.findMany({
      where: {
        userId: user.id,
        date: { gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) },
      },
      select: { date: true, xpEarned: true, blocksCompleted: true },
      orderBy: { date: "asc" },
    }),
    // XP breakdown by source (last 30 days)
    prisma.blockProgress.aggregate({
      where: {
        userId: user.id,
        status: "COMPLETED",
        completedAt: { gte: thirtyDaysAgo },
      },
      _sum: { xpEarned: true },
    }),
    prisma.quizAttempt.aggregate({
      where: {
        userId: user.id,
        attemptedAt: { gte: thirtyDaysAgo },
      },
      _sum: { xpEarned: true },
    }),
    prisma.githubEvent.aggregate({
      where: {
        userId: user.id,
        occurredAt: { gte: thirtyDaysAgo },
      },
      _sum: { xpAwarded: true },
    }),
  ])

  const unlockedSlugs = new Set(achievements.map((a) => a.slug))

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startDay = new Date(today)
  startDay.setDate(today.getDate() - 29)
  const dayOfWeek = startDay.getDay()
  startDay.setDate(startDay.getDate() - dayOfWeek)

  const calendarDays: { date: Date; xp: number; inRange: boolean }[] = []
  const cursor = new Date(startDay)
  while (cursor <= today) {
    const d = new Date(cursor)
    const inRange = d >= new Date(new Date().setDate(today.getDate() - 29) - 1)
    const log = dailyLogs.find((l) => new Date(l.date).toDateString() === d.toDateString())
    calendarDays.push({ date: d, xp: log?.xpEarned ?? 0, inRange })
    cursor.setDate(cursor.getDate() + 1)
  }

  const totalXPFromLogs = dailyLogs.reduce((sum, l) => sum + l.xpEarned, 0)
  const blocksDone = blockStats.find((s) => s.status === "COMPLETED")?._count ?? 0

  // XP breakdown by source (last 30 days)
  const xpBreakdown = [
    { label: "Blocks", xp: blockXP._sum.xpEarned ?? 0, color: "bg-indigo-500" },
    { label: "Quizzes", xp: quizXP._sum.xpEarned ?? 0, color: "bg-violet-500" },
    { label: "GitHub", xp: githubXP._sum.xpAwarded ?? 0, color: "bg-emerald-500" },
    {
      label: "Login / Streaks",
      xp: Math.max(
        0,
        totalXPFromLogs -
          (blockXP._sum.xpEarned ?? 0) -
          (quizXP._sum.xpEarned ?? 0) -
          (githubXP._sum.xpAwarded ?? 0)
      ),
      color: "bg-orange-400",
    },
  ]
  const xpBreakdownTotal = xpBreakdown.reduce((s, b) => s + b.xp, 0)

  // Sort achievements by rarity order: legendary > epic > rare > common
  const RARITY_ORDER = { legendary: 0, epic: 1, rare: 2, common: 3 }
  const sortedDefinitions = [...ACHIEVEMENT_DEFINITIONS].sort(
    (a, b) => RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity]
  )

  const blocksByMonth: Record<number, typeof completedBlocks> = {}
  for (const b of completedBlocks) {
    if (!blocksByMonth[b.month]) blocksByMonth[b.month] = []
    blocksByMonth[b.month].push(b)
  }
  const journeyMonths = Object.keys(blocksByMonth)
    .map(Number)
    .sort((a, b) => b - a)

  const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"]

  // Build 52-week heatmap (Pro analytics feature)
  // Each column is a week (Mon→Sun); rows are day-of-week (0=Sun...6=Sat)
  const WEEK_COUNT = 52
  const heatmapEnd = new Date(today)
  // Snap end to this Saturday
  heatmapEnd.setDate(heatmapEnd.getDate() + (6 - heatmapEnd.getDay()))
  const heatmapStart = new Date(heatmapEnd)
  heatmapStart.setDate(heatmapEnd.getDate() - WEEK_COUNT * 7 + 1)

  const yearLogMap = new Map(
    yearLogs.map((l) => [new Date(l.date).toDateString(), l.xpEarned])
  )

  type HeatCell = { date: Date; xp: number }
  const weeks: HeatCell[][] = []
  const cursor2 = new Date(heatmapStart)
  // Start from Sunday before heatmapStart so columns align on Sunday boundaries
  cursor2.setDate(cursor2.getDate() - cursor2.getDay())

  while (cursor2 <= heatmapEnd) {
    const week: HeatCell[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(cursor2)
      week.push({ date, xp: yearLogMap.get(date.toDateString()) ?? 0 })
      cursor2.setDate(cursor2.getDate() + 1)
    }
    weeks.push(week)
    if (weeks.length >= WEEK_COUNT) break
  }

  const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  // Derive month label positions for the heatmap x-axis
  const monthTicks: { weekIdx: number; label: string }[] = []
  weeks.forEach((week, i) => {
    const firstOfWeek = week[0].date
    if (i === 0 || firstOfWeek.getDate() <= 7) {
      const label = MONTH_LABELS[firstOfWeek.getMonth()]
      if (!monthTicks.find((t) => t.label === label)) {
        monthTicks.push({ weekIdx: i, label })
      }
    }
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Progress</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Your XP history and achievements</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-[#111118] border-white/6">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-widest">Total XP</p>
              <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-violet-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-indigo-400">{user.totalXP.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#111118] border-white/6">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-widest">Level</p>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Star className="w-3.5 h-3.5 text-indigo-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-zinc-100">{xpProgress.level}</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">{xpProgress.label}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#111118] border-white/6">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-widest">Blocks</p>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{blocksDone}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#111118] border-white/6">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-widest">Study days</p>
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <CalendarDays className="w-3.5 h-3.5 text-orange-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-orange-400">{allDailyLogs}</p>
          </CardContent>
        </Card>
      </div>

      {/* XP breakdown — last 30 days */}
      {xpBreakdownTotal > 0 && (
        <Card className="bg-[#111118] border-white/6">
          <CardContent className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-200">XP breakdown — last 30 days</h3>
            {/* Stacked bar */}
            <div className="h-3 rounded-full overflow-hidden flex">
              {xpBreakdown.filter((b) => b.xp > 0).map((b) => (
                <div
                  key={b.label}
                  className={cn("h-full transition-all", b.color)}
                  style={{ width: `${Math.round((b.xp / xpBreakdownTotal) * 100)}%` }}
                  title={`${b.label}: ${b.xp} XP`}
                />
              ))}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3">
              {xpBreakdown.map((b) => (
                <div key={b.label} className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <div className={cn("w-2.5 h-2.5 rounded-sm flex-shrink-0", b.color)} />
                  <span>{b.label}</span>
                  <span className="text-zinc-600">{b.xp} XP</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Level progress */}
      <Card className="bg-[#111118] border-white/6">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-zinc-200">
              Level {xpProgress.level} · {xpProgress.label}
            </span>
            {xpProgress.nextLevelXP ? (
              <span className="text-zinc-500 text-xs">{xpProgress.currentLevelXP} / {xpProgress.nextLevelXP} XP</span>
            ) : (
              <span className="text-indigo-400 font-semibold text-xs">Max level reached!</span>
            )}
          </div>
          <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
              style={{ width: `${xpProgress.progress}%`, boxShadow: "0 0 8px rgba(99,102,241,0.4)" }}
            />
          </div>

          {/* Level grid */}
          <div className="grid grid-cols-5 gap-1.5 mt-1">
            {LEVEL_THRESHOLDS.map((t) => (
              <div
                key={t.level}
                className={cn(
                  "text-center p-2 rounded-xl text-[10px] border transition-colors",
                  t.level <= xpProgress.level
                    ? "bg-indigo-500/12 border-indigo-500/25 text-indigo-300"
                    : "bg-white/3 border-white/6 text-zinc-600"
                )}
              >
                <div className="font-bold text-sm">{t.level}</div>
                <div className="leading-tight text-[9px] mt-0.5">{t.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 30-day activity calendar */}
      <Card className="bg-[#111118] border-white/6">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-4">30-day activity</h3>
          <div className="grid grid-cols-7 gap-1 mb-1.5">
            {DAY_LABELS.map((d, i) => (
              <div key={`${d}-${i}`} className="text-center text-[10px] text-zinc-600 font-medium">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ date, xp, inRange }) => {
              const intensity = !inRange
                ? "bg-transparent"
                : xp === 0
                ? "bg-white/4"
                : xp < 20
                ? "bg-indigo-500/30"
                : xp < 50
                ? "bg-indigo-500/60"
                : "bg-indigo-500"
              const isToday = date.toDateString() === new Date().toDateString()
              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    "aspect-square rounded-md transition-colors",
                    intensity,
                    isToday && inRange ? "ring-1 ring-indigo-400 ring-offset-1 ring-offset-[#111118]" : ""
                  )}
                  title={inRange ? `${date.toLocaleDateString()}: ${xp} XP` : undefined}
                />
              )
            })}
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-[11px] text-zinc-600">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-white/4" />
            <div className="w-3 h-3 rounded-sm bg-indigo-500/30" />
            <div className="w-3 h-3 rounded-sm bg-indigo-500/60" />
            <div className="w-3 h-3 rounded-sm bg-indigo-500" />
            <span>More</span>
          </div>
        </CardContent>
      </Card>

      {/* 52-week analytics heatmap — Pro feature */}
      <Card className="bg-[#111118] border-white/6">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-4">Full-year activity</h3>
          <ProFeatureGate featureName="Full-year heatmap" isLocked={!flags.analyticsHeatmap}>
            <div className="overflow-x-auto">
              {/* Month labels */}
              <div className="flex mb-1" style={{ paddingLeft: "1.5rem" }}>
                {weeks.map((week, i) => {
                  const tick = monthTicks.find((t) => t.weekIdx === i)
                  return (
                    <div key={i} className="flex-shrink-0 w-3.5 text-[9px] text-zinc-600">
                      {tick ? tick.label : ""}
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-px">
                {/* Day-of-week labels */}
                <div className="flex flex-col gap-px mr-1 flex-shrink-0">
                  {["", "M", "", "W", "", "F", ""].map((d, i) => (
                    <div key={i} className="w-4 h-3.5 text-[9px] text-zinc-600 flex items-center justify-end pr-0.5">
                      {d}
                    </div>
                  ))}
                </div>
                {/* Week columns */}
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-px">
                    {week.map(({ date, xp }) => {
                      const inRange = date <= today
                      const intensity = !inRange
                        ? "bg-transparent"
                        : xp === 0
                        ? "bg-white/4"
                        : xp < 20
                        ? "bg-indigo-500/30"
                        : xp < 50
                        ? "bg-indigo-500/60"
                        : "bg-indigo-500"
                      const isToday = date.toDateString() === today.toDateString()
                      return (
                        <div
                          key={date.toISOString()}
                          className={cn(
                            "w-3.5 h-3.5 rounded-sm transition-colors",
                            intensity,
                            isToday ? "ring-1 ring-indigo-400 ring-offset-[1px] ring-offset-[#111118]" : ""
                          )}
                          title={inRange ? `${date.toLocaleDateString()}: ${xp} XP` : undefined}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-[11px] text-zinc-600">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-white/4" />
                <div className="w-3 h-3 rounded-sm bg-indigo-500/30" />
                <div className="w-3 h-3 rounded-sm bg-indigo-500/60" />
                <div className="w-3 h-3 rounded-sm bg-indigo-500" />
                <span>More</span>
              </div>
            </div>
          </ProFeatureGate>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-[#111118] border-white/6">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-zinc-200">
              Achievements
            </h3>
            <span className="text-zinc-600 font-normal text-xs">({achievements.length} / {ACHIEVEMENT_DEFINITIONS.length})</span>
            <div className="ml-auto flex items-center gap-1.5 text-[10px] text-zinc-600">
              <span className="px-1.5 py-0.5 rounded border bg-amber-500/10 text-amber-400 border-amber-500/20">Legendary</span>
              <span className="px-1.5 py-0.5 rounded border bg-violet-500/10 text-violet-400 border-violet-500/20">Epic</span>
              <span className="px-1.5 py-0.5 rounded border bg-blue-500/10 text-blue-400 border-blue-500/20">Rare</span>
              <span className="px-1.5 py-0.5 rounded border bg-zinc-500/10 text-zinc-400 border-zinc-500/20">Common</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {sortedDefinitions.map((def) => {
              const unlocked = unlockedSlugs.has(def.slug)
              const earned = achievements.find((a) => a.slug === def.slug)
              return (
                <div
                  key={def.slug}
                  className={cn(
                    "flex items-start gap-3 p-3.5 rounded-xl border transition-all",
                    unlocked
                      ? def.rarity === "legendary"
                        ? "border-amber-500/30 bg-amber-500/8"
                        : def.rarity === "epic"
                        ? "border-violet-500/25 bg-violet-500/6"
                        : def.rarity === "rare"
                        ? "border-blue-500/25 bg-blue-500/5"
                        : "border-white/8 bg-white/3"
                      : "border-white/5 bg-white/2 opacity-40"
                  )}
                >
                  <span className="text-2xl flex-shrink-0 mt-0.5">{def.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-zinc-200">{def.label}</p>
                      <RarityBadge rarity={def.rarity} />
                      {unlocked && <Badge variant="xp" className="text-[10px] py-0.5">Unlocked</Badge>}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{def.description}</p>
                    <p className="text-xs text-indigo-400 mt-1 font-medium">+{def.xpBonus} XP</p>
                    {earned && (
                      <p className="text-[10px] text-zinc-600 mt-0.5">
                        {new Date(earned.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent logs */}
      {dailyLogs.length > 0 && (
        <Card className="bg-[#111118] border-white/6">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4">Recent activity</h3>
            <div className="space-y-1.5">
              {dailyLogs.slice(0, 14).map((log) => (
                <div key={log.id} className="flex items-center justify-between text-sm py-1.5 border-b border-white/4 last:border-0">
                  <span className="text-zinc-400">
                    {new Date(log.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                  <span className="text-indigo-400 font-semibold text-xs">+{log.xpEarned} XP</span>
                </div>
              ))}
            </div>
            {totalXPFromLogs > 0 && (
              <p className="text-xs text-zinc-600 mt-3 pt-3 border-t border-white/5">
                {totalXPFromLogs.toLocaleString()} XP earned in the last 30 days
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Journey timeline */}
      {completedBlocks.length > 0 && (
        <Card className="bg-[#111118] border-white/6">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-zinc-200">Your Journey</h3>
              <span className="text-xs text-zinc-600 ml-auto">{completedBlocks.length} blocks completed</span>
            </div>

            <div className="relative space-y-5 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-px before:bg-white/8">
              {journeyMonths.map((month) => {
                const blocks = blocksByMonth[month]
                const firstDate = blocks[0]?.completedAt
                const lastDate = blocks[blocks.length - 1]?.completedAt
                const isFullMonth = blocks.length >= 4

                return (
                  <div key={month} className="relative pl-7">
                    <div className={cn(
                      "absolute left-0 top-1.5 w-4 h-4 rounded-full border-2",
                      isFullMonth
                        ? "bg-amber-500/80 border-amber-400"
                        : "bg-[#111118] border-indigo-500"
                    )} />

                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="text-sm font-semibold text-zinc-200">Month {month}</p>
                      <Badge
                        variant={isFullMonth ? "xp" : "default"}
                        className="text-[10px] py-0"
                      >
                        {blocks.length} block{blocks.length !== 1 ? "s" : ""}
                      </Badge>
                      {lastDate && (
                        <span className="text-xs text-zinc-600 ml-auto">
                          {new Date(lastDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>

                    {firstDate && lastDate && firstDate.getTime() !== lastDate.getTime() && (
                      <p className="text-xs text-zinc-600 mb-2">
                        {new Date(firstDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        {" → "}
                        {new Date(lastDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {blocks.map((b) => (
                        <span
                          key={b.blockId}
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/15"
                          title={b.completedAt ? new Date(b.completedAt).toLocaleDateString() : undefined}
                        >
                          W{b.week}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500/80 border-2 border-amber-400 inline-block" />
                Strong month (4+ blocks)
              </span>
              <span className="flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-orange-400" />
                Streak: {user.streak} day{user.streak !== 1 ? "s" : ""}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
