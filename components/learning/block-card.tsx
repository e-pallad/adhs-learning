"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PomodoroTimer } from "@/components/learning/pomodoro-timer"
import { CelebrationModal } from "@/components/gamification/celebration-modal"
import { BLOCK_TYPE_COLORS, BLOCK_TYPE_LABELS, type LearningBlock } from "@/content/curriculum"
import { XP_VALUES } from "@/lib/xp"
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"

interface BlockCardProps {
  block: LearningBlock
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED"
  onComplete?: (blockId: string, usedTimer: boolean) => Promise<{ leveledUp?: boolean; newLevel?: number }>
  onSkip?: (blockId: string) => void
}

export function BlockCard({ block, status, onComplete, onSkip }: BlockCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [celebration, setCelebration] = useState<{ leveledUp?: boolean; newLevel?: number } | null>(null)
  const [timerUsed, setTimerUsed] = useState(false)

  const isCompleted = status === "COMPLETED"
  const isSkipped = status === "SKIPPED"

  const handleComplete = async () => {
    if (!onComplete) return
    setLoading(true)
    try {
      const result = await onComplete(block.id, timerUsed)
      setCelebration(result)
    } finally {
      setLoading(false)
    }
  }

  const xpValue = timerUsed ? XP_VALUES.COMPLETE_BLOCK_POMODORO : XP_VALUES.COMPLETE_BLOCK

  return (
    <>
      <Card className={cn(
        "transition-all",
        isCompleted && "border-green-300 bg-green-50",
        isSkipped && "opacity-60"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Status indicator */}
              <button
                onClick={() => !isCompleted && handleComplete()}
                className={cn(
                  "mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors flex items-center justify-center",
                  isCompleted
                    ? "border-green-500 bg-green-500"
                    : "border-gray-300 hover:border-indigo-400 cursor-pointer"
                )}
                aria-label={isCompleted ? "Completed" : "Mark complete"}
              >
                {isCompleted && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={cn(
                    "text-sm font-medium text-gray-900",
                    isCompleted && "line-through text-gray-500"
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

            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0 transition-transform cursor-pointer"
              style={{ transform: expanded ? "rotate(180deg)" : undefined }}
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {expanded && !isCompleted && (
            <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
              {block.resources && block.resources.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Resources</p>
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
                  <p className="text-xs text-gray-400">
                    +{xpValue} XP {timerUsed && <span className="text-green-600">(timer bonus!)</span>}
                  </p>
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
    </>
  )
}
