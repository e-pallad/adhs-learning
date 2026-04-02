import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, awardXP } from "@/lib/user"
import { isDemoUser } from "@/lib/demo"
import { XP_VALUES } from "@/lib/xp"

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (isDemoUser(user)) {
    return NextResponse.json({ error: "Demo mode is read-only" }, { status: 403 })
  }

  const body = await req.json()
  const { roadmapId, nodeId, nodeLabel, nodeType, status } = body

  if (!roadmapId || !nodeId || !status) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (typeof roadmapId !== "string" || roadmapId.length > 100) {
    return NextResponse.json({ error: "Invalid roadmapId" }, { status: 400 })
  }
  if (typeof nodeId !== "string" || nodeId.length > 100) {
    return NextResponse.json({ error: "Invalid nodeId" }, { status: 400 })
  }
  if (nodeLabel !== undefined && (typeof nodeLabel !== "string" || nodeLabel.length > 200)) {
    return NextResponse.json({ error: "Invalid nodeLabel" }, { status: 400 })
  }

  const validStatuses = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "SKIPPED"]
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, { status: 400 })
  }

  const validNodeTypes = ["topic", "subtopic", "step"]
  if (nodeType && !validNodeTypes.includes(nodeType)) {
    return NextResponse.json({ error: `Invalid nodeType. Must be one of: ${validNodeTypes.join(", ")}` }, { status: 400 })
  }
  const safeNodeType = nodeType && validNodeTypes.includes(nodeType) ? nodeType : "subtopic"

  const { record } = await prisma.$transaction(async (tx) => {
    const existing = await tx.roadmapProgress.findUnique({
      where: { userId_roadmapId_nodeId: { userId: user.id, roadmapId, nodeId } },
    })
    const wasCompleted = existing?.status === "COMPLETED"
    // Use the stored nodeType on updates to prevent XP manipulation via re-submission
    const resolvedNodeType = existing?.nodeType ?? safeNodeType

    const record = await tx.roadmapProgress.upsert({
      where: { userId_roadmapId_nodeId: { userId: user.id, roadmapId, nodeId } },
      create: {
        userId: user.id,
        roadmapId,
        nodeId,
        nodeLabel: nodeLabel ?? nodeId,
        nodeType: safeNodeType,
        status,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
      update: {
        status,
        completedAt: status === "COMPLETED" ? new Date() : null,
        nodeLabel: nodeLabel ?? undefined,
      },
    })

    if (status === "COMPLETED" && !wasCompleted) {
      const xp = resolvedNodeType === "topic" ? XP_VALUES.ROADMAP_TOPIC : XP_VALUES.ROADMAP_SUBTOPIC
      await awardXP(user.id, xp, { db: tx })
    }

    return { record }
  })

  return NextResponse.json({ success: true, record })
}
