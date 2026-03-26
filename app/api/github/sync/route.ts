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

  let totalXPAwarded = 0
  let newEvents = 0

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

    // Idempotent — skip if already recorded
    const existing = await prisma.githubEvent.findUnique({
      where: { userId_eventId: { userId: user.id, eventId: event.id } },
    })
    if (existing) continue

    await prisma.$transaction(async (tx) => {
      await tx.githubEvent.create({
        data: {
          userId: user.id,
          eventId: event.id,
          eventType: event.type,
          xpAwarded: xpToAward,
          occurredAt,
        },
      })
      await awardXP(user.id, xpToAward, { db: tx })
    })
    totalXPAwarded += xpToAward
    newEvents++
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
