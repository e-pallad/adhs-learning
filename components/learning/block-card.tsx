"use client"

import { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PomodoroTimer } from "@/components/learning/pomodoro-timer"
import { CelebrationModal } from "@/components/gamification/celebration-modal"
import { QuizModal } from "@/components/learning/quiz-modal"
import { BLOCK_TYPE_COLORS, BLOCK_TYPE_LABELS, type LearningBlock } from "@/content/curriculum"
import { XP_VALUES } from "@/lib/xp"
import { CELEBRATION_ANIMATIONS_KEY } from "@/lib/preferences"
import { cn } from "@/lib/utils"
import { ChevronDown, Check, StickyNote } from "lucide-react"

interface BlockCardProps {
  block: LearningBlock
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED"
  initialNotes?: string
  onComplete?: (blockId: string, usedTimer: boolean) => Promise<{ leveledUp?: boolean; newLevel?: number }>
  onSkip?: (blockId: string) => void
}

export function BlockCard({ block, status, initialNotes = "", onComplete, onSkip }: BlockCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [celebration, setCelebration] = useState<{ leveledUp?: boolean; newLevel?: number } | null>(null)
  const [timerUsed, setTimerUsed] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizCelebration, setQuizCelebration] = useState<{ xpEarned: number; passed: boolean; perfect: boolean } | null>(null)
  const [celebrationsEnabled] = useState(() => {
    if (typeof window === "undefined") return false
    return window.localStorage.getItem(CELEBRATION_ANIMATIONS_KEY) === "true"
  })
  const [notes, setNotes] = useState(initialNotes)
  const [notesSaving, setNotesSaving] = useState(false)
  const [showNotes, setShowNotes] = useState(false)

  const isCompleted = status === "COMPLETED"
  const isSkipped = status === "SKIPPED"

  const handleComplete = async () => {
    if (!onComplete || loading) return
    setLoading(true)
    try {
      const result = await onComplete(block.id, timerUsed)
      if (celebrationsEnabled) {
        setCelebration(result)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleQuizComplete = (result: {
    xpEarned: number
    passed: boolean
    perfect: boolean
    achievements: unknown[]
  }) => {
    if (result.passed) {
      if (celebrationsEnabled) {
        setQuizCelebration(result)
      }
      if (onComplete && !isCompleted && !loading) {
        setLoading(true)
        onComplete(block.id, timerUsed).finally(() => setLoading(false))
      }
    }
  }

  const xpValue = timerUsed ? XP_VALUES.COMPLETE_BLOCK_POMODORO : XP_VALUES.COMPLETE_BLOCK
  const hasQuiz = block.quiz && block.quiz.length > 0

  const saveNotes = useCallback(async (value: string) => {
    setNotesSaving(true)
    try {
      await fetch("/api/progress/block", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId: block.id, notes: value }),
      })
    } finally {
      setNotesSaving(false)
    }
  }, [block.id])

  return (
    <>
      <Card className={cn(
        "scroll-mt-20",
        "transition-all",
        isCompleted && "border-green-300 bg-green-50",
        isSkipped && "opacity-60"
      )} id={block.id}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Status indicator */}
              <button
                onClick={() => !isCompleted && handleComplete()}
                className={cn(
                  "mt-0.5 flex-shrink-0 p-2 -m-2 rounded-full transition-colors flex items-center justify-center",
                  isCompleted ? "cursor-default" : "cursor-pointer hover:opacity-70"
                )}
                aria-label={isCompleted ? "Completed" : "Mark complete"}
                disabled={isCompleted}
              >
                <span className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                  isCompleted ? "border-green-500 bg-green-500" : "border-gray-300 hover:border-indigo-400"
                )}>
                {isCompleted && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </span>
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={cn(
                    "text-sm font-medium text-gray-900 dark:text-gray-100",
                    isCompleted && "line-through text-gray-500 dark:text-gray-400"
                  )}>
                    {block.title}
                  </h3>
                  <Badge className={BLOCK_TYPE_COLORS[block.type]}>
                    {BLOCK_TYPE_LABELS[block.type]}
                  </Badge>
                  <span className="text-xs text-gray-400">{block.durationMinutes}m</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{block.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Notes toggle */}
              <button
                onClick={() => setShowNotes((v) => !v)}
                className={cn(
                  "p-1.5 rounded-md transition-colors cursor-pointer",
                  showNotes ? "text-indigo-600 bg-indigo-50" : "text-gray-400 hover:text-gray-600",
                  notes && !showNotes && "text-amber-500 hover:text-amber-600"
                )}
                aria-label={showNotes ? "Hide notes" : "Show notes"}
                title="Scratchpad"
              >
                <StickyNote className="w-4 h-4" />
              </button>

              <button
                onClick={() => setExpanded((e) => !e)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 transition-transform cursor-pointer"
                style={{ transform: expanded ? "rotate(180deg)" : undefined }}
                aria-label={expanded ? "Collapse" : "Expand"}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {expanded && !isCompleted && (
            <div className="mt-4 space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
              {block.resources && block.resources.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Resources</p>
                  <ul className="space-y-1">
                    {block.resources.map((r) => (
                      <li key={r.url}>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:underline"
                        >
                          {r.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between">
                <PomodoroTimer
                  blockTitle={block.title}
                  onComplete={() => setTimerUsed(true)}
                />
                <div className="space-y-2 text-right">
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    +{xpValue} XP {timerUsed && <span className="text-green-600">(timer bonus!)</span>}
                  </p>
                  {hasQuiz && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowQuiz(true)}
                      className="block w-full"
                    >
                      Take quiz
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleComplete}
                    loading={loading}
                  >
                    Mark complete
                  </Button>
                  {onSkip && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSkip(block.id)}
                      className="block w-full text-xs"
                    >
                      Skip for now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {showNotes && (
            <div className="mt-3 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                  <StickyNote className="w-3 h-3" />
                  Scratchpad
                </p>
                {notesSaving && <span className="text-xs text-gray-400">Saving…</span>}
              </div>
              <textarea
                className="w-full text-xs text-gray-700 dark:text-gray-300 bg-amber-50 dark:bg-gray-800 border border-amber-200 dark:border-gray-600 rounded-md p-2 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-400 placeholder:text-gray-400"
                rows={3}
                placeholder="Capture thoughts, questions, or code snippets…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={(e) => saveNotes(e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {celebration && (
        <CelebrationModal
          title={celebration.leveledUp ? "Level Up!" : "Block Complete!"}
          message={celebration.leveledUp
            ? `You reached Level ${celebration.newLevel}!`
            : `Great work on "${block.title}"!`
          }
          xpGained={xpValue}
          leveledUp={celebration.leveledUp}
          newLevel={celebration.newLevel}
          onClose={() => setCelebration(null)}
        />
      )}

      {showQuiz && hasQuiz && (
        <QuizModal
          blockId={block.id}
          blockTitle={block.title}
          questions={block.quiz!}
          onComplete={handleQuizComplete}
          onClose={() => setShowQuiz(false)}
        />
      )}

      {quizCelebration && (
        <CelebrationModal
          title={quizCelebration.perfect ? "Perfect Score!" : "Quiz Passed!"}
          message={quizCelebration.perfect
            ? `Flawless on "${block.title}"!`
            : `You passed the quiz for "${block.title}"!`
          }
          xpGained={quizCelebration.xpEarned > 0 ? quizCelebration.xpEarned : undefined}
          onClose={() => setQuizCelebration(null)}
        />
      )}
    </>
  )
}
