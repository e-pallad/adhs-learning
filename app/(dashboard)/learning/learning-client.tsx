"use client"

import { useState } from "react"
import { MonthCard } from "@/components/learning/month-card"
import { UpgradePrompt } from "@/components/ui/upgrade-prompt"

interface MonthItem {
  month: number
  title: string
  description: string
  completedBlocks: number
  totalBlocks: number
  isCurrent: boolean
  isLocked: boolean
}

export function LearningClient({ months }: { months: MonthItem[] }) {
  const [upgradeFor, setUpgradeFor] = useState<string | null>(null)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Learning Path</h1>
        <p className="text-sm text-gray-500 mt-0.5">12-month curriculum — click a month to start studying</p>
      </div>

      {upgradeFor && (
        <UpgradePrompt feature={upgradeFor} onClose={() => setUpgradeFor(null)} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {months.map((m) => (
          <MonthCard
            key={m.month}
            month={m.month}
            title={m.title}
            description={m.description}
            completedBlocks={m.completedBlocks}
            totalBlocks={m.totalBlocks}
            isCurrent={m.isCurrent}
            isLocked={m.isLocked}
            onLockedClick={m.isLocked ? () => setUpgradeFor(`Month ${m.month}: ${m.title}`) : undefined}
          />
        ))}
      </div>
    </div>
  )
}
