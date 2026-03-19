import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { roadmapId, nodeId, nodeLabel, nodeType, status } = body

  if (!roadmapId || !nodeId || !status) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const validStatuses = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "SKIPPED"]
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const record = await prisma.roadmapProgress.upsert({
    where: { userId_roadmapId_nodeId: { userId: user.id, roadmapId, nodeId } },
    create: {
      userId: user.id,
      roadmapId,
      nodeId,
      nodeLabel: nodeLabel ?? nodeId,
      nodeType: nodeType ?? "subtopic",
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
    update: {
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
      nodeLabel: nodeLabel ?? undefined,
    },
  })

  return NextResponse.json({ success: true, record })
}
