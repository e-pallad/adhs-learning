import { ProgressBar } from "@/components/ui/progress-bar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { CheckCircle2, Lock } from "lucide-react"

interface MonthCardProps {
  month: number
  title: string
  description: string
  completedBlocks: number
  totalBlocks: number
  isLocked?: boolean
  isCurrent?: boolean
  labels: {
    month: string
    current: string
    done: string
    blocks: string
  }
}

export function MonthCard({ month, title, description, completedBlocks, totalBlocks, isLocked, isCurrent, labels }: MonthCardProps) {
  const progress = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0
  const isCompleted = completedBlocks === totalBlocks && totalBlocks > 0

  const content = (
    <div
      className={cn(
        "group relative rounded-2xl border bg-[#111118] p-5 space-y-3 transition-all duration-150",
        isCurrent
          ? "border-indigo-500/40 shadow-lg shadow-indigo-500/8 hover:border-indigo-400/60 hover:shadow-indigo-500/15"
          : isCompleted
          ? "border-emerald-500/25 hover:border-emerald-500/40"
          : isLocked
          ? "border-white/4 opacity-50 cursor-not-allowed"
          : "border-white/6 hover:border-white/12"
      )}
    >
      {/* Month number + status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={cn(
            "inline-flex w-8 h-8 rounded-xl items-center justify-center text-xs font-bold flex-shrink-0",
            isCurrent
              ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25"
              : isCompleted
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
              : "bg-white/5 text-zinc-500 border border-white/8"
          )}>
            {month}
          </span>
          <div>
            <p className="text-[11px] text-zinc-600 font-semibold uppercase tracking-widest">{labels.month} {month}</p>
          </div>
        </div>
        <div>
          {isCurrent && (
            <Badge variant="primary" className="text-[10px] py-0.5">
              {labels.current}
            </Badge>
          )}
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {labels.done}
            </span>
          )}
          {isLocked && (
            <Lock className="w-3.5 h-3.5 text-zinc-600" />
          )}
        </div>
      </div>

      {/* Title + description */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-100 leading-snug">{title}</h3>
        <p className="text-xs text-zinc-600 mt-1 line-clamp-2 leading-relaxed">{description}</p>
      </div>

      {/* Progress */}
      <ProgressBar value={progress} color={isCompleted ? "green" : "indigo"} />

      <div className="flex items-center justify-between text-[11px] text-zinc-600">
        <span>{completedBlocks} / {totalBlocks} {labels.blocks}</span>
        <span className="font-medium text-zinc-500">{progress}%</span>
      </div>
    </div>
  )

  if (isLocked) return content
  return <Link href={`/learning/${month}`} className="block">{content}</Link>
}
