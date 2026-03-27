import type { User } from "@/app/generated/prisma/client"

export const PLAN_LIMITS = {
  free: {
    maxMonths: 3,
    maxCourses: 2,
  },
  pro: {
    maxMonths: 12,
    maxCourses: Infinity,
  },
} as const

export function isPro(user: Pick<User, "plan" | "planExpiresAt">): boolean {
  if (user.plan !== "pro") return false
  if (!user.planExpiresAt) return true
  return user.planExpiresAt > new Date()
}

export function canAccessMonth(
  user: Pick<User, "plan" | "planExpiresAt">,
  month: number,
): boolean {
  if (isPro(user)) return true
  return month <= PLAN_LIMITS.free.maxMonths
}

export function canAddCourse(
  user: Pick<User, "plan" | "planExpiresAt">,
  currentCount: number,
): boolean {
  if (isPro(user)) return true
  return currentCount < PLAN_LIMITS.free.maxCourses
}
