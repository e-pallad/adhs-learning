"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"

interface CelebrationModalProps {
  title: string
  message: string
  xpGained?: number
  leveledUp?: boolean
  newLevel?: number
  achievement?: { icon: string; label: string }
  onClose: () => void
}

export function CelebrationModal({
  title,
  message,
  xpGained,
  leveledUp,
  newLevel,
  achievement,
  onClose,
}: CelebrationModalProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.focus()
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
    >
      <div
        ref={ref}
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 text-center space-y-4 outline-none"
      >
        <div className="text-5xl">{achievement ? achievement.icon : leveledUp ? "🎉" : "✅"}</div>

        <h2 id="celebration-title" className="text-2xl font-bold text-gray-900">
          {title}
        </h2>

        <p className="text-gray-600">{message}</p>

        {xpGained && (
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 rounded-full px-4 py-2 text-sm font-bold">
            <span>+{xpGained} XP</span>
          </div>
        )}

        {leveledUp && newLevel && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl px-6 py-3">
            <p className="text-sm opacity-80">Level up!</p>
            <p className="text-2xl font-bold">Level {newLevel}</p>
          </div>
        )}

        {achievement && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
            <p className="text-xs text-yellow-600 font-medium uppercase tracking-wide">Achievement Unlocked</p>
            <p className="text-sm font-bold text-yellow-800 mt-0.5">{achievement.label}</p>
          </div>
        )}

        <Button onClick={onClose} className="w-full mt-2">
          Keep going!
        </Button>
      </div>
    </div>
  )
}
