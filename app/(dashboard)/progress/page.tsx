import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import { getXPProgress, LEVEL_THRESHOLDS, ACHIEVEMENT_DEFINITIONS } from "@/lib/xp"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Star, CheckSquare, CalendarDays, Flame, Trophy } from "lucide-react"

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

  // Build 30-day calendar aligned to week start (Sunday)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Find the Sunday on or before 29 days ago so the grid aligns
  const startDay = new Date(today)
  startDay.setDate(today.getDate() - 29)
  const dayOfWeek = startDay.getDay() // 0=Sun
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

  // Group completed blocks by month for the journey view
  const blocksByMonth: Record<number, typeof completedBlocks> = {}
  for (const b of completedBlocks) {
    if (!blocksByMonth[b.month]) blocksByMonth[b.month] = []
    blocksByMonth[b.month].push(b)
  }
  const journeyMonths = Object.keys(blocksByMonth)
    .map(Number)
    .sort((a, b) => b - a) // most recent first

  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Progress</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Your XP history and achievements</p>
      </div>

      {/* XP & Level */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Total XP</p>
              <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-violet-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-indigo-600">{user.totalXP.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Level</p>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Star className="w-3.5 h-3.5 text-indigo-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{xpProgress.level}</p>
            <p className="text-xs text-gray-400 mt-0.5">{xpProgress.label}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Blocks done</p>
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckSquare className="w-3.5 h-3.5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600">{blocksDone}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Study days</p>
              <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
                <CalendarDays className="w-3.5 h-3.5 text-orange-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-orange-500">{allDailyLogs}</p>
          </CardContent>
        </Card>
      </div>

      {/* Level progress */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              Level {xpProgress.level}: {xpProgress.label}
            </span>
            {xpProgress.nextLevelXP ? (
              <span className="text-gray-400">{xpProgress.currentLevelXP} / {xpProgress.nextLevelXP} XP</span>
            ) : (
              <span className="text-indigo-600 font-medium">Max level reached!</span>
            )}
          </div>
          <ProgressBar value={xpProgress.progress} color="indigo" />

          <div className="grid grid-cols-5 gap-1 mt-2">
            {LEVEL_THRESHOLDS.map((t) => (
              <div
                key={t.level}
                className={`text-center p-1.5 rounded-lg text-xs ${
                  t.level <= xpProgress.level
                    ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium"
                    : "bg-gray-50 dark:bg-gray-700 text-gray-400"
                }`}
              >
                <div className="font-semibold">{t.level}</div>
                <div className="text-[10px] leading-tight">{t.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 30-day activity calendar */}
      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">30-day activity</h3>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_LABELS.map((d) => (
              <div key={d} className="text-center text-[10px] text-gray-400 font-medium">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ date, xp, inRange }) => {
              const intensity = !inRange
                ? "bg-transparent"
                : xp === 0
                ? "bg-gray-100 dark:bg-gray-700"
                : xp < 20
                ? "bg-indigo-200"
                : xp < 50
                ? "bg-indigo-400"
                : "bg-indigo-600"
              const isToday = date.toDateString() === new Date().toDateString()
              return (
                <div
                  key={date.toISOString()}
                  className={`aspect-square rounded-sm ${intensity} ${isToday && inRange ? "ring-1 ring-indigo-500 ring-offset-1" : ""}`}
                  title={inRange ? `${date.toLocaleDateString()}: ${xp} XP` : undefined}
                />
              )
            })}
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-700" />
            <div className="w-3 h-3 rounded-sm bg-indigo-200" />
            <div className="w-3 h-3 rounded-sm bg-indigo-400" />
            <div className="w-3 h-3 rounded-sm bg-indigo-600" />
            <span>More</span>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Achievements ({achievements.length} / {ACHIEVEMENT_DEFINITIONS.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ACHIEVEMENT_DEFINITIONS.map((def) => {
              const unlocked = unlockedSlugs.has(def.slug)
              const earned = achievements.find((a) => a.slug === def.slug)
              return (
                <div
                  key={def.slug}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${
                    unlocked ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700" : "border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 opacity-60"
                  }`}
                >
                  <span className="text-2xl">{def.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{def.label}</p>
                      {unlocked && <Badge variant="success">Unlocked</Badge>}
                    </div>
                    <p className="text-xs text-gray-500">{def.description}</p>
                    <p className="text-xs text-indigo-600 mt-0.5">+{def.xpBonus} XP</p>
                    {earned && (
                      <p className="text-xs text-gray-400 mt-0.5">
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
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent activity</h3>
            <div className="space-y-2">
              {dailyLogs.slice(0, 14).map((log) => (
                <div key={log.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {new Date(log.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                  <span className="text-indigo-600 font-medium">+{log.xpEarned} XP</span>
                </div>
              ))}
            </div>
            {totalXPFromLogs > 0 && (
              <p className="text-xs text-gray-400 mt-3 border-t border-gray-100 dark:border-gray-700 pt-3">
                {totalXPFromLogs} XP earned in the last 30 days
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Journey — progress replay */}
      {completedBlocks.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Your Journey
              </h3>
              <span className="text-xs text-gray-400 ml-auto">{completedBlocks.length} blocks completed</span>
            </div>

            <div className="relative space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-gray-200 dark:before:bg-gray-700">
              {journeyMonths.map((month) => {
                const blocks = blocksByMonth[month]
                const firstDate = blocks[0]?.completedAt
                const lastDate = blocks[blocks.length - 1]?.completedAt
                const isFullMonth = blocks.length >= 4 // rough milestone: 4+ blocks = meaningful progress

                return (
                  <div key={month} className="relative pl-6">
                    {/* Timeline dot */}
                    <div className={`absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 ${
                      isFullMonth
                        ? "bg-amber-400 border-amber-500"
                        : "bg-white dark:bg-gray-800 border-indigo-400"
                    }`} />

                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Month {month}
                      </p>
                      <Badge variant={isFullMonth ? "success" : "default"} className="text-[10px] py-0">
                        {blocks.length} block{blocks.length !== 1 ? "s" : ""}
                      </Badge>
                      {lastDate && (
                        <span className="text-xs text-gray-400 ml-auto">
                          {new Date(lastDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>

                    {firstDate && lastDate && firstDate.getTime() !== lastDate.getTime() && (
                      <p className="text-xs text-gray-400 mb-1.5">
                        {new Date(firstDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        {" → "}
                        {new Date(lastDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {blocks.map((b) => (
                        <span
                          key={b.blockId}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800"
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

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-amber-400 border-2 border-amber-500 inline-block" />
                Strong progress (4+ blocks)
              </span>
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" />
                Current streak: {user.streak} day{user.streak !== 1 ? "s" : ""}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
