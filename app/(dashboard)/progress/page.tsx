import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import { getXPProgress, LEVEL_THRESHOLDS, ACHIEVEMENT_DEFINITIONS } from "@/lib/xp"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Star, CheckSquare, CalendarDays, Flame, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

export const metadata = { title: "Progress — Devfluent" }

export default async function ProgressPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const xpProgress = getXPProgress(user.totalXP)

  const [achievements, dailyLogs, blockStats, completedBlocks, allDailyLogs] = await Promise.all([
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

  const blocksByMonth: Record<number, typeof completedBlocks> = {}
  for (const b of completedBlocks) {
    if (!blocksByMonth[b.month]) blocksByMonth[b.month] = []
    blocksByMonth[b.month].push(b)
  }
  const journeyMonths = Object.keys(blocksByMonth)
    .map(Number)
    .sort((a, b) => b - a)

  const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"]

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

      {/* Achievements */}
      <Card className="bg-[#111118] border-white/6">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-4">
            Achievements
            <span className="ml-2 text-zinc-600 font-normal text-xs">({achievements.length} / {ACHIEVEMENT_DEFINITIONS.length})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ACHIEVEMENT_DEFINITIONS.map((def) => {
              const unlocked = unlockedSlugs.has(def.slug)
              const earned = achievements.find((a) => a.slug === def.slug)
              return (
                <div
                  key={def.slug}
                  className={cn(
                    "flex items-start gap-3 p-3.5 rounded-xl border transition-all",
                    unlocked
                      ? "border-amber-500/20 bg-amber-500/5"
                      : "border-white/5 bg-white/2 opacity-50"
                  )}
                >
                  <span className="text-2xl flex-shrink-0 mt-0.5">{def.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-zinc-200">{def.label}</p>
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
