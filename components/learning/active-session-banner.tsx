"use client"

/**
 * ActiveSessionBanner — thin 28px bar shown during an active Pomodoro session.
 *
 * Subscribes to the "pomodoro-state" custom DOM event dispatched by PomodoroTimer.
 * Event detail: { state: "idle" | "running" | "break" | "done", secondsLeft: number }
 *
 * ADHD-UX: non-blocking, no interaction required, no dismiss button.
 * It disappears automatically when the session ends.
 */

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface PomodoroStateEvent {
  state: "idle" | "running" | "break" | "done"
  secondsLeft: number
}

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function ActiveSessionBanner() {
  const [timerState, setTimerState] = useState<PomodoroStateEvent | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<PomodoroStateEvent>).detail
      setTimerState(detail)
    }
    window.addEventListener("pomodoro-state", handler)
    return () => window.removeEventListener("pomodoro-state", handler)
  }, [])

  const visible = timerState?.state === "running" || timerState?.state === "break"

  if (!visible || !timerState) return null

  const isBreak = timerState.state === "break"

  return (
    <div
      role="status"
      aria-live="off"
      className={cn(
        "fixed top-0 left-0 right-0 z-30 flex items-center justify-center gap-2",
        "h-7 px-4 text-xs font-medium",
        isBreak
          ? "bg-emerald-600/90 text-emerald-50"
          : "bg-indigo-600/90 text-indigo-50",
        "backdrop-blur-sm transition-all duration-300"
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full flex-shrink-0",
          isBreak ? "bg-emerald-300 animate-pulse" : "bg-indigo-300 animate-pulse"
        )}
        aria-hidden="true"
      />
      {isBreak
        ? `Break · ${fmt(timerState.secondsLeft)} remaining`
        : `Focus session active · ${fmt(timerState.secondsLeft)} remaining`}
    </div>
  )
}
