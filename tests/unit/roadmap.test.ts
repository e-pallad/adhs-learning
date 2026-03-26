import { describe, it, expect, vi, afterEach } from "vitest"

// Make unstable_cache a simple passthrough so getRoadmapSections = fetchRoadmapRaw
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}))

import { getRoadmapSections, getAllTrackableNodes, type RoadmapSection } from "@/lib/roadmap"

afterEach(() => {
  vi.unstubAllGlobals()
})

// Helper: build a minimal node as returned by the GitHub roadmap JSON API
function node(
  id: string,
  type: string,
  y = 0,
  label?: string,
  legend?: { label: string; color: string }
) {
  return {
    id,
    type,
    positionAbsolute: { x: 0, y },
    data: { label: label ?? id, legend },
  }
}

function stubFetch(nodes: unknown[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ nodes }),
    })
  )
}

describe("getRoadmapSections", () => {
  it("returns sections from remote fetch response", async () => {
    stubFetch([
      node("topic-1", "topic", 10, "HTML"),
      node("sub-1", "subtopic", 20, "Basics"),
    ])

    const sections = await getRoadmapSections("frontend")

    expect(sections).toHaveLength(1)
    expect(sections[0].topic.label).toBe("HTML")
    expect(sections[0].subtopics).toHaveLength(1)
    expect(sections[0].subtopics[0].label).toBe("Basics")
  })

  it("filters out non-trackable node types (e.g. paragraph, edge)", async () => {
    stubFetch([
      node("topic-1", "topic", 10, "CSS"),
      node("para-1", "paragraph", 15, "Some text"),
      node("edge-1", "edge", 20, "arrow"),
      node("sub-1", "subtopic", 25, "Selectors"),
    ])

    const sections = await getRoadmapSections("frontend")

    // Only topic + subtopic should survive
    expect(sections).toHaveLength(1)
    expect(sections[0].subtopics).toHaveLength(1)
  })

  it("sorts nodes by y-position before grouping", async () => {
    // Pass nodes in reverse y-order
    stubFetch([
      node("topic-2", "topic", 100, "JavaScript"),
      node("topic-1", "topic", 10, "HTML"),
    ])

    const sections = await getRoadmapSections("frontend")

    // HTML (y=10) should come before JavaScript (y=100)
    expect(sections[0].topic.label).toBe("HTML")
    expect(sections[1].topic.label).toBe("JavaScript")
  })

  it("groups subtopics under their preceding topic", async () => {
    stubFetch([
      node("t1", "topic", 10, "HTML"),
      node("s1", "subtopic", 20, "Tags"),
      node("s2", "subtopic", 30, "Attributes"),
      node("t2", "topic", 40, "CSS"),
      node("s3", "subtopic", 50, "Selectors"),
    ])

    const sections = await getRoadmapSections("frontend")

    expect(sections).toHaveLength(2)
    expect(sections[0].topic.label).toBe("HTML")
    expect(sections[0].subtopics.map((s) => s.label)).toEqual(["Tags", "Attributes"])
    expect(sections[1].topic.label).toBe("CSS")
    expect(sections[1].subtopics.map((s) => s.label)).toEqual(["Selectors"])
  })

  it("treats 'step' nodes as section starters (same as topic)", async () => {
    stubFetch([
      node("step-1", "step", 10, "Install Node"),
      node("sub-1", "subtopic", 20, "npm"),
      node("step-2", "step", 30, "Setup Editor"),
    ])

    const sections = await getRoadmapSections("frontend")

    expect(sections).toHaveLength(2)
    expect(sections[0].topic.type).toBe("step")
    expect(sections[0].topic.label).toBe("Install Node")
  })

  it("falls back to node id when label is missing", async () => {
    stubFetch([{ id: "no-label-node", type: "topic", positionAbsolute: { x: 0, y: 0 }, data: {} }])

    const sections = await getRoadmapSections("frontend")

    expect(sections[0].topic.label).toBe("no-label-node")
  })

  it("defaults missing y-position to 0", async () => {
    // Node without positionAbsolute or position
    stubFetch([{ id: "no-pos", type: "topic", data: { label: "No Position" } }])

    const sections = await getRoadmapSections("frontend")

    expect(sections).toHaveLength(1)
    expect(sections[0].topic.label).toBe("No Position")
  })

  it("includes legend data when present", async () => {
    const legend = { label: "Required", color: "#ff0000" }
    stubFetch([node("t1", "topic", 0, "Git", legend)])

    const sections = await getRoadmapSections("frontend")

    expect(sections[0].topic.legend).toEqual(legend)
  })

  it("returns empty array when fetch fails and no local fallback exists", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 })
    )

    const sections = await getRoadmapSections("nonexistent-roadmap-xyz")

    expect(sections).toEqual([])
  })

  it("returns empty array for an empty nodes list", async () => {
    stubFetch([])

    const sections = await getRoadmapSections("frontend")

    expect(sections).toEqual([])
  })
})

describe("getAllTrackableNodes", () => {
  it("flattens sections into a single array of topic + subtopics", () => {
    const sections: RoadmapSection[] = [
      {
        topic: { id: "t1", label: "HTML", type: "topic" },
        subtopics: [
          { id: "s1", label: "Tags", type: "subtopic" },
          { id: "s2", label: "Attributes", type: "subtopic" },
        ],
      },
      {
        topic: { id: "t2", label: "CSS", type: "topic" },
        subtopics: [{ id: "s3", label: "Selectors", type: "subtopic" }],
      },
    ]

    const nodes = getAllTrackableNodes(sections)

    expect(nodes).toHaveLength(5)
    expect(nodes[0].id).toBe("t1")
    expect(nodes[1].id).toBe("s1")
    expect(nodes[2].id).toBe("s2")
    expect(nodes[3].id).toBe("t2")
    expect(nodes[4].id).toBe("s3")
  })

  it("returns empty array for empty sections", () => {
    expect(getAllTrackableNodes([])).toEqual([])
  })

  it("handles topics with no subtopics", () => {
    const sections: RoadmapSection[] = [
      { topic: { id: "t1", label: "Solo Topic", type: "topic" }, subtopics: [] },
    ]

    const nodes = getAllTrackableNodes(sections)

    expect(nodes).toHaveLength(1)
    expect(nodes[0].id).toBe("t1")
  })
})
