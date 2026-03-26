import { cn } from "@/lib/utils"
import type { RoadmapNode } from "@/lib/roadmap"

type NodeStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED"

interface RoadmapNodeItemProps {
  node: RoadmapNode
  status: NodeStatus
  onStatusChange?: (nodeId: string, status: NodeStatus) => void
  indent?: boolean
}

const STATUS_STYLES: Record<NodeStatus, string> = {
  NOT_STARTED: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800",
  IN_PROGRESS: "border-blue-400 bg-blue-50 dark:bg-blue-900/30",
  COMPLETED: "border-green-400 bg-green-50 dark:bg-green-900/30",
  SKIPPED: "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 opacity-60",
}

const STATUS_ICONS: Record<NodeStatus, string> = {
  NOT_STARTED: "○",
  IN_PROGRESS: "◑",
  COMPLETED: "●",
  SKIPPED: "⊘",
}

export function RoadmapNodeItem({ node, status, onStatusChange, indent }: RoadmapNodeItemProps) {
  const cycleStatus = () => {
    if (!onStatusChange) return
    const cycle: NodeStatus[] = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "SKIPPED"]
    const current = cycle.indexOf(status)
    const next = cycle[(current + 1) % cycle.length]
    onStatusChange(node.id, next)
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition-all hover:shadow-sm",
        STATUS_STYLES[status],
        indent && "ml-6"
      )}
      onClick={cycleStatus}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" || e.key === " " ? cycleStatus() : null}
      aria-label={`${node.label} — ${status.replace("_", " ").toLowerCase()}`}
    >
      <span className={cn(
        "text-base flex-shrink-0",
        status === "COMPLETED" && "text-green-500",
        status === "IN_PROGRESS" && "text-blue-500",
        status === "SKIPPED" && "text-gray-400",
        status === "NOT_STARTED" && "text-gray-300",
      )}>
        {STATUS_ICONS[status]}
      </span>

      <span className={cn(
        "text-sm",
        node.type === "topic" ? "font-semibold text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300",
        status === "COMPLETED" && "line-through text-gray-400",
        status === "SKIPPED" && "line-through",
      )}>
        {node.label}
      </span>

      {node.legend && (
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: node.legend.color + "20", color: node.legend.color }}
        >
          {node.legend.label.split("/")[0].trim()}
        </span>
      )}
    </div>
  )
}
