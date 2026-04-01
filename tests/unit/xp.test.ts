import { describe, it, expect } from "vitest"
import {
  getLevelFromXP,
  getXPProgress,
  ACHIEVEMENT_DEFINITIONS,
  LEVEL_THRESHOLDS,
} from "@/lib/xp"

describe("getLevelFromXP", () => {
  it("returns level 1 at 0 XP", () => {
    expect(getLevelFromXP(0)).toBe(1)
  })

  it("stays at level 1 just below threshold", () => {
    expect(getLevelFromXP(149)).toBe(1)
  })

  it("advances to level 2 at exactly 150 XP", () => {
    expect(getLevelFromXP(150)).toBe(2)
  })

  it("advances to level 3 at exactly 400 XP", () => {
    expect(getLevelFromXP(400)).toBe(3)
  })

  it("returns max level 10 at 18000 XP", () => {
    expect(getLevelFromXP(18000)).toBe(10)
  })

  it("returns max level 10 above the max threshold", () => {
    expect(getLevelFromXP(99999)).toBe(10)
  })

  it("covers all level thresholds exactly", () => {
    for (const threshold of LEVEL_THRESHOLDS) {
      expect(getLevelFromXP(threshold.xpRequired)).toBe(threshold.level)
    }
  })
})

describe("getXPProgress", () => {
  it("returns level 1 with 0% progress at 0 XP", () => {
    const result = getXPProgress(0)
    expect(result.level).toBe(1)
    expect(result.progress).toBe(0)
    expect(result.currentLevelXP).toBe(0)
    expect(result.nextLevelXP).toBe(150)
  })

  it("calculates 50% progress at midpoint of level 1", () => {
    const result = getXPProgress(75)
    expect(result.level).toBe(1)
    expect(result.progress).toBe(50)
  })

  it("returns null nextLevelXP and 100% progress at max level", () => {
    const result = getXPProgress(18000)
    expect(result.level).toBe(10)
    expect(result.nextLevelXP).toBeNull()
    expect(result.progress).toBe(100)
  })

  it("calculates currentLevelXP relative to current level start", () => {
    // Level 2 starts at 150 XP; at 200 XP we're 50 into level 2
    const result = getXPProgress(200)
    expect(result.level).toBe(2)
    expect(result.currentLevelXP).toBe(50)
  })

  it("does not exceed 100% progress", () => {
    const result = getXPProgress(99999)
    expect(result.progress).toBeLessThanOrEqual(100)
  })
})

describe("ACHIEVEMENT_DEFINITIONS check functions", () => {
  const base = { streak: 0, level: 1, totalXP: 0, projectsCompleted: 0, blocksCompleted: 0 }

  it("first_block: false with 0 blocks, true with 1", () => {
    const def = ACHIEVEMENT_DEFINITIONS.find((d) => d.slug === "first_block")!
    expect(def.check({ ...base, blocksCompleted: 0 })).toBe(false)
    expect(def.check({ ...base, blocksCompleted: 1 })).toBe(true)
  })

  it("streak_3: false with streak 2, true with 3", () => {
    const def = ACHIEVEMENT_DEFINITIONS.find((d) => d.slug === "streak_3")!
    expect(def.check({ ...base, streak: 2 })).toBe(false)
    expect(def.check({ ...base, streak: 3 })).toBe(true)
  })

  it("streak_7: false with streak 6, true with 7", () => {
    const def = ACHIEVEMENT_DEFINITIONS.find((d) => d.slug === "streak_7")!
    expect(def.check({ ...base, streak: 6 })).toBe(false)
    expect(def.check({ ...base, streak: 7 })).toBe(true)
  })

  it("streak_30: false with streak 29, true with 30", () => {
    const def = ACHIEVEMENT_DEFINITIONS.find((d) => d.slug === "streak_30")!
    expect(def.check({ ...base, streak: 29 })).toBe(false)
    expect(def.check({ ...base, streak: 30 })).toBe(true)
  })

  it("level_5: false at level 4, true at level 5", () => {
    const def = ACHIEVEMENT_DEFINITIONS.find((d) => d.slug === "level_5")!
    expect(def.check({ ...base, level: 4 })).toBe(false)
    expect(def.check({ ...base, level: 5 })).toBe(true)
  })

  it("level_10: false at level 9, true at level 10", () => {
    const def = ACHIEVEMENT_DEFINITIONS.find((d) => d.slug === "level_10")!
    expect(def.check({ ...base, level: 9 })).toBe(false)
    expect(def.check({ ...base, level: 10 })).toBe(true)
  })

  it("first_project: false with 0 projects, true with 1", () => {
    const def = ACHIEVEMENT_DEFINITIONS.find((d) => d.slug === "first_project")!
    expect(def.check({ ...base, projectsCompleted: 0 })).toBe(false)
    expect(def.check({ ...base, projectsCompleted: 1 })).toBe(true)
  })

  it("projects_3: false with 2 projects, true with 3", () => {
    const def = ACHIEVEMENT_DEFINITIONS.find((d) => d.slug === "projects_3")!
    expect(def.check({ ...base, projectsCompleted: 2 })).toBe(false)
    expect(def.check({ ...base, projectsCompleted: 3 })).toBe(true)
  })
})
