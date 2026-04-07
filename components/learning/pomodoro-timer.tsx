"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { FocusSounds } from "./focus-sounds"
import { ProFeatureGate } from "@/components/ui/pro-feature-gate"
import { toast } from "sonner"

type TimerState = "idle" | "running" | "break" | "done"

const FOCUS_MINUTES = 25
const BREAK_MINUTES = 5

interface PomodoroTimerProps {
  onComplete?: () => void
  blockTitle?: string
  isProUser?: boolean
}

export function PomodoroTimer({ onComplete, blockTitle, isProUser = false }: PomodoroTimerProps) {
  const [state, setState] = useState<TimerState>("idle")
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MINUTES * 60)
  const [pomodoros, setPomodoros] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stateRef = useRef<TimerState>("idle")
  const onCompleteRef = useRef(onComplete)
  const secondsLeftRef = useRef(FOCUS_MINUTES * 60)
  const tickRef = useRef<() => void>(() => {})
  const warnedRef = useRef(false)

  const clear = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  const dispatchState = useCallback((timerState: TimerState, secs: number) => {
    window.dispatchEvent(
      new CustomEvent("pomodoro-state", { detail: { state: timerState, secondsLeft: secs } })
    )
  }, [])

  const tick = useCallback(() => {
    secondsLeftRef.current -= 1
    setSecondsLeft(secondsLeftRef.current)
    dispatchState(stateRef.current, secondsLeftRef.current)

    if (stateRef.current === "running" && secondsLeftRef.current === 120 && !warnedRef.current) {
      warnedRef.current = true
      toast("2-minute heads-up", {
        description: "Session ending soon. Wrap up your current thought.",
      })
    }

    if (secondsLeftRef.current > 0) return
    clear()
    if (stateRef.current === "running") {
      setPomodoros((p) => p + 1)
      setState("break")
      secondsLeftRef.current = BREAK_MINUTES * 60
      setSecondsLeft(BREAK_MINUTES * 60)
      dispatchState("break", BREAK_MINUTES * 60)
      intervalRef.current = setInterval(() => tickRef.current(), 1000)
    } else if (stateRef.current === "break") {
      setState("done")
      dispatchState("done", 0)
      onCompleteRef.current?.()
    }
  }, [clear, dispatchState])

  useEffect(() => { stateRef.current = state }, [state])
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])
  useEffect(() => { tickRef.current = tick }, [tick])
  useEffect(() => () => {
    clear()
    // Clear banner on unmount
    window.dispatchEvent(new CustomEvent("pomodoro-state", { detail: { state: "idle", secondsLeft: 0 } }))
  }, [clear])

  const start = () => {
    warnedRef.current = false
    secondsLeftRef.current = FOCUS_MINUTES * 60
    setState("running")
    setSecondsLeft(FOCUS_MINUTES * 60)
    dispatchState("running", FOCUS_MINUTES * 60)
    clear()
    intervalRef.current = setInterval(tick, 1000)
  }

  const pause = () => {
    clear()
    setState("idle")
    dispatchState("idle", secondsLeftRef.current)
  }

  const reset = () => {
    clear()
    warnedRef.current = false
    setState("idle")
    secondsLeftRef.current = FOCUS_MINUTES * 60
    setSecondsLeft(FOCUS_MINUTES * 60)
    dispatchState("idle", FOCUS_MINUTES * 60)
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

  const totalSeconds = state === "break" ? BREAK_MINUTES * 60 : FOCUS_MINUTES * 60
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100
  const remainingPercent = Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100))
  const timerColor = state === "break" ? "#10b981" : "#6366f1"

  return (
    <div className="flex flex-col items-center gap-4">
      {blockTitle && (
        <p className="text-sm text-gray-500 text-center max-w-xs truncate">{blockTitle}</p>
      )}

      {/* Timer ring + shrinking pie */}
      <div className="relative w-40 h-40">
        <div
          className="absolute inset-5 rounded-full border border-gray-200 dark:border-gray-700"
          style={{
            background: `conic-gradient(${timerColor} ${remainingPercent}%, #e5e7eb ${remainingPercent}% 100%)`,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-[32px] rounded-full bg-white dark:bg-gray-900" aria-hidden="true" />
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke={timerColor}
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 54}`}
            strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-mono text-gray-900 dark:text-gray-100">{display}</span>
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

      <ProFeatureGate featureName="Focus Sounds" isLocked={!isProUser}>
        <FocusSounds playing={state === "running"} />
      </ProFeatureGate>
    </div>
  )
}
