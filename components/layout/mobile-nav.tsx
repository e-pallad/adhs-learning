"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, GraduationCap, TrendingUp, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"

const MOBILE_ICONS = [LayoutDashboard, BookOpen, GraduationCap, TrendingUp, Settings] as const
const MOBILE_HREFS = ["/", "/learning", "/training", "/progress", "/settings"] as const

interface MobileNavProps {
  t: Dictionary
}

export function MobileNav({ t }: MobileNavProps) {
  const pathname = usePathname()

  const labels = [t.mobileNav.home, t.mobileNav.learn, t.mobileNav.courses, t.mobileNav.progress, t.mobileNav.settings]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile navigation"
    >
      {MOBILE_HREFS.map((href, i) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
        const Icon = MOBILE_ICONS[i]
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] text-xs transition-colors",
              active ? "text-indigo-600" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            )}
          >
            <Icon className={cn("w-5 h-5 flex-shrink-0", active && "stroke-[2.5]")} />
            <span className={cn("font-medium", active && "font-semibold")}>{labels[i]}</span>
          </Link>
        )
      })}
    </nav>
  )
}
