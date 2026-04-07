import { cn } from "@/lib/utils"

/**
 * ProBadge — small, non-intrusive inline chip for Pro features.
 *
 * ADHD-UX: Placed AFTER the feature label so users read the feature name first,
 * then see the Pro indicator. Never before — don't lead with the gate.
 *
 * Usage:
 *   <span>Focus Sounds <ProBadge /></span>
 */
export function ProBadge({ className }: { className?: string }) {
  return (
    <span
      aria-label="Pro feature"
      className={cn(
        "inline-flex items-center align-middle",
        "px-1.5 py-0.5 ml-1.5",
        "text-[10px] font-semibold tracking-wide uppercase",
        "rounded bg-gradient-to-r from-indigo-500 to-violet-500 text-white",
        "leading-none select-none",
        className
      )}
    >
      Pro
    </span>
  )
}
