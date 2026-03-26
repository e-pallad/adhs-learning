import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number // 0–100
  label?: string
  showPercentage?: boolean
  color?: "indigo" | "green" | "yellow" | "red"
}

export function ProgressBar({
  value,
  label,
  showPercentage,
  color = "indigo",
  className,
  ...props
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  const colors = {
    indigo: "bg-indigo-600",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  }

  return (
    <div className={cn("space-y-1", className)} {...props}>
      {(label || showPercentage) && (
        <div className="flex justify-between text-xs text-gray-500">
          {label && <span>{label}</span>}
          {showPercentage && <span>{clamped}%</span>}
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colors[color])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
