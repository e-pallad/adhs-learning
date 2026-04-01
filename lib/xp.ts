// XP values and level thresholds — single source of truth
// Keep in sync with AGENTS.md

export const XP_VALUES = {
  COMPLETE_BLOCK: 10,
  COMPLETE_BLOCK_POMODORO: 15, // bonus for using the timer
  DAILY_LOGIN: 5,
  STREAK_BONUS_7: 10,
  STREAK_BONUS_30: 25,
  ROADMAP_TOPIC: 10,
  ROADMAP_SUBTOPIC: 5,
  ADD_COURSE: 10,
  COMPLETE_COURSE: 50,
  COMPLETE_PROJECT: 100,
  SKIP_BLOCK: 1,   // small XP even for skipping — keeps momentum
  QUIZ_TRY: 3,     // any attempt
  QUIZ_PASS: 12,   // score >= 70%
  QUIZ_PERFECT: 25, // score 100%
  GITHUB_PUSH: 5,           // per push event (not per commit)
  GITHUB_PR_OPENED: 10,
  GITHUB_PR_MERGED: 20,
} as const

export const LEVEL_THRESHOLDS: { level: number; xpRequired: number; label: string }[] = [
  { level: 1,  xpRequired: 0,     label: "Newcomer" },
  { level: 2,  xpRequired: 150,   label: "Explorer" },
  { level: 3,  xpRequired: 400,   label: "Apprentice" },
  { level: 4,  xpRequired: 800,   label: "Developer" },
  { level: 5,  xpRequired: 1500,  label: "Builder" },
  { level: 6,  xpRequired: 3000,  label: "Engineer" },
  { level: 7,  xpRequired: 5500,  label: "Craftsman" },
  { level: 8,  xpRequired: 9000,  label: "Architect" },
  { level: 9,  xpRequired: 13000, label: "Expert" },
  { level: 10, xpRequired: 18000, label: "Fluent Dev" },
]

export function getLevelFromXP(xp: number): number {
  let level = 1
  for (const threshold of LEVEL_THRESHOLDS) {
    if (xp >= threshold.xpRequired) {
      level = threshold.level
    } else {
      break
    }
  }
  return level
}

export function getLevelInfo(level: number) {
  const current = LEVEL_THRESHOLDS.find((t) => t.level === level)
  const next = LEVEL_THRESHOLDS.find((t) => t.level === level + 1)
  return { current, next }
}

export function getXPProgress(xp: number): {
  level: number
  label: string
  currentLevelXP: number
  nextLevelXP: number | null
  progress: number // 0–100
} {
  const level = getLevelFromXP(xp)
  const current = LEVEL_THRESHOLDS.find((t) => t.level === level)!
  const next = LEVEL_THRESHOLDS.find((t) => t.level === level + 1)

  if (!next) {
    return { level, label: current.label, currentLevelXP: xp, nextLevelXP: null, progress: 100 }
  }

  const currentLevelXP = xp - current.xpRequired
  const nextLevelXP = next.xpRequired - current.xpRequired
  const progress = Math.min(100, Math.floor((currentLevelXP / nextLevelXP) * 100))

  return { level, label: current.label, currentLevelXP, nextLevelXP, progress }
}

export const ACHIEVEMENT_DEFINITIONS: {
  slug: string
  label: string
  description: string
  icon: string
  xpBonus: number
  check: (stats: { streak: number; level: number; totalXP: number; projectsCompleted: number; blocksCompleted: number; quizAttempts?: number; quizzesPassed?: number; perfectQuizzes?: number }) => boolean
}[] = [
  {
    slug: "first_block",
    label: "First Step",
    description: "Complete your first learning block",
    icon: "🎯",
    xpBonus: 10,
    check: (s) => s.blocksCompleted >= 1,
  },
  {
    slug: "streak_3",
    label: "3 Day Streak",
    description: "Study 3 days in a row",
    icon: "🔥",
    xpBonus: 15,
    check: (s) => s.streak >= 3,
  },
  {
    slug: "streak_7",
    label: "One Week Streak",
    description: "Study 7 days in a row",
    icon: "🔥",
    xpBonus: 30,
    check: (s) => s.streak >= 7,
  },
  {
    slug: "streak_30",
    label: "30 Day Streak",
    description: "Study 30 days in a row",
    icon: "⚡",
    xpBonus: 100,
    check: (s) => s.streak >= 30,
  },
  {
    slug: "level_5",
    label: "Level 5",
    description: "Reach level 5: Builder",
    icon: "🏗️",
    xpBonus: 50,
    check: (s) => s.level >= 5,
  },
  {
    slug: "level_10",
    label: "Fluent Dev",
    description: "Reach max level: Fluent Dev",
    icon: "🌟",
    xpBonus: 200,
    check: (s) => s.level >= 10,
  },
  {
    slug: "first_project",
    label: "Ship It",
    description: "Complete your first monthly project",
    icon: "🚀",
    xpBonus: 50,
    check: (s) => s.projectsCompleted >= 1,
  },
  {
    slug: "projects_3",
    label: "Portfolio Builder",
    description: "Complete 3 monthly projects",
    icon: "💼",
    xpBonus: 100,
    check: (s) => s.projectsCompleted >= 3,
  },
  {
    slug: "first-quiz",
    label: "Quiz Taker",
    description: "Complete your first quiz",
    icon: "📝",
    xpBonus: 10,
    check: (s) => (s.quizAttempts ?? 0) >= 1,
  },
  {
    slug: "quiz-master",
    label: "Quiz Master",
    description: "Pass 5 quizzes",
    icon: "🧠",
    xpBonus: 50,
    check: (s) => (s.quizzesPassed ?? 0) >= 5,
  },
  {
    slug: "perfect-score",
    label: "Perfect Score",
    description: "Get 100% on a quiz",
    icon: "💯",
    xpBonus: 25,
    check: (s) => (s.perfectQuizzes ?? 0) >= 1,
  },
]
