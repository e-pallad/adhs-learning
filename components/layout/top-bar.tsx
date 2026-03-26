import { XPDisplay } from "@/components/gamification/xp-display"
import { StreakCounter } from "@/components/gamification/streak-counter"

interface TopBarProps {
  totalXP: number
  level: number
  streak: number
  title?: string
}

export function TopBar({ totalXP, level, streak, title }: TopBarProps) {
  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-6">
      {title && <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h1>}
      {!title && <div />}

      <div className="flex items-center gap-4">
        <StreakCounter streak={streak} compact />
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
        <XPDisplay totalXP={totalXP} level={level} compact />
      </div>
    </header>
  )
}
