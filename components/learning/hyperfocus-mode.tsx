"use client"

/**
 * HyperfocusMode — CSS-only fullscreen focus shell.
 *
 * When active:
 * - Sidebar, top-bar, and all ambient widgets are visually suppressed (opacity-0)
 *   via a CSS class on <html>. No DOM mutation needed — the sidebar still renders
 *   for screen readers; it's just invisible to sighted users.
 * - The timer content is centered in the full viewport.
 * - Press ESC or click "Exit focus" to leave.
 *
 * ADHD-UX: entering is opt-in (one click). Exiting is always one key/tap away.
 * No unlock prompts, no modals, no data loss.
 */

import { useEffect, useState, useCallback } from "react"
import { Maximize2, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface HyperfocusModeProps {
  children: React.ReactNode
}

export function HyperfocusMode({ children }: HyperfocusModeProps) {
  const [active, setActive] = useState(false)

  const enter = useCallback(() => {
    setActive(true)
    document.documentElement.classList.add("hyperfocus")
  }, [])

  const exit = useCallback(() => {
    setActive(false)
    document.documentElement.classList.remove("hyperfocus")
  }, [])

  // ESC to exit
  useEffect(() => {
    if (!active) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") exit()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [active, exit])

  // Clean up on unmount (navigation away)
  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("hyperfocus")
    }
  }, [])

  return (
    <div className={cn(active && "fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a10]")}>
      {/* Toggle button */}
      <button
        onClick={active ? exit : enter}
        title={active ? "Exit focus mode (Esc)" : "Enter focus mode"}
        aria-label={active ? "Exit hyperfocus mode" : "Enter hyperfocus mode"}
        className={cn(
          "absolute flex items-center gap-1.5 text-xs font-medium transition-colors",
          active
            ? "top-4 right-4 text-zinc-500 hover:text-zinc-200"
            : "top-0 right-0 text-zinc-600 hover:text-zinc-300"
        )}
      >
        {active ? (
          <>
            <Minimize2 className="w-3.5 h-3.5" />
            Exit focus
          </>
        ) : (
          <>
            <Maximize2 className="w-3.5 h-3.5" />
            Fullscreen
          </>
        )}
      </button>

      <div className={cn(active && "w-full max-w-md px-6")}>
        {children}
      </div>
    </div>
  )
}
