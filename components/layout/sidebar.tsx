"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/learning", label: "Learning", icon: "📚" },
  { href: "/roadmap", label: "Roadmap", icon: "🗺️" },
  { href: "/training", label: "Courses", icon: "🎓" },
  { href: "/projects", label: "Projects", icon: "🚀" },
  { href: "/progress", label: "Progress", icon: "📈" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-screen bg-gray-950 flex flex-col">
      <div className="p-5 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="text-lg font-bold text-white tracking-tight">Devfluent</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-indigo-600 text-white font-medium"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-800">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <span>⚙️</span>
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  )
}
