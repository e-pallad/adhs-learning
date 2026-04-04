import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

// ──────────────────────────────────────────────────────────────
// Radix-based Progress (used in shadcn patterns)
// ──────────────────────────────────────────────────────────────

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    indicatorClassName?: string
  }
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 rounded-full bg-primary transition-all duration-500 ease-out",
        indicatorClassName
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

// ──────────────────────────────────────────────────────────────
// ProgressBar — legacy-compatible wrapper used throughout pages
// Preserves same API as the old hand-rolled component
// ──────────────────────────────────────────────────────────────

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number // 0–100
  label?: string
  showPercentage?: boolean
  color?: "indigo" | "green" | "yellow" | "red" | "primary"
}

const colorMap: Record<NonNullable<ProgressBarProps["color"]>, string> = {
  indigo: "bg-primary",
  primary: "bg-primary",
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  red: "bg-red-500",
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
  const indicator = colorMap[color] ?? colorMap.indigo

  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      {(label || showPercentage) && (
        <div className="flex justify-between text-xs text-muted-foreground">
          {label && <span>{label}</span>}
          {showPercentage && <span>{clamped}%</span>}
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", indicator)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
