"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  BookOpen,
  Map,
  GraduationCap,
  Rocket,
  TrendingUp,
  Zap,
  Settings,
  Compass,
} from "lucide-react"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { LanguageSwitcher } from "@/components/language-switcher"
import type { Locale } from "@/lib/i18n/config"

const NAV_ICONS = [LayoutDashboard, BookOpen, Map, GraduationCap, Rocket, TrendingUp] as const
const NAV_HREFS = ["/dashboard", "/learning", "/roadmap", "/training", "/projects", "/progress"] as const
const NAV_TOUR_IDS: (string | undefined)[] = [undefined, "nav-learning", "nav-roadmap", "nav-training", undefined, "nav-progress"]

interface SidebarProps {
  locale: Locale
  t: Dictionary
}

export function Sidebar({ locale, t }: SidebarProps) {
  const pathname = usePathname()

  const navLabels = [t.nav.dashboard, t.nav.learning, t.nav.roadmap, t.nav.courses, t.nav.projects, t.nav.progress]

  return (
    <aside className="hidden md:flex w-56 min-h-screen bg-gray-950 flex-col">
      <div className="p-5 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Devfluent</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_HREFS.map((href, i) => {
          const active = pathname.startsWith(href)
          const Icon = NAV_ICONS[i]
          const tourId = NAV_TOUR_IDS[i]

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              {...(tourId ? { "data-tour": tourId } : {})}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-indigo-600 text-white font-medium"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{navLabels[i]}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-800 space-y-0.5">
        <Link
          href="/settings"
          aria-current={pathname === "/settings" ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname === "/settings"
              ? "bg-indigo-600 text-white font-medium"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          )}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          <span>{t.nav.settings}</span>
        </Link>
        <button
          onClick={() => window.dispatchEvent(new Event("start-tour"))}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors w-full"
        >
          <Compass className="w-4 h-4 flex-shrink-0" />
          <span>{t.nav.tour}</span>
        </button>
        <div className="flex items-center gap-3 px-3 py-2">
          <Link href="/impressum" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">{t.nav.impressum}</Link>
          <Link href="/datenschutz" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">{t.nav.datenschutz}</Link>
          <LanguageSwitcher
            current={locale}
            label={t.locale.switchTo}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors ml-auto"
          />
        </div>
      </div>
    </aside>
  )
}
