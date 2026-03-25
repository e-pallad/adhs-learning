"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, GraduationCap, TrendingUp, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const MOBILE_NAV = [
  { href: "/",         label: "Home",     icon: LayoutDashboard },
  { href: "/learning", label: "Learn",    icon: BookOpen },
  { href: "/training", label: "Courses",  icon: GraduationCap },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden bg-white border-t border-gray-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile navigation"
    >
      {MOBILE_NAV.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] text-xs transition-colors",
              active ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Icon className={cn("w-5 h-5 flex-shrink-0", active && "stroke-[2.5]")} />
            <span className={cn("font-medium", active && "font-semibold")}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
