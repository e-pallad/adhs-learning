"use client"

import { getXPProgress } from "@/lib/xp"
import { ProgressBar } from "@/components/ui/progress-bar"
import { cn } from "@/lib/utils"

interface XPDisplayProps {
  totalXP: number
  level: number
  compact?: boolean
  className?: string
}

export function XPDisplay({ totalXP, level, compact, className }: XPDisplayProps) {
  const { label, currentLevelXP, nextLevelXP, progress } = getXPProgress(totalXP)

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 rounded-full px-2 py-0.5">
          Lv.{level}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{totalXP.toLocaleString()} XP</span>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-indigo-600 bg-indigo-50 rounded-full px-3 py-1">
            Level {level}
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {totalXP.toLocaleString()} XP total
        </span>
      </div>
      {nextLevelXP ? (
        <ProgressBar
          value={progress}
          label={`${currentLevelXP} / ${nextLevelXP} XP to Level ${level + 1}`}
          showPercentage
          color="indigo"
        />
      ) : (
        <p className="text-xs text-indigo-600 font-medium">Max level reached!</p>
      )}
    </div>
  )
}
