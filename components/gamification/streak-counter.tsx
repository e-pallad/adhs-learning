"use client"

import { cn } from "@/lib/utils"

interface StreakCounterProps {
  streak: number
  compact?: boolean
  className?: string
}

export function StreakCounter({ streak, compact, className }: StreakCounterProps) {
  const isHot = streak >= 7
  const isOnFire = streak >= 30

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <span>{isOnFire ? "⚡" : "🔥"}</span>
        <span className="text-sm font-bold text-gray-700">{streak}</span>
      </div>
    )
  }

  return (
    <div className={cn("text-center space-y-1", className)}>
      <div className="text-4xl">{isOnFire ? "⚡" : isHot ? "🔥" : "🔥"}</div>
      <div className="text-3xl font-bold text-gray-900">{streak}</div>
      <div className="text-sm text-gray-500">day streak</div>
      {streak === 0 && (
        <p className="text-xs text-gray-400">Complete a block to start your streak</p>
      )}
      {streak >= 3 && streak < 7 && (
        <p className="text-xs text-indigo-600 font-medium">{7 - streak} days to 7-day bonus!</p>
      )}
      {streak >= 7 && streak < 30 && (
        <p className="text-xs text-orange-600 font-medium">{30 - streak} days to 30-day bonus!</p>
      )}
    </div>
  )
}
