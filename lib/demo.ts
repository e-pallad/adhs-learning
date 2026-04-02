import type { User } from "@/app/generated/prisma/client"
import { cookies } from "next/headers"

export const DEMO_SESSION_COOKIE = "devfluent_demo"
export const DEMO_USER_ID = "demo-user"

export async function hasDemoSession(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(DEMO_SESSION_COOKIE)?.value === "1"
}

export function isDemoUser(user: { id: string } | null | undefined): boolean {
  return user?.id === DEMO_USER_ID
}

export function createDemoUser(): User {
  const now = new Date()

  return {
    id: DEMO_USER_ID,
    email: "demo@devfluent.local",
    name: "Demo Guest",
    avatarUrl: null,
    totalXP: 180,
    level: 2,
    streak: 4,
    track: "javascript",
    dailyGoalBlocks: 3,
    weeklyGoalBlocks: 10,
    lastSeenAt: now,
    streakFreezeUsedAt: null,
    githubUsername: null,
    githubAccessToken: null,
    githubLastSyncAt: null,
    apiKey: null,
    createdAt: now,
    updatedAt: now,
  }
}
