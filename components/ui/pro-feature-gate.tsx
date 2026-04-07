import Link from "next/link"
import { ProBadge } from "@/components/ui/pro-badge"
import { cn } from "@/lib/utils"

/**
 * ProFeatureGate — inline soft gate for Pro features on the Free tier.
 *
 * ADHD-UX HARD RULES enforced:
 * - NOT a modal, NOT a popup, NOT an overlay.
 * - The gate is a simple inline banner above the muted feature preview.
 * - It is ignorable in one glance — users can see it and scroll past.
 * - The feature UI is still rendered (muted/disabled), showing what's available.
 * - Zero urgency language. Zero countdown. Zero "X features remaining".
 * - MUST NEVER wrap: Pomodoro timer start/stop, block completion, XP display, streak.
 *
 * Usage:
 *   <ProFeatureGate featureName="Focus Sounds" isLocked={!isPro}>
 *     <SoundSelector />
 *   </ProFeatureGate>
 */
interface ProFeatureGateProps {
  featureName: string
  isLocked: boolean
  children: React.ReactNode
  className?: string
}

export function ProFeatureGate({
  featureName,
  isLocked,
  children,
  className,
}: ProFeatureGateProps) {
  if (!isLocked) {
    return <>{children}</>
  }

  return (
    <div className={cn("relative", className)}>
      {/* Inline gate banner — not a modal, not an overlay */}
      <Link
        href="/settings/upgrade"
        className={cn(
          "flex items-center justify-between gap-3 w-full",
          "px-4 py-2.5 mb-3",
          "rounded-xl border border-indigo-500/40 bg-indigo-500/8",
          "text-sm transition-colors hover:bg-indigo-500/14",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        )}
        aria-label={`${featureName} is a Pro feature. Tap to learn more.`}
      >
        <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
          <ProBadge />
          {featureName}
        </span>
        <span className="text-xs text-indigo-400 font-medium whitespace-nowrap">
          Unlock with Pro →
        </span>
      </Link>

      {/* Muted preview of the feature — shows what's available without hiding it */}
      <div
        className="opacity-40 pointer-events-none select-none"
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  )
}
