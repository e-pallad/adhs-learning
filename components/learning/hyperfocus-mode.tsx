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
 * - A dismissible ESC hint appears for 3 s on first enter so the shortcut is
 *   always discoverable.
 *
 * ADHD-UX: entering is opt-in (one click). Exiting is always one key/tap away.
 * No unlock prompts, no modals, no data loss.
 */

import { useEffect, useState, useCallback, useRef } from "react"
import { Maximize2, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface HyperfocusModeProps {
  children: React.ReactNode
}

export function HyperfocusMode({ children }: HyperfocusModeProps) {
  const [active, setActive] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const enter = useCallback(() => {
    setActive(true)
    document.documentElement.classList.add("hyperfocus")
    // Show ESC hint for 3 s on every enter
    setShowHint(true)
    hintTimerRef.current = setTimeout(() => setShowHint(false), 3000)
  }, [])

  const exit = useCallback(() => {
    setActive(false)
    document.documentElement.classList.remove("hyperfocus")
    setShowHint(false)
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
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
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
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

      {/* ESC hint — auto-fades after 3 s, tap to dismiss early */}
      {active && showHint && (
        <button
          onClick={() => setShowHint(false)}
          aria-label="Dismiss hint"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-xs text-zinc-400 animate-fade-out-slow"
        >
          <kbd className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-zinc-300">Esc</kbd>
          to exit focus mode
        </button>
      )}

      <div className={cn(active && "w-full max-w-md px-6")}>
        {children}
      </div>
    </div>
  )
}
