"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"

type TimerState = "idle" | "running" | "break" | "done"

const FOCUS_MINUTES = 25
const BREAK_MINUTES = 5

interface PomodoroTimerProps {
  onComplete?: () => void
  blockTitle?: string
}

export function PomodoroTimer({ onComplete, blockTitle }: PomodoroTimerProps) {
  const [state, setState] = useState<TimerState>("idle")
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MINUTES * 60)
  const [pomodoros, setPomodoros] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stateRef = useRef<TimerState>("idle")
  const onCompleteRef = useRef(onComplete)
  stateRef.current = state
  onCompleteRef.current = onComplete

  const secondsLeftRef = useRef(FOCUS_MINUTES * 60)
  const tickRef = useRef<() => void>(() => {})

  const clear = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  const tick = useCallback(() => {
    secondsLeftRef.current -= 1
    setSecondsLeft(secondsLeftRef.current)
    if (secondsLeftRef.current > 0) return
    clear()
    if (stateRef.current === "running") {
      setPomodoros((p) => p + 1)
      setState("break")
      secondsLeftRef.current = BREAK_MINUTES * 60
      setSecondsLeft(BREAK_MINUTES * 60)
      intervalRef.current = setInterval(() => tickRef.current(), 1000)
    } else if (stateRef.current === "break") {
      setState("done")
      onCompleteRef.current?.()
    }
  }, [clear])
  tickRef.current = tick

  useEffect(() => () => clear(), [clear])

  const start = () => {
    secondsLeftRef.current = FOCUS_MINUTES * 60
    setState("running")
    setSecondsLeft(FOCUS_MINUTES * 60)
    clear()
    intervalRef.current = setInterval(tick, 1000)
  }

  const pause = () => {
    clear()
    setState("idle")
  }

  const reset = () => {
    clear()
    setState("idle")
    secondsLeftRef.current = FOCUS_MINUTES * 60
    setSecondsLeft(FOCUS_MINUTES * 60)
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

  const totalSeconds = state === "break" ? BREAK_MINUTES * 60 : FOCUS_MINUTES * 60
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100

  return (
    <div className="flex flex-col items-center gap-4">
      {blockTitle && (
        <p className="text-sm text-gray-500 text-center max-w-xs truncate">{blockTitle}</p>
      )}

      {/* Timer ring */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke={state === "break" ? "#10b981" : "#6366f1"}
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 54}`}
            strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-mono text-gray-900">{display}</span>
          <span className="text-xs text-gray-400">{state === "break" ? "Break" : "Focus"}</span>
        </div>
      </div>

      {pomodoros > 0 && (
        <div className="flex gap-1">
          {Array.from({ length: pomodoros }).map((_, i) => (
            <span key={i} className="text-base">🍅</span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {state === "idle" || state === "done" ? (
          <Button onClick={start} size="sm">
            {state === "done" ? "Another round" : "Start"}
          </Button>
        ) : (
          <Button onClick={pause} variant="secondary" size="sm">Pause</Button>
        )}
        {state !== "idle" && (
          <Button onClick={reset} variant="ghost" size="sm">Reset</Button>
        )}
      </div>
    </div>
  )
}
