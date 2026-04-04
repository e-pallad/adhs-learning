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
    <header className="h-14 border-b border-[#1a1a24] bg-[#0d0d14]/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      {title
        ? <h1 className="text-sm font-semibold text-foreground">{title}</h1>
        : <div />
      }

      <div className="flex items-center gap-3">
        <div data-tour="streak">
          <StreakCounter streak={streak} compact />
        </div>
        <div className="w-px h-4 bg-border" />
        <div data-tour="xp-display">
          <XPDisplay totalXP={totalXP} level={level} compact />
        </div>
        <div className="w-px h-4 bg-border" />
        <TopBarUserMenu name={name ?? null} email={email ?? null} isDemo={isDemo} dict={dict} />
      </div>
    </header>
  )
}
