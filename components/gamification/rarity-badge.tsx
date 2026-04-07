import { cn } from "@/lib/utils"
import type { AchievementRarity } from "@/lib/xp"

/**
 * RarityBadge — inline chip showing achievement rarity tier.
 *
 * Colour palette:
 *   Common    — zinc (neutral, unobtrusive)
 *   Rare      — blue/indigo
 *   Epic      — violet/purple
 *   Legendary — amber/gold with shimmer
 */

const RARITY_CONFIG: Record<
  AchievementRarity,
  { label: string; className: string }
> = {
  common: {
    label: "Common",
    className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  },
  rare: {
    label: "Rare",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  },
  epic: {
    label: "Epic",
    className: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  },
  legendary: {
    label: "Legendary",
    className:
      "bg-amber-500/15 text-amber-400 border-amber-500/30 animate-legendary-shimmer",
  },
}

interface RarityBadgeProps {
  rarity: AchievementRarity
  className?: string
}

export function RarityBadge({ rarity, className }: RarityBadgeProps) {
  const { label, className: rarityClass } = RARITY_CONFIG[rarity]
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border tracking-wide uppercase",
        rarityClass,
        className
      )}
    >
      {label}
    </span>
  )
}
