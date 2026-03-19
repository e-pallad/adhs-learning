import { unstable_cache } from "next/cache"

// Node types that represent trackable learning items
const TRACKABLE_TYPES = new Set(["topic", "subtopic", "step"])

export interface RoadmapNode {
  id: string
  label: string
  type: "topic" | "subtopic" | "step"
  legend?: {
    label: string
    color: string
  }
}

export interface RoadmapSection {
  topic: RoadmapNode
  subtopics: RoadmapNode[]
}

export interface RoadmapMeta {
  id: string
  title: string
  description: string
}

export const AVAILABLE_ROADMAPS: RoadmapMeta[] = [
  { id: "frontend", title: "Frontend", description: "HTML, CSS, JS, React and the modern web platform" },
  { id: "backend", title: "Backend", description: "Node.js, databases, APIs and server-side systems" },
  { id: "fullstack", title: "Full Stack", description: "End-to-end web development" },
  { id: "devops", title: "DevOps", description: "CI/CD, containers, cloud infrastructure" },
  { id: "typescript", title: "TypeScript", description: "Type-safe JavaScript" },
  { id: "react", title: "React", description: "Component-driven UI development" },
  { id: "nodejs", title: "Node.js", description: "Server-side JavaScript runtime" },
  { id: "git-github", title: "Git & GitHub", description: "Version control fundamentals" },
]

async function fetchRoadmapRaw(roadmapId: string): Promise<RoadmapSection[]> {
  const url = `https://raw.githubusercontent.com/kamranahmedse/developer-roadmap/master/src/data/roadmaps/${roadmapId}/${roadmapId}.json`

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } }) // cache 24h
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return parseRoadmapNodes(data.nodes ?? [])
  } catch {
    // Fallback: try local mirror
    try {
      const { default: local } = await import(`@/content/roadmaps/${roadmapId}.json`)
      return parseRoadmapNodes(local.nodes ?? [])
    } catch {
      return []
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseRoadmapNodes(nodes: any[]): RoadmapSection[] {
  const trackable = nodes.filter((n) => TRACKABLE_TYPES.has(n.type))

  // Group: topics become section headers, subtopics follow
  const sections: RoadmapSection[] = []
  let currentTopic: RoadmapNode | null = null
  let currentSubtopics: RoadmapNode[] = []

  // Sort by y-position to maintain visual order
  const sorted = [...trackable].sort((a, b) => {
    const ay = a.positionAbsolute?.y ?? a.position?.y ?? 0
    const by = b.positionAbsolute?.y ?? b.position?.y ?? 0
    return ay - by
  })

  for (const node of sorted) {
    const mapped: RoadmapNode = {
      id: node.id,
      label: node.data?.label ?? node.id,
      type: node.type as RoadmapNode["type"],
      legend: node.data?.legend
        ? { label: node.data.legend.label, color: node.data.legend.color }
        : undefined,
    }

    if (node.type === "topic" || node.type === "step") {
      if (currentTopic) {
        sections.push({ topic: currentTopic, subtopics: currentSubtopics })
      }
      currentTopic = mapped
      currentSubtopics = []
    } else if (node.type === "subtopic") {
      currentSubtopics.push(mapped)
    }
  }

  if (currentTopic) {
    sections.push({ topic: currentTopic, subtopics: currentSubtopics })
  }

  return sections
}

export const getRoadmapSections = unstable_cache(
  fetchRoadmapRaw,
  ["roadmap-sections"],
  { revalidate: 86400, tags: ["roadmap"] }
)

export function getAllTrackableNodes(sections: RoadmapSection[]): RoadmapNode[] {
  return sections.flatMap((s) => [s.topic, ...s.subtopics])
}
