import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, awardXP } from "@/lib/user"
import { XP_VALUES } from "@/lib/xp"

const XP_MAP: Record<string, number> = {
  PushEvent: XP_VALUES.GITHUB_PUSH,
  PullRequestEvent_opened: XP_VALUES.GITHUB_PR_OPENED,
  PullRequestEvent_closed_merged: XP_VALUES.GITHUB_PR_MERGED,
}

interface GithubApiEvent {
  id: string
  type: string
  created_at: string
  payload?: {
    action?: string
    pull_request?: { merged?: boolean }
  }
}

export async function POST() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!user.githubAccessToken || !user.githubUsername) {
    return NextResponse.json({ error: "GitHub not connected" }, { status: 400 })
  }

  // Fetch up to 3 pages of events (300 events max)
  const events: GithubApiEvent[] = []
  for (let page = 1; page <= 3; page++) {
    const res = await fetch(
      `https://api.github.com/users/${user.githubUsername}/events?per_page=100&page=${page}`,
      { headers: { Authorization: `Bearer ${user.githubAccessToken}`, "User-Agent": "Devfluent" } }
    )
    if (!res.ok) break
    const pageEvents = await res.json() as GithubApiEvent[]
    events.push(...pageEvents)
    if (pageEvents.length < 100) break
  }

  // Filter to relevant event types within the last 30 days
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)

  // Classify relevant events
  interface RelevantEvent {
    event: GithubApiEvent
    occurredAt: Date
    xpToAward: number
  }
  const relevant: RelevantEvent[] = []
  for (const event of events) {
    const occurredAt = new Date(event.created_at)
    if (occurredAt < cutoff) continue

    let xpKey: string | null = null
    if (event.type === "PushEvent") {
      xpKey = "PushEvent"
    } else if (event.type === "PullRequestEvent") {
      const action = event.payload?.action
      const merged = event.payload?.pull_request?.merged
      if (action === "opened") xpKey = "PullRequestEvent_opened"
      else if (action === "closed" && merged) xpKey = "PullRequestEvent_closed_merged"
    }

    if (!xpKey) continue
    const xpToAward = XP_MAP[xpKey]
    if (!xpToAward) continue
    relevant.push({ event, occurredAt, xpToAward })
  }

  let totalXPAwarded = 0
  let newEvents = 0

  if (relevant.length > 0) {
    // Single query to find already-recorded events (avoids N+1 inside the loop)
    const knownEventIds = new Set(
      (await prisma.githubEvent.findMany({
        where: { userId: user.id, eventId: { in: relevant.map((r) => r.event.id) } },
        select: { eventId: true },
      })).map((r) => r.eventId)
    )

    const toCreate = relevant.filter((r) => !knownEventIds.has(r.event.id))

    if (toCreate.length > 0) {
      const totalXP = toCreate.reduce((sum, r) => sum + r.xpToAward, 0)

      await prisma.$transaction(async (tx) => {
        await tx.githubEvent.createMany({
          data: toCreate.map((r) => ({
            userId: user.id,
            eventId: r.event.id,
            eventType: r.event.type,
            xpAwarded: r.xpToAward,
            occurredAt: r.occurredAt,
          })),
          skipDuplicates: true,
        })
        await awardXP(user.id, totalXP, { db: tx })
      })

      totalXPAwarded = totalXP
      newEvents = toCreate.length
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { githubLastSyncAt: new Date() },
  })

  return NextResponse.json({ success: true, newEvents, totalXPAwarded })
}

// Disconnect GitHub
export async function DELETE() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await prisma.user.update({
    where: { id: user.id },
    data: { githubUsername: null, githubAccessToken: null, githubLastSyncAt: null },
  })
  return NextResponse.json({ success: true })
}
