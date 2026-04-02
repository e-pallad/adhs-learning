import { XPDisplay } from "@/components/gamification/xp-display"
import { StreakCounter } from "@/components/gamification/streak-counter"
import { TopBarUserMenu } from "@/components/layout/top-bar-user-menu"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"

interface TopBarProps {
  totalXP: number
  level: number
  streak: number
  name?: string | null
  email?: string
  title?: string
  isDemo?: boolean
  dict?: Dictionary
}

export function TopBar({ totalXP, level, streak, name, email, title, isDemo = false, dict }: TopBarProps) {
  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-6">
      {title && <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h1>}
      {!title && <div />}

      <div className="flex items-center gap-4">
        <div data-tour="streak">
          <StreakCounter streak={streak} compact />
        </div>
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
        <div data-tour="xp-display">
          <XPDisplay totalXP={totalXP} level={level} compact />
        </div>
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
        <TopBarUserMenu name={name ?? null} email={email ?? null} isDemo={isDemo} dict={dict} />
      </div>
    </header>
  )
}
