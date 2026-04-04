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
    <aside className="hidden md:flex w-64 min-h-screen flex-col bg-[#0d0d14] border-r border-[#1a1a24]">
      {/* Logo */}
      <div className="p-5 border-b border-[#1a1a24]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Devfluent</span>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Navigation
        </p>
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
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer",
                active
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0 transition-colors", active ? "text-primary" : "")} />
              <span>{navLabels[i]}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-[#1a1a24] space-y-0.5">
        <Link
          href="/settings"
          aria-current={pathname === "/settings" ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer",
            pathname === "/settings"
              ? "bg-primary/15 text-primary"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
          )}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          <span>{t.nav.settings}</span>
        </Link>
        <button
          onClick={() => window.dispatchEvent(new Event("start-tour"))}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all duration-150 w-full cursor-pointer"
        >
          <Compass className="w-4 h-4 flex-shrink-0" />
          <span>{t.nav.tour}</span>
        </button>
        <div className="flex items-center gap-2 px-3 py-2">
          <Link href="/impressum" className="text-[11px] text-zinc-700 hover:text-zinc-400 transition-colors">{t.nav.impressum}</Link>
          <span className="text-zinc-800">·</span>
          <Link href="/datenschutz" className="text-[11px] text-zinc-700 hover:text-zinc-400 transition-colors">{t.nav.datenschutz}</Link>
          <LanguageSwitcher
            current={locale}
            label={t.locale.switchTo}
            className="text-[11px] text-zinc-700 hover:text-zinc-400 transition-colors ml-auto"
          />
        </div>
      </div>
    </aside>
  )
}
