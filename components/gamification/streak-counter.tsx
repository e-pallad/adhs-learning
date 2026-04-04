"use client"

import { cn } from "@/lib/utils"
import { Flame, Zap } from "lucide-react"

interface StreakCounterProps {
  streak: number
  compact?: boolean
  className?: string
}

export function StreakCounter({ streak, compact, className }: StreakCounterProps) {
  const isOnFire = streak >= 30

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {isOnFire ? (
          <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        ) : (
          <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
        )}
        <span className="text-sm font-bold text-zinc-200">{streak}</span>
      </div>
    )
  }

  return (
    <div className={cn("text-center space-y-1", className)}>
      <div className="flex justify-center">
        {isOnFire ? (
          <Zap className="w-10 h-10 text-yellow-400 fill-yellow-400" />
        ) : (
          <Flame className="w-10 h-10 text-orange-400 fill-orange-400" />
        )}
      </div>
      <div className="text-3xl font-bold text-white">{streak}</div>
      <div className="text-sm text-zinc-500">day streak</div>
      {streak === 0 && (
        <p className="text-xs text-zinc-500">Complete a block to start your streak</p>
      )}
      {streak >= 3 && streak < 7 && (
        <p className="text-xs text-indigo-400 font-medium">{7 - streak} days to 7-day bonus!</p>
      )}
      {streak >= 7 && streak < 30 && (
        <p className="text-xs text-orange-400 font-medium">{30 - streak} days to 30-day bonus!</p>
      )}
    </div>
  )
}
