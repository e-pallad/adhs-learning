"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { BlockCard } from "@/components/learning/block-card"
import type { LearningBlock } from "@/content/curriculum"

interface WeekSectionProps {
  weekNumber: number
  theme: string
  blocks: LearningBlock[]
  statusMap: Record<string, "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED">
}

export function WeekSection({ weekNumber, theme, blocks, statusMap }: WeekSectionProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const handleComplete = async (blockId: string, usedTimer: boolean) => {
    const res = await fetch("/api/progress/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockId, status: "COMPLETED", usedTimer }),
    })
    const data = await res.json()
    startTransition(() => router.refresh())
    return { leveledUp: data.leveledUp, newLevel: data.newLevel }
  }

  const handleSkip = (blockId: string) => {
    fetch("/api/progress/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockId, status: "SKIPPED" }),
    })
    startTransition(() => router.refresh())
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <h3 className="text-sm font-semibold text-gray-900">Week {weekNumber}</h3>
        <span className="text-xs text-gray-400">{theme}</span>
      </div>
      <div className="space-y-2">
        {blocks.map((block) => (
          <BlockCard
            key={block.id}
            block={block}
            status={statusMap[block.id] ?? "NOT_STARTED"}
            onComplete={handleComplete}
            onSkip={handleSkip}
          />
        ))}
      </div>
    </div>
  )
}
