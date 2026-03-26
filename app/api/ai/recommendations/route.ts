import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import Anthropic from "@anthropic-ai/sdk"
import { getTrackById, CURRICULUM } from "@/content/curriculum"

const CACHE_HOURS = 24

interface Recommendation {
  title: string
  description: string
  priority: "high" | "medium" | "low"
  icon: string
}

async function generateRecommendations(userId: string): Promise<Recommendation[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      quizAttempts: { orderBy: { attemptedAt: "desc" }, take: 5 },
      blockProgress: { where: { status: "COMPLETED" } },
      dailyLogs: { orderBy: { date: "desc" }, take: 7 },
    },
  })
  if (!user) return []

  const curriculum = getTrackById(user.track)?.months ?? CURRICULUM
  const totalBlocks = curriculum.flatMap((m) => m.weeks.flatMap((w) => w.blocks)).length
  const completedBlocks = user.blockProgress.length

  // Current month (first month with incomplete blocks)
  let currentMonth = 1
  for (const m of curriculum) {
    const monthBlocks = m.weeks.flatMap((w) => w.blocks.map((b) => b.id))
    const done = user.blockProgress.filter((bp) => monthBlocks.includes(bp.blockId)).length
    if (done < monthBlocks.length) {
      currentMonth = m.month
      break
    }
  }

  const recentScores = user.quizAttempts.map((q) => q.score).join(", ") || "none yet"
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayLog = user.dailyLogs.find(
    (l) => new Date(l.date).toDateString() === today.toDateString()
  )
  const weeklyBlocks = user.dailyLogs.reduce((s, l) => s + l.blocksCompleted, 0)

  const prompt = `You are a learning coach for a developer learning platform. Based on this learner's data, provide 3 specific, actionable recommendations. Reply ONLY with a JSON array of objects with keys: title (string, max 8 words), description (string, max 20 words), priority ("high"|"medium"|"low"), icon (single emoji).

Learner data:
- Track: ${user.track}
- Level: ${user.level}, Total XP: ${user.totalXP}
- Streak: ${user.streak} days
- Blocks completed: ${completedBlocks}/${totalBlocks} (month ${currentMonth})
- Recent quiz scores: ${recentScores}
- Daily goal: ${todayLog?.blocksCompleted ?? 0}/${user.dailyGoalBlocks} blocks today
- Weekly goal: ${weeklyBlocks}/${user.weeklyGoalBlocks} blocks this week`

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  })

  const text = message.content[0].type === "text" ? message.content[0].text : ""
  // Extract JSON array from response (may have markdown fences)
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) return []
  return JSON.parse(match[0]) as Recommendation[]
}

async function getOrGenerateRecommendations(userId: string): Promise<NextResponse> {
  try {
    const recommendations = await generateRecommendations(userId)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + CACHE_HOURS)

    await prisma.aiRecommendation.upsert({
      where: { userId },
      create: { userId, content: JSON.stringify(recommendations), expiresAt },
      update: { content: JSON.stringify(recommendations), generatedAt: new Date(), expiresAt },
    })

    return NextResponse.json({ recommendations, cached: false })
  } catch {
    return NextResponse.json({ recommendations: [], cached: false })
  }
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Return cached recommendation if still valid
  const cached = await prisma.aiRecommendation.findUnique({ where: { userId: user.id } })
  if (cached && new Date(cached.expiresAt) > new Date()) {
    return NextResponse.json({
      recommendations: JSON.parse(cached.content) as Recommendation[],
      cached: true,
    })
  }

  return getOrGenerateRecommendations(user.id)
}

export async function POST() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Delete cache to force regeneration
  await prisma.aiRecommendation.deleteMany({ where: { userId: user.id } })

  return getOrGenerateRecommendations(user.id)
}
