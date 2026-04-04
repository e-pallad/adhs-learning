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
      className="fixed bottom-4 left-4 right-4 z-40 flex md:hidden rounded-2xl border border-[#1a1a24] bg-[#0d0d14]/90 backdrop-blur-xl shadow-2xl shadow-black/60 px-2"
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
              "flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] text-[10px] font-medium transition-all duration-150 rounded-xl cursor-pointer",
              active ? "text-primary" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Icon className={cn("w-5 h-5 flex-shrink-0", active && "stroke-[2.5]")} />
            <span>{labels[i]}</span>
          </Link>
        )
      })}
    </nav>
  )
}
