import { Card, CardContent } from "@/components/ui/card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { CURRICULUM } from "@/content/curriculum"
import { cn } from "@/lib/utils"

interface MonthCardProps {
  month: number
  completedBlocks: number
  totalBlocks: number
  isLocked?: boolean
  isCurrent?: boolean
}

export function MonthCard({ month, completedBlocks, totalBlocks, isLocked, isCurrent }: MonthCardProps) {
  const data = CURRICULUM.find((m) => m.month === month)
  if (!data) return null

  const progress = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0
  const isCompleted = completedBlocks === totalBlocks && totalBlocks > 0

  const content = (
    <Card className={cn(
      "transition-all hover:shadow-md",
      isCurrent && "border-indigo-400 ring-1 ring-indigo-300",
      isLocked && "opacity-60 cursor-not-allowed",
      isCompleted && "border-green-300"
    )}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Month {month}</p>
            <h3 className="text-sm font-semibold text-gray-900 mt-0.5">{data.title}</h3>
          </div>
          <div className="flex flex-col items-end gap-1">
            {isCurrent && <Badge variant="info">Current</Badge>}
            {isCompleted && <Badge variant="success">Done</Badge>}
          </div>
        </div>

        <p className="text-xs text-gray-500 line-clamp-2">{data.description}</p>

        <ProgressBar value={progress} showPercentage color={isCompleted ? "green" : "indigo"} />

        <p className="text-xs text-gray-400">{completedBlocks} / {totalBlocks} blocks</p>
      </CardContent>
    </Card>
  )

  if (isLocked) return content

  return <Link href={`/learning/${month}`} className="block">{content}</Link>
}
