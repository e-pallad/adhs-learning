# Testing & CI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Vitest unit + integration tests and a GitHub Actions CI pipeline to Devfluent.

**Architecture:** Vitest with `vite-tsconfig-paths` for path alias resolution. Unit tests cover pure functions in `lib/xp.ts` and `lib/utils.ts`. Integration tests import route handlers and `lib/user.ts` functions directly, using a real Postgres test DB and a single `vi.mock` for Supabase auth. Each integration test file has its own dedicated test user; `beforeEach` resets mutable state.

**Tech Stack:** Vitest, @vitest/coverage-v8, vite-tsconfig-paths, dotenv-cli, Docker Postgres 16, GitHub Actions

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `vitest.config.ts` | Create | Vitest config with vite-tsconfig-paths, node environment, globalSetup |
| `compose.test.yml` | Create | Docker Compose for local test Postgres on port 5433 |
| `.env.test` | Create (gitignored) | Local test DB connection strings |
| `tests/vitest.globalSetup.ts` | Create | Runs `prisma db push --force-reset` once before suite |
| `tests/setup.ts` | Create | `vi.mock` for `@/lib/supabase/server`; exports `setTestUserId` |
| `tests/helpers/test-user.ts` | Create | `createTestUser`, `resetTestUser`, `deleteTestUser` |
| `tests/helpers/make-request.ts` | Create | Build `NextRequest` objects for route handler calls |
| `tests/unit/xp.test.ts` | Create | Unit tests for `lib/xp.ts` pure functions |
| `tests/unit/utils.test.ts` | Create | Unit test for `lib/utils.ts` `cn()` |
| `tests/integration/user.test.ts` | Create | Integration tests for `lib/user.ts` helpers |
| `tests/integration/progress-block.test.ts` | Create | Integration tests for `POST /api/progress/block` |
| `tests/integration/progress-course.test.ts` | Create | Integration tests for `POST /api/progress/course` |
| `tests/integration/progress-project.test.ts` | Create | Integration tests for `POST /api/progress/project` |
| `tests/integration/progress-roadmap.test.ts` | Create | Integration tests for `POST /api/progress/roadmap` |
| `tests/integration/user-profile.test.ts` | Create | Integration tests for `PATCH /api/user/profile` |
| `.github/workflows/ci.yml` | Create | CI pipeline: test, lint, typecheck, audit jobs |
| `package.json` | Modify | Add test scripts and new dev dependencies |
| `.gitignore` | Modify | Add `.env.test` |
| `AGENTS.md` | Modify | Add Testing section |

---

## Task 1: Install dependencies and scaffold config

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `compose.test.yml`
- Create: `.env.test` (gitignored)
- Modify: `.gitignore`

- [ ] **Step 1: Install Vitest and supporting packages**

```bash
npm install -D vitest @vitest/coverage-v8 vite-tsconfig-paths dotenv-cli
```

Expected: packages added to `devDependencies` in `package.json`

- [ ] **Step 2: Add test scripts to package.json**

In `package.json`, update the `"scripts"` section:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "dotenv -e .env.test -- vitest run",
  "test:watch": "dotenv -e .env.test -- vitest",
  "test:coverage": "dotenv -e .env.test -- vitest run --coverage",
  "test:ci": "vitest run --coverage"
}
```

`test:ci` is used by GitHub Actions where env vars are set at the job level, bypassing dotenv-cli.

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globalSetup: "./tests/vitest.globalSetup.ts",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["lib/**", "app/api/**"],
      exclude: ["app/generated/**"],
    },
  },
})
```

- [ ] **Step 4: Create `compose.test.yml`**

```yaml
services:
  db-test:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: devfluent_test
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: test
    ports:
      - "5433:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
```

- [ ] **Step 5: Create `.env.test`**

```
DATABASE_URL=postgresql://postgres:test@localhost:5433/devfluent_test
DIRECT_URL=postgresql://postgres:test@localhost:5433/devfluent_test
```

- [ ] **Step 6: Add `.env.test` to `.gitignore`**

Open `.gitignore` and add the line:
```
.env.test
```

- [ ] **Step 7: Start the test DB and verify it's reachable**

```bash
docker compose -f compose.test.yml up -d
# Wait for healthy
docker compose -f compose.test.yml ps
```

Expected: `db-test` container is running and healthy.

- [ ] **Step 8: Commit**

```bash
git add vitest.config.ts compose.test.yml package.json package-lock.json .gitignore
git commit -m "chore: add vitest, compose.test.yml, and test scripts"
```

---

## Task 2: Global setup, auth mock, and test helpers

**Files:**
- Create: `tests/vitest.globalSetup.ts`
- Create: `tests/setup.ts`
- Create: `tests/helpers/test-user.ts`
- Create: `tests/helpers/make-request.ts`

- [ ] **Step 1: Create `tests/vitest.globalSetup.ts`**

```ts
import { execSync } from "child_process"

export async function setup() {
  // DATABASE_URL is set by dotenv-cli (local) or workflow env (CI) before this runs
  execSync("npx prisma db push --force-reset --skip-generate", {
    stdio: "inherit",
    env: { ...process.env },
  })
}

export async function teardown() {
  // Nothing — the Docker container handles cleanup
}
```

- [ ] **Step 2: Create `tests/setup.ts`**

```ts
import { vi } from "vitest"

let _testUserId: string | null = "test-user-default"

export function setTestUserId(id: string | null) {
  _testUserId = id
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: {
          user: _testUserId
            ? { id: _testUserId, email: `${_testUserId}@test.devfluent` }
            : null,
        },
      })),
    },
  })),
}))
```

`_testUserId` is module-level state. Each integration test file calls `setTestUserId(TEST_USER_ID)` in `beforeEach`, so tests within a file always run with the correct user. Setting it to `null` simulates an unauthenticated request (triggers 401 responses).

- [ ] **Step 3: Create `tests/helpers/test-user.ts`**

```ts
import { prisma } from "@/lib/prisma"

export async function createTestUser(id: string) {
  return prisma.user.upsert({
    where: { id },
    create: { id, email: `${id}@test.devfluent`, name: "Test User" },
    update: {},
  })
}

export async function resetTestUser(id: string) {
  // Delete all related records first (some have FK constraints)
  await prisma.blockProgress.deleteMany({ where: { userId: id } })
  await prisma.dailyLog.deleteMany({ where: { userId: id } })
  await prisma.achievement.deleteMany({ where: { userId: id } })
  await prisma.roadmapProgress.deleteMany({ where: { userId: id } })
  await prisma.externalCourse.deleteMany({ where: { userId: id } })
  await prisma.monthlyProject.deleteMany({ where: { userId: id } })
  // Reset mutable user fields to baseline
  await prisma.user.update({
    where: { id },
    data: { totalXP: 0, level: 1, streak: 0, lastSeenAt: null },
  })
}

export async function deleteTestUser(id: string) {
  // Cascade deletes all related records
  await prisma.user.delete({ where: { id } })
}
```

- [ ] **Step 4: Create `tests/helpers/make-request.ts`**

```ts
import { NextRequest } from "next/server"

export function makePost(path: string, body: unknown): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

export function makePatch(path: string, body: unknown): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}
```

- [ ] **Step 5: Run Vitest to confirm the setup scaffolding loads without errors**

```bash
npm test
```

Expected: test suite runs (may show 0 test files found) without crashing. The globalSetup should push the schema to the test DB.

- [ ] **Step 6: Commit**

```bash
git add tests/
git commit -m "chore: add vitest global setup, auth mock, and test helpers"
```

---

## Task 3: Unit tests — lib/xp.ts

**Files:**
- Create: `tests/unit/xp.test.ts`

These tests have no DB dependency and no mock needed.

- [ ] **Step 1: Write `tests/unit/xp.test.ts`**

```ts
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
    expect(getLevelFromXP(99)).toBe(1)
  })

  it("advances to level 2 at exactly 100 XP", () => {
    expect(getLevelFromXP(100)).toBe(2)
  })

  it("advances to level 3 at exactly 250 XP", () => {
    expect(getLevelFromXP(250)).toBe(3)
  })

  it("returns max level 10 at 10000 XP", () => {
    expect(getLevelFromXP(10000)).toBe(10)
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
    expect(result.nextLevelXP).toBe(100)
  })

  it("calculates 50% progress at midpoint of level 1", () => {
    const result = getXPProgress(50)
    expect(result.level).toBe(1)
    expect(result.progress).toBe(50)
  })

  it("returns null nextLevelXP and 100% progress at max level", () => {
    const result = getXPProgress(10000)
    expect(result.level).toBe(10)
    expect(result.nextLevelXP).toBeNull()
    expect(result.progress).toBe(100)
  })

  it("calculates currentLevelXP relative to current level start", () => {
    // Level 2 starts at 100 XP; at 150 XP we're 50 into level 2
    const result = getXPProgress(150)
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
```

- [ ] **Step 2: Run the unit tests and verify they pass**

```bash
npm test -- tests/unit/xp.test.ts
```

Expected: all tests PASS

- [ ] **Step 3: Commit**

```bash
git add tests/unit/xp.test.ts
git commit -m "test: add unit tests for lib/xp.ts"
```

---

## Task 4: Unit tests — lib/utils.ts

**Files:**
- Create: `tests/unit/utils.test.ts`

- [ ] **Step 1: Write `tests/unit/utils.test.ts`**

```ts
import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"

describe("cn", () => {
  it("returns a single class unchanged", () => {
    expect(cn("text-red-500")).toBe("text-red-500")
  })

  it("merges multiple classes", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2")
  })

  it("resolves Tailwind conflicts — last value wins", () => {
    // tailwind-merge keeps the last conflicting utility
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500")
  })

  it("handles conditional false values", () => {
    expect(cn("px-4", false && "py-2", "mt-1")).toBe("px-4 mt-1")
  })

  it("handles undefined values", () => {
    expect(cn("px-4", undefined, "mt-1")).toBe("px-4 mt-1")
  })
})
```

- [ ] **Step 2: Run and verify**

```bash
npm test -- tests/unit/utils.test.ts
```

Expected: all tests PASS

- [ ] **Step 3: Commit**

```bash
git add tests/unit/utils.test.ts
git commit -m "test: add unit tests for lib/utils.ts cn()"
```

---

## Task 5: Integration tests — lib/user.ts helpers

**Files:**
- Create: `tests/integration/user.test.ts`

These call `lib/user.ts` functions directly with real Prisma + real DB. No route handler, no auth mock needed (functions take `userId` directly).

- [ ] **Step 1: Write `tests/integration/user.test.ts`**

```ts
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest"
import { prisma } from "@/lib/prisma"
import { awardXP, awardDailyLoginXP, updateStreak, checkAchievements } from "@/lib/user"
import { createTestUser, resetTestUser, deleteTestUser } from "../helpers/test-user"

const ID = "test-user-helpers"

describe("lib/user.ts helpers", () => {
  beforeAll(async () => { await createTestUser(ID) })
  beforeEach(async () => { await resetTestUser(ID) })
  afterAll(async () => { await deleteTestUser(ID) })

  // ─── awardXP ───────────────────────────────────────────────────────────────

  describe("awardXP", () => {
    it("adds XP to totalXP in DB", async () => {
      const result = await awardXP(ID, 50)
      expect(result.newXP).toBe(50)
      const user = await prisma.user.findUnique({ where: { id: ID } })
      expect(user!.totalXP).toBe(50)
    })

    it("returns leveledUp:false when below threshold", async () => {
      const result = await awardXP(ID, 50)
      expect(result.leveledUp).toBe(false)
      expect(result.newLevel).toBe(1)
    })

    it("returns leveledUp:true when crossing threshold (100 XP → level 2)", async () => {
      const result = await awardXP(ID, 100)
      expect(result.leveledUp).toBe(true)
      expect(result.newLevel).toBe(2)
    })

    it("upserts a dailyLog entry for today", async () => {
      await awardXP(ID, 10)
      const today = new Date()
      const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const log = await prisma.dailyLog.findUnique({
        where: { userId_date: { userId: ID, date: dateOnly } },
      })
      expect(log).not.toBeNull()
      expect(log!.xpEarned).toBe(10)
    })

    it("increments dailyLog xpEarned on second call same day", async () => {
      await awardXP(ID, 10)
      await awardXP(ID, 5)
      const today = new Date()
      const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const log = await prisma.dailyLog.findUnique({
        where: { userId_date: { userId: ID, date: dateOnly } },
      })
      expect(log!.xpEarned).toBe(15)
    })

    it("works inside prisma.$transaction", async () => {
      const result = await prisma.$transaction(async (tx) => {
        return awardXP(ID, 25, { db: tx })
      })
      expect(result.newXP).toBe(25)
      const user = await prisma.user.findUnique({ where: { id: ID } })
      expect(user!.totalXP).toBe(25)
    })
  })

  // ─── awardDailyLoginXP ─────────────────────────────────────────────────────

  describe("awardDailyLoginXP", () => {
    it("awards DAILY_LOGIN XP (5) on first call today", async () => {
      await awardDailyLoginXP(ID)
      const user = await prisma.user.findUnique({ where: { id: ID } })
      expect(user!.totalXP).toBe(5)
    })

    it("is idempotent — does not double-award on sequential same-day calls", async () => {
      await awardDailyLoginXP(ID)
      await awardDailyLoginXP(ID)
      const user = await prisma.user.findUnique({ where: { id: ID } })
      expect(user!.totalXP).toBe(5) // 5, not 10
    })
  })

  // ─── updateStreak ──────────────────────────────────────────────────────────

  describe("updateStreak", () => {
    it("starts streak at 1 when lastSeenAt is null", async () => {
      const newStreak = await updateStreak(ID)
      expect(newStreak).toBe(1)
    })

    it("increments streak on consecutive day", async () => {
      const yesterday = new Date(Date.now() - 86_400_000)
      await prisma.user.update({ where: { id: ID }, data: { lastSeenAt: yesterday, streak: 1 } })
      const newStreak = await updateStreak(ID)
      expect(newStreak).toBe(2)
    })

    it("resets streak to 1 when there is a gap", async () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 86_400_000)
      await prisma.user.update({ where: { id: ID }, data: { lastSeenAt: threeDaysAgo, streak: 5 } })
      const newStreak = await updateStreak(ID)
      expect(newStreak).toBe(1)
    })

    it("returns unchanged streak when already called today", async () => {
      await updateStreak(ID) // first call → streak = 1
      const firstStreak = await updateStreak(ID) // second call same day → no change
      expect(firstStreak).toBe(1)
    })

    it("awards 7-day streak bonus once and creates achievement record", async () => {
      const yesterday = new Date(Date.now() - 86_400_000)
      await prisma.user.update({ where: { id: ID }, data: { lastSeenAt: yesterday, streak: 6 } })
      await updateStreak(ID)
      const user = await prisma.user.findUnique({ where: { id: ID } })
      expect(user!.streak).toBe(7)
      expect(user!.totalXP).toBe(10) // STREAK_BONUS_7
      const ach = await prisma.achievement.findFirst({ where: { userId: ID, slug: "streak_bonus_7" } })
      expect(ach).not.toBeNull()
    })

    it("does NOT re-award 7-day bonus after breaking and rebuilding streak", async () => {
      // Earn the bonus the first time
      const yesterday = new Date(Date.now() - 86_400_000)
      await prisma.user.update({ where: { id: ID }, data: { lastSeenAt: yesterday, streak: 6 } })
      await updateStreak(ID) // streak reaches 7, bonus awarded
      // Reset streak and rebuild to 7
      await prisma.user.update({ where: { id: ID }, data: { lastSeenAt: yesterday, streak: 6 } })
      await updateStreak(ID) // streak reaches 7 again
      const user = await prisma.user.findUnique({ where: { id: ID } })
      expect(user!.totalXP).toBe(10) // Still 10, not 20
    })
  })

  // ─── checkAchievements ─────────────────────────────────────────────────────

  describe("checkAchievements", () => {
    it("unlocks first_block and awards its XP bonus", async () => {
      await prisma.blockProgress.create({
        data: { userId: ID, blockId: "m1w1-b1", month: 1, week: 1, status: "COMPLETED", xpEarned: 15 },
      })
      const unlocked = await checkAchievements(ID)
      expect(unlocked).toContain("first_block")
      const user = await prisma.user.findUnique({ where: { id: ID } })
      expect(user!.totalXP).toBe(10) // first_block xpBonus
    })

    it("returns empty array when no new achievements", async () => {
      const unlocked = await checkAchievements(ID)
      expect(unlocked).toHaveLength(0)
    })

    it("does not create duplicate achievement on repeated call", async () => {
      await prisma.blockProgress.create({
        data: { userId: ID, blockId: "m1w1-b1", month: 1, week: 1, status: "COMPLETED", xpEarned: 15 },
      })
      await checkAchievements(ID)
      await checkAchievements(ID)
      const records = await prisma.achievement.findMany({ where: { userId: ID, slug: "first_block" } })
      expect(records).toHaveLength(1)
    })
  })
})
```

- [ ] **Step 2: Run and verify**

```bash
npm test -- tests/integration/user.test.ts
```

Expected: all tests PASS

- [ ] **Step 3: Commit**

```bash
git add tests/integration/user.test.ts
git commit -m "test: add integration tests for lib/user.ts helpers"
```

---

## Task 6: Integration tests — progress/block route

**Files:**
- Create: `tests/integration/progress-block.test.ts`

Use real blockId `"m1w1-b1"` — `getBlock()` is a synchronous in-process lookup.

- [ ] **Step 1: Write `tests/integration/progress-block.test.ts`**

```ts
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest"
import { POST } from "@/app/api/progress/block/route"
import { prisma } from "@/lib/prisma"
import { setTestUserId } from "../setup"
import { makePost } from "../helpers/make-request"
import { createTestUser, resetTestUser, deleteTestUser } from "../helpers/test-user"

const ID = "test-user-block"
const BLOCK = "m1w1-b1" // real blockId from CURRICULUM

describe("POST /api/progress/block", () => {
  beforeAll(async () => { await createTestUser(ID) })
  beforeEach(async () => { setTestUserId(ID); await resetTestUser(ID) })
  afterAll(async () => { await deleteTestUser(ID) })

  it("returns 401 when unauthenticated", async () => {
    setTestUserId(null)
    const res = await POST(makePost("/api/progress/block", { blockId: BLOCK, status: "COMPLETED" }))
    expect(res.status).toBe(401)
  })

  it("returns 400 when blockId is missing", async () => {
    const res = await POST(makePost("/api/progress/block", { status: "COMPLETED" }))
    expect(res.status).toBe(400)
  })

  it("returns 400 for invalid status value", async () => {
    const res = await POST(makePost("/api/progress/block", { blockId: BLOCK, status: "DONE" }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("Invalid status")
  })

  it("returns 404 for unknown blockId", async () => {
    const res = await POST(makePost("/api/progress/block", { blockId: "m99w99-b99", status: "COMPLETED" }))
    expect(res.status).toBe(404)
  })

  it("completes a block, creates a BlockProgress record, and awards XP", async () => {
    const res = await POST(makePost("/api/progress/block", { blockId: BLOCK, status: "COMPLETED" }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.xpAwarded).toBe(15) // XP_VALUES.COMPLETE_BLOCK

    const bp = await prisma.blockProgress.findUnique({
      where: { userId_blockId: { userId: ID, blockId: BLOCK } },
    })
    expect(bp!.status).toBe("COMPLETED")

    const user = await prisma.user.findUnique({ where: { id: ID } })
    expect(user!.totalXP).toBe(15)
  })

  it("awards Pomodoro bonus XP when usedTimer is true", async () => {
    const res = await POST(makePost("/api/progress/block", { blockId: BLOCK, status: "COMPLETED", usedTimer: true }))
    const body = await res.json()
    expect(body.xpAwarded).toBe(20) // XP_VALUES.COMPLETE_BLOCK_POMODORO
  })

  it("does NOT double-award XP when completing an already-completed block", async () => {
    await POST(makePost("/api/progress/block", { blockId: BLOCK, status: "COMPLETED" }))
    const res = await POST(makePost("/api/progress/block", { blockId: BLOCK, status: "COMPLETED" }))
    const body = await res.json()
    expect(body.xpAwarded).toBe(0)

    const user = await prisma.user.findUnique({ where: { id: ID } })
    expect(user!.totalXP).toBe(15) // Only awarded once
  })

  it("awards SKIP_BLOCK XP (2) for skipped status", async () => {
    const res = await POST(makePost("/api/progress/block", { blockId: BLOCK, status: "SKIPPED" }))
    const body = await res.json()
    expect(body.xpAwarded).toBe(2)
  })

  it("sanitizes negative minutesSpent to 0", async () => {
    await POST(makePost("/api/progress/block", { blockId: BLOCK, status: "COMPLETED", minutesSpent: -99 }))
    const bp = await prisma.blockProgress.findUnique({
      where: { userId_blockId: { userId: ID, blockId: BLOCK } },
    })
    expect(bp!.minutesSpent).toBe(0)
  })
})
```

- [ ] **Step 2: Run and verify**

```bash
npm test -- tests/integration/progress-block.test.ts
```

Expected: all tests PASS

- [ ] **Step 3: Commit**

```bash
git add tests/integration/progress-block.test.ts
git commit -m "test: add integration tests for POST /api/progress/block"
```

---

## Task 7: Integration tests — progress/course route

**Files:**
- Create: `tests/integration/progress-course.test.ts`

- [ ] **Step 1: Write `tests/integration/progress-course.test.ts`**

```ts
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest"
import { POST } from "@/app/api/progress/course/route"
import { prisma } from "@/lib/prisma"
import { setTestUserId } from "../setup"
import { makePost } from "../helpers/make-request"
import { createTestUser, resetTestUser, deleteTestUser } from "../helpers/test-user"

const ID = "test-user-course"

describe("POST /api/progress/course", () => {
  beforeAll(async () => { await createTestUser(ID) })
  beforeEach(async () => { setTestUserId(ID); await resetTestUser(ID) })
  afterAll(async () => { await deleteTestUser(ID) })

  it("returns 401 when unauthenticated", async () => {
    setTestUserId(null)
    const res = await POST(makePost("/api/progress/course", { action: "create", title: "T", platform: "P" }))
    expect(res.status).toBe(401)
  })

  // ─── create ─────────────────────────────────────────────────────────────────

  describe("action: create", () => {
    it("creates a course record and awards ADD_COURSE XP (10)", async () => {
      const res = await POST(makePost("/api/progress/course", {
        action: "create", title: "TypeScript Deep Dive", platform: "Udemy", totalLessons: 50,
      }))
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.course.title).toBe("TypeScript Deep Dive")

      const user = await prisma.user.findUnique({ where: { id: ID } })
      expect(user!.totalXP).toBe(10) // ADD_COURSE
    })

    it("returns 400 when title is missing", async () => {
      const res = await POST(makePost("/api/progress/course", { action: "create", platform: "Udemy" }))
      expect(res.status).toBe(400)
    })
  })

  // ─── update ─────────────────────────────────────────────────────────────────

  describe("action: update", () => {
    async function createCourse(totalLessons = 10) {
      const course = await prisma.externalCourse.create({
        data: { userId: ID, title: "Test Course", platform: "Test", totalLessons, xpEarned: 10 },
      })
      return course
    }

    it("updates completedLessons", async () => {
      const course = await createCourse()
      const res = await POST(makePost("/api/progress/course", { action: "update", id: course.id, completedLessons: 5 }))
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.course.completedLessons).toBe(5)
      expect(body.course.isCompleted).toBe(false)
    })

    it("marks course complete and awards COMPLETE_COURSE XP (50) when completedLessons >= totalLessons", async () => {
      const course = await createCourse(10)
      const res = await POST(makePost("/api/progress/course", { action: "update", id: course.id, completedLessons: 10 }))
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.course.isCompleted).toBe(true)

      const user = await prisma.user.findUnique({ where: { id: ID } })
      expect(user!.totalXP).toBe(50) // COMPLETE_COURSE (ADD_COURSE already reset by beforeEach)
    })

    it("does NOT re-award completion XP if already completed", async () => {
      const course = await createCourse(10)
      await POST(makePost("/api/progress/course", { action: "update", id: course.id, completedLessons: 10 }))
      await POST(makePost("/api/progress/course", { action: "update", id: course.id, completedLessons: 10 }))
      const user = await prisma.user.findUnique({ where: { id: ID } })
      expect(user!.totalXP).toBe(50) // Not 100
    })

    it("returns 404 when course id does not exist", async () => {
      const res = await POST(makePost("/api/progress/course", { action: "update", id: "nonexistent-id", completedLessons: 5 }))
      expect(res.status).toBe(404)
    })
  })

  // ─── delete ─────────────────────────────────────────────────────────────────

  describe("action: delete", () => {
    it("deletes a course owned by the user", async () => {
      const course = await prisma.externalCourse.create({
        data: { userId: ID, title: "Delete Me", platform: "Test", totalLessons: 0 },
      })
      const res = await POST(makePost("/api/progress/course", { action: "delete", id: course.id }))
      expect(res.status).toBe(200)
      const deleted = await prisma.externalCourse.findUnique({ where: { id: course.id } })
      expect(deleted).toBeNull()
    })

    it("returns 404 when trying to delete a non-existent course", async () => {
      const res = await POST(makePost("/api/progress/course", { action: "delete", id: "bad-id" }))
      expect(res.status).toBe(404)
    })
  })
})
```

- [ ] **Step 2: Run and verify**

```bash
npm test -- tests/integration/progress-course.test.ts
```

Expected: all tests PASS

- [ ] **Step 3: Commit**

```bash
git add tests/integration/progress-course.test.ts
git commit -m "test: add integration tests for POST /api/progress/course"
```

---

## Task 8: Integration tests — progress/project route

**Files:**
- Create: `tests/integration/progress-project.test.ts`

Uses month `1` — confirmed present in CURRICULUM.

- [ ] **Step 1: Write `tests/integration/progress-project.test.ts`**

```ts
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest"
import { POST } from "@/app/api/progress/project/route"
import { prisma } from "@/lib/prisma"
import { setTestUserId } from "../setup"
import { makePost } from "../helpers/make-request"
import { createTestUser, resetTestUser, deleteTestUser } from "../helpers/test-user"

const ID = "test-user-project"

describe("POST /api/progress/project", () => {
  beforeAll(async () => { await createTestUser(ID) })
  beforeEach(async () => { setTestUserId(ID); await resetTestUser(ID) })
  afterAll(async () => { await deleteTestUser(ID) })

  it("returns 401 when unauthenticated", async () => {
    setTestUserId(null)
    const res = await POST(makePost("/api/progress/project", { action: "start", month: 1 }))
    expect(res.status).toBe(401)
  })

  it("returns 400 when month is missing", async () => {
    const res = await POST(makePost("/api/progress/project", { action: "start" }))
    expect(res.status).toBe(400)
  })

  it("returns 404 for month not in curriculum", async () => {
    const res = await POST(makePost("/api/progress/project", { action: "start", month: 99 }))
    expect(res.status).toBe(404)
  })

  it("starts a project with IN_PROGRESS status", async () => {
    const res = await POST(makePost("/api/progress/project", { action: "start", month: 1 }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.project.status).toBe("IN_PROGRESS")
  })

  it("completes a project and awards COMPLETE_PROJECT XP (100)", async () => {
    const res = await POST(makePost("/api/progress/project", { action: "complete", month: 1 }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.project.status).toBe("COMPLETED")

    const user = await prisma.user.findUnique({ where: { id: ID } })
    expect(user!.totalXP).toBe(100) // COMPLETE_PROJECT
  })

  it("does NOT re-award XP when completing an already-completed project", async () => {
    await POST(makePost("/api/progress/project", { action: "complete", month: 1 }))
    await POST(makePost("/api/progress/project", { action: "complete", month: 1 }))
    const user = await prisma.user.findUnique({ where: { id: ID } })
    expect(user!.totalXP).toBe(100) // Not 200
  })

  it("stores repoUrl and liveUrl on completion", async () => {
    const res = await POST(makePost("/api/progress/project", {
      action: "complete", month: 1,
      repoUrl: "https://github.com/user/repo",
      liveUrl: "https://project.example.com",
    }))
    const body = await res.json()
    expect(body.project.repoUrl).toBe("https://github.com/user/repo")
    expect(body.project.liveUrl).toBe("https://project.example.com")
  })
})
```

- [ ] **Step 2: Run and verify**

```bash
npm test -- tests/integration/progress-project.test.ts
```

Expected: all tests PASS

- [ ] **Step 3: Commit**

```bash
git add tests/integration/progress-project.test.ts
git commit -m "test: add integration tests for POST /api/progress/project"
```

---

## Task 9: Integration tests — progress/roadmap route

**Files:**
- Create: `tests/integration/progress-roadmap.test.ts`

- [ ] **Step 1: Write `tests/integration/progress-roadmap.test.ts`**

```ts
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest"
import { POST } from "@/app/api/progress/roadmap/route"
import { prisma } from "@/lib/prisma"
import { setTestUserId } from "../setup"
import { makePost } from "../helpers/make-request"
import { createTestUser, resetTestUser, deleteTestUser } from "../helpers/test-user"

const ID = "test-user-roadmap"
const ROADMAP = "frontend"
const NODE = "html-basics"

describe("POST /api/progress/roadmap", () => {
  beforeAll(async () => { await createTestUser(ID) })
  beforeEach(async () => { setTestUserId(ID); await resetTestUser(ID) })
  afterAll(async () => { await deleteTestUser(ID) })

  it("returns 401 when unauthenticated", async () => {
    setTestUserId(null)
    const res = await POST(makePost("/api/progress/roadmap", {
      roadmapId: ROADMAP, nodeId: NODE, status: "COMPLETED",
    }))
    expect(res.status).toBe(401)
  })

  it("returns 400 for invalid status", async () => {
    const res = await POST(makePost("/api/progress/roadmap", {
      roadmapId: ROADMAP, nodeId: NODE, status: "INVALID",
    }))
    expect(res.status).toBe(400)
  })

  it("returns 400 when required fields are missing", async () => {
    const res = await POST(makePost("/api/progress/roadmap", { roadmapId: ROADMAP }))
    expect(res.status).toBe(400)
  })

  it("completes a subtopic and awards ROADMAP_SUBTOPIC XP (5)", async () => {
    const res = await POST(makePost("/api/progress/roadmap", {
      roadmapId: ROADMAP, nodeId: NODE, nodeType: "subtopic", status: "COMPLETED",
    }))
    expect(res.status).toBe(200)
    const user = await prisma.user.findUnique({ where: { id: ID } })
    expect(user!.totalXP).toBe(5) // ROADMAP_SUBTOPIC
  })

  it("completes a topic and awards ROADMAP_TOPIC XP (10)", async () => {
    const res = await POST(makePost("/api/progress/roadmap", {
      roadmapId: ROADMAP, nodeId: NODE, nodeType: "topic", status: "COMPLETED",
    }))
    expect(res.status).toBe(200)
    const user = await prisma.user.findUnique({ where: { id: ID } })
    expect(user!.totalXP).toBe(10) // ROADMAP_TOPIC
  })

  it("does NOT re-award XP when completing an already-completed node", async () => {
    await POST(makePost("/api/progress/roadmap", {
      roadmapId: ROADMAP, nodeId: NODE, nodeType: "topic", status: "COMPLETED",
    }))
    await POST(makePost("/api/progress/roadmap", {
      roadmapId: ROADMAP, nodeId: NODE, nodeType: "topic", status: "COMPLETED",
    }))
    const user = await prisma.user.findUnique({ where: { id: ID } })
    expect(user!.totalXP).toBe(10) // Not 20
  })

  it("uses stored nodeType on re-submission to prevent XP manipulation", async () => {
    // First submission: stored as subtopic (5 XP)
    await POST(makePost("/api/progress/roadmap", {
      roadmapId: ROADMAP, nodeId: NODE, nodeType: "subtopic", status: "NOT_STARTED",
    }))
    // Re-submission: claim nodeType is topic but stored value should be used
    // Re-mark as completed — XP is based on stored "subtopic", not submitted "topic"
    const res = await POST(makePost("/api/progress/roadmap", {
      roadmapId: ROADMAP, nodeId: NODE, nodeType: "topic", status: "COMPLETED",
    }))
    expect(res.status).toBe(200)
    const user = await prisma.user.findUnique({ where: { id: ID } })
    expect(user!.totalXP).toBe(5) // subtopic XP, not topic XP
  })
})
```

- [ ] **Step 2: Run and verify**

```bash
npm test -- tests/integration/progress-roadmap.test.ts
```

Expected: all tests PASS

- [ ] **Step 3: Commit**

```bash
git add tests/integration/progress-roadmap.test.ts
git commit -m "test: add integration tests for POST /api/progress/roadmap"
```

---

## Task 10: Integration tests — user/profile route

**Files:**
- Create: `tests/integration/user-profile.test.ts`

This route uses `PATCH`, not `POST`.

- [ ] **Step 1: Write `tests/integration/user-profile.test.ts`**

```ts
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest"
import { PATCH } from "@/app/api/user/profile/route"
import { prisma } from "@/lib/prisma"
import { setTestUserId } from "../setup"
import { makePatch } from "../helpers/make-request"
import { createTestUser, resetTestUser, deleteTestUser } from "../helpers/test-user"

const ID = "test-user-profile"

describe("PATCH /api/user/profile", () => {
  beforeAll(async () => { await createTestUser(ID) })
  beforeEach(async () => { setTestUserId(ID); await resetTestUser(ID) })
  afterAll(async () => { await deleteTestUser(ID) })

  it("returns 401 when unauthenticated", async () => {
    setTestUserId(null)
    const res = await PATCH(makePatch("/api/user/profile", { name: "Alice" }))
    expect(res.status).toBe(401)
  })

  it("updates the user name", async () => {
    const res = await PATCH(makePatch("/api/user/profile", { name: "Alice" }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.name).toBe("Alice")
    const user = await prisma.user.findUnique({ where: { id: ID } })
    expect(user!.name).toBe("Alice")
  })

  it("accepts null to clear the name", async () => {
    await PATCH(makePatch("/api/user/profile", { name: "Alice" }))
    const res = await PATCH(makePatch("/api/user/profile", { name: null }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.name).toBeNull()
  })

  it("returns 400 when name exceeds 100 characters", async () => {
    const longName = "a".repeat(101)
    const res = await PATCH(makePatch("/api/user/profile", { name: longName }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/100/)
  })

  it("returns 400 when name is a non-string (number)", async () => {
    const res = await PATCH(makePatch("/api/user/profile", { name: 42 }))
    expect(res.status).toBe(400)
  })

  it("accepts exactly 100-character name", async () => {
    const maxName = "a".repeat(100)
    const res = await PATCH(makePatch("/api/user/profile", { name: maxName }))
    expect(res.status).toBe(200)
  })
})
```

- [ ] **Step 2: Run the full test suite**

```bash
npm test
```

Expected: all tests across all files PASS

- [ ] **Step 3: Commit**

```bash
git add tests/integration/user-profile.test.ts
git commit -m "test: add integration tests for PATCH /api/user/profile"
```

---

## Task 11: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `AGENTS.md`

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: ["**"]
  pull_request:
    branches: ["**"]

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: devfluent_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    env:
      DATABASE_URL: postgresql://postgres:test@localhost:5432/devfluent_test
      DIRECT_URL: postgresql://postgres:test@localhost:5432/devfluent_test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npx prisma generate
      - run: npx prisma db push --force-reset --skip-generate
      - run: npm run test:ci
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage
          path: coverage/
          retention-days: 7

  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run lint

  typecheck:
    name: Typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npx prisma generate
      - run: npx tsc --noEmit

  audit:
    name: Audit (informational)
    runs-on: ubuntu-latest
    continue-on-error: true
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm audit --audit-level=critical
```

Note: `continue-on-error: true` on the audit job makes it informational — it shows pass/fail but never blocks a PR merge. The `test:ci` script uses `vitest run` directly (no dotenv-cli), since `DATABASE_URL` is set via the workflow `env:` block.

- [ ] **Step 2: Add Testing section to AGENTS.md**

Open `AGENTS.md` and append before the `## Known Non-Critical Warnings` section:

```markdown
## Testing

### Running tests locally

```bash
# Start test DB (first time only, or after docker compose down)
docker compose -f compose.test.yml up -d

# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Tear down test DB
docker compose -f compose.test.yml down
```

### Test DB
- Separate `devfluent_test` Postgres on port **5433** (avoids collision with dev DB on 5432)
- Schema pushed via `prisma db push --force-reset` in `vitest.globalSetup.ts` before each suite run
- Connection string in `.env.test` (gitignored — create from the values above)

### Test Isolation Pattern
Each integration test file owns a dedicated test user (e.g. `"test-user-block"`).
`beforeEach` resets mutable fields (`totalXP`, `level`, `streak`, `lastSeenAt`) and deletes all related records.
`afterAll` deletes the test user (cascades to all relations).

### Auth Mock
`tests/setup.ts` mocks `@/lib/supabase/server`. Call `setTestUserId(id)` in `beforeEach` to set the authenticated user. Pass `null` to simulate unauthenticated requests (triggers 401).
```

- [ ] **Step 3: Commit everything**

```bash
git add .github/workflows/ci.yml AGENTS.md
git commit -m "ci: add GitHub Actions workflow (test, lint, typecheck, audit)"
```

- [ ] **Step 4: Push and verify CI runs**

```bash
git push origin master
```

Then open the repository on GitHub → Actions tab. Verify:
- All four jobs appear
- `test`, `lint`, `typecheck` pass (green)
- `audit` shows but does not block (informational)
