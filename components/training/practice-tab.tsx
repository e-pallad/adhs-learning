"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ExerciseRunner } from "@/components/training/exercise-runner"
import { TRACKS, BLOCK_TYPE_COLORS, BLOCK_TYPE_LABELS } from "@/content/curriculum"
import { ChevronDown, Dumbbell } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Exercise } from "@/content/curriculum/types"

export function PracticeTab({ userTrack }: { userTrack: string }) {
  const track = TRACKS.find((t) => t.meta.id === userTrack) ?? TRACKS[0]
  const [openMonth, setOpenMonth] = useState<number | null>(1)
  const [openExercise, setOpenExercise] = useState<string | null>(null)

  const allExercises = track.months.flatMap((m) =>
    m.weeks.flatMap((w) =>
      w.blocks.flatMap((b) =>
        (b.exercises ?? []).map((ex) => ({ ...ex, blockId: b.id }))
      )
    )
  )

  if (allExercises.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 dark:text-gray-500">
        <Dumbbell className="w-8 h-8 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No exercises yet for this track.</p>
        <p className="text-xs mt-1">See CONTRIBUTING.md to add exercises.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {track.months.map((month) => {
        const monthExercises = month.weeks.flatMap((w) =>
          w.blocks.flatMap((b) => (b.exercises ?? []).length)
        ).reduce((a, b) => a + b, 0)
        if (monthExercises === 0) return null

        const isOpen = openMonth === month.month

        return (
          <div key={month.month} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenMonth(isOpen ? null : month.month)}
              className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-12">
                  Month {month.month}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {month.title}
                </span>
                <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                  {monthExercises} {monthExercises === 1 ? "exercise" : "exercises"}
                </Badge>
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 text-gray-400 transition-transform flex-shrink-0",
                isOpen && "rotate-180"
              )} />
            </button>

            {isOpen && (
              <div className="divide-y divide-gray-100 dark:divide-gray-700 border-t border-gray-100 dark:border-gray-700">
                {month.weeks.map((week) => {
                  const weekBlocks = week.blocks.filter((b) => (b.exercises ?? []).length > 0)
                  if (weekBlocks.length === 0) return null

                  return (
                    <div key={week.week} className="bg-gray-50 dark:bg-gray-800/30">
                      <p className="px-5 py-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                        Week {week.week} — {week.theme}
                      </p>
                      <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                        {weekBlocks.map((block) => (
                          <div key={block.id} className="bg-white dark:bg-gray-800">
                            <div className="px-5 py-3 flex items-center gap-2">
                              <Badge className={BLOCK_TYPE_COLORS[block.type]}>
                                {BLOCK_TYPE_LABELS[block.type]}
                              </Badge>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                {block.title}
                              </span>
                              <span className="text-xs text-gray-400 ml-auto">
                                {block.exercises!.length} {block.exercises!.length === 1 ? "exercise" : "exercises"}
                              </span>
                            </div>
                            <div className="px-5 pb-4 space-y-3">
                              {(block.exercises as Exercise[]).map((ex) => {
                                const key = `${block.id}-${ex.id}`
                                const isExOpen = openExercise === key
                                return (
                                  <div key={ex.id}>
                                    {isExOpen ? (
                                      <div>
                                        <button
                                          onClick={() => setOpenExercise(null)}
                                          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-2"
                                        >
                                          ↑ Collapse
                                        </button>
                                        <ExerciseRunner key={ex.id} exercise={ex} />
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setOpenExercise(key)}
                                        className="w-full text-left border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {ex.title}
                                          </span>
                                          <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
                                            <Dumbbell className="w-3 h-3" />
                                            {ex.tests.length} {ex.tests.length === 1 ? "test" : "tests"}
                                          </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                                          {ex.description.split("\n")[0]}
                                        </p>
                                      </button>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
