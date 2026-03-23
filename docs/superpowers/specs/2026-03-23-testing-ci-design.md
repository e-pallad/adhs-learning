# Testing & CI Design — Devfluent

**Date:** 2026-03-23
**Status:** Approved

---

## Overview

Add a proper test suite (Vitest, unit + integration) and GitHub Actions CI pipeline to Devfluent. No end-to-end browser tests in this phase — the app is server-side-logic-heavy and the ROI on Playwright is low right now.

---

## Test Framework

**Vitest** with `@vitest/coverage-v8`.

Reasons over Jest: native ESM, native TypeScript, faster, no Babel config, compatible with the existing Next.js 16 / Prisma 7 stack.

New dev dependencies to install:
```
npm install -D vitest @vitest/coverage-v8 vite-tsconfig-paths
```

`vite-tsconfig-paths` is required because Vitest runs through Vite, which does not automatically read `tsconfig.json` path aliases. Without it, all `@/lib/...` imports in test files will fail to resolve.

New npm scripts:
- `npm test` → `vitest run`
- `npm run test:watch` → `vitest`
- `npm run test:coverage` → `vitest run --coverage`

---

## Vitest Config

`vitest.config.ts` at repo root:

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

`environment: "node"` is set explicitly (it is the Vitest default, but must be stated here because the official Next.js Vitest template defaults to `jsdom`, and any accidental copy from that template would silently break Prisma/Node imports).

---

## File Layout

```
vitest.config.ts                  # Vitest config with vite-tsconfig-paths
tests/
  vitest.globalSetup.ts           # prisma db push --force-reset before suite
  setup.ts                        # vi.mock for @/lib/supabase/server
  helpers/
    make-request.ts               # builds NextRequest for route handler tests
    test-user.ts                  # createTestUser / resetTestUser / deleteTestUser
  unit/
    xp.test.ts                    # getLevelFromXP, getXPProgress, ACHIEVEMENT_DEFINITIONS
    utils.test.ts                 # cn()
  integration/
    user.test.ts                  # awardXP, awardDailyLoginXP, updateStreak, checkAchievements
    progress-block.test.ts        # POST /api/progress/block
    progress-course.test.ts       # POST /api/progress/course — actions: create, update, delete
    progress-project.test.ts      # POST /api/progress/project
    progress-roadmap.test.ts      # POST /api/progress/roadmap
    user-profile.test.ts          # PATCH /api/user/profile
```

---

## Test DB Setup

### Local

A `devfluent_test` Postgres database in the existing Docker environment.

Add to `compose.test.yml` (new file, not checked into production):

```yaml
services:
  db-test:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: devfluent_test
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: test
    ports: ["5433:5432"]
```

`.env.test` (gitignored):
```
DATABASE_URL=postgresql://postgres:test@localhost:5433/devfluent_test
DIRECT_URL=postgresql://postgres:test@localhost:5433/devfluent_test
```

### Schema

`vitest.globalSetup.ts` runs `prisma db push --force-reset` once before the full suite. No migration history needed for tests — `db push` is fast and sufficient.

### Running tests locally

```bash
docker compose -f compose.test.yml up -d
npm test
docker compose -f compose.test.yml down
```

---

## Test Isolation

Each integration test file uses a **dedicated test user** with a fixed UUID (e.g. `"test-user-block"`, `"test-user-profile"`). This avoids cross-file state contamination.

- `beforeAll`: create the test user via `prisma.user.upsert`
- `beforeEach`: reset mutable fields (`totalXP: 0`, `level: 1`, `streak: 0`) + delete related records (`blockProgress`, `dailyLog`, `achievement`, etc.) for that user
- `afterAll`: delete the test user (cascades to all related records)

No transaction rollback machinery — the per-test reset is simpler and sufficient given Vitest runs test files serially by default.

---

## Supabase Auth Mock

`tests/setup.ts` contains a `vi.mock('@/lib/supabase/server')` that makes `createClient().auth.getUser()` return a configurable test user ID:

```ts
// tests/setup.ts
let _testUserId = "test-user-default"
export const setTestUserId = (id: string) => { _testUserId = id }

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: { id: _testUserId, email: "test@test.com" } } }),
    },
  }),
}))
```

Integration test files import `setTestUserId` and call it in `beforeAll` with their dedicated user ID. This is the only mock in the test suite — everything else (Prisma, Postgres) is real.

---

## What Gets Tested

### Unit tests (`lib/xp.ts`)

| Test | Coverage target |
|------|----------------|
| `getLevelFromXP` boundary values | level 1 at 0 XP, level transitions at exact thresholds, max level |
| `getXPProgress` | progress %, null nextLevelXP at max level, correct currentLevelXP calculation |
| `ACHIEVEMENT_DEFINITIONS` check functions | each predicate with passing and failing stats |

### Unit tests (`lib/utils.ts`)

`cn()` with conflicting Tailwind classes — verifies `tailwind-merge` is wired correctly.

### Integration tests (`lib/user.ts`)

| Test | What it verifies |
|------|-----------------|
| `awardXP` basic | XP added, level recalculated, dailyLog upserted |
| `awardXP` level-up | `leveledUp: true` when threshold crossed |
| `awardXP` with tx client | works inside `prisma.$transaction` |
| `awardDailyLoginXP` first call | awards XP, creates dailyLog entry |
| `awardDailyLoginXP` second call same day | sequential idempotency — no double XP on repeated synchronous calls. Note: a concurrent TOCTOU gap exists (two simultaneous calls can both pass the `findUnique` guard before either writes the log entry); this requires a DB-level unique constraint to close and is a separate code issue not catchable by sequential tests. |
| `updateStreak` consecutive days | streak increments |
| `updateStreak` 7-day milestone | streak bonus awarded once |
| `updateStreak` streak farming | breaking and rebuilding to 7 does NOT re-award bonus |
| `checkAchievements` first block | unlocks `first_block`, awards XP bonus |
| `checkAchievements` concurrent calls | `skipDuplicates` prevents duplicate achievement |

### Integration tests (API routes)

Each route test constructs a `NextRequest` and calls the handler directly (`POST` for all progress routes; `PATCH` for `/api/user/profile`). Verifies:
- Happy path: correct response shape + DB state after call
- Validation errors: 400 for invalid status/negative minutesSpent/name > 100 chars; 404 for unknown blockId
- Block route tests must use real blockIds from `CURRICULUM` (e.g. `"m1w1-b1"`) — `getBlock()` is a synchronous lookup against the in-process curriculum constant, not a mock
- Idempotency: calling complete twice does not double-award XP
- Auth: returns 401 when `getUser()` returns null user

---

## GitHub Actions CI

File: `.github/workflows/ci.yml`

Three jobs run in parallel on every push and PR to any branch:

### `test` job

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env: { POSTGRES_DB: devfluent_test, POSTGRES_USER: postgres, POSTGRES_PASSWORD: test }
    ports: ["5432:5432"]
    options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5

env:
  DATABASE_URL: postgresql://postgres:test@localhost:5432/devfluent_test
  DIRECT_URL: postgresql://postgres:test@localhost:5432/devfluent_test
```

Steps: checkout → Node 20 + npm cache → `npm ci` → `prisma generate` → `prisma db push --force-reset` → `npm test`

Coverage artifact uploaded on success.

### `lint` job

`npm ci` → `npm run lint`

### `typecheck` job

`npm ci` → `prisma generate` → `tsc --noEmit`

### `audit` job (informational, non-blocking)

`npm audit --audit-level=critical`

Uses `critical` threshold (not `high`) because all current high-severity findings are inside Prisma 7's CLI tooling and local dev server (`@prisma/dev`, `@hono/node-server`, `effect`, `hono`) — none are reachable from the deployed app runtime. These cannot be fixed without a major version downgrade (`prisma@6.x`) that would break the entire Prisma 7 setup. The audit job will still surface any new critical vulnerabilities that appear.

**Known Prisma 7 CVEs (informational — not runtime-exploitable from the deployed app):**

All of the following affect only `@prisma/dev` (Prisma's internal local dev server / CLI tooling), not the deployed application:

| Advisory | Package | Severity | Description |
|----------|---------|----------|-------------|
| `GHSA-wc8c-qw6v-h7f6` | `@hono/node-server` | high | Auth bypass for protected static paths in Serve Static middleware (Prisma Studio / local dev server only) |
| `GHSA-q5qw-h33p-qvwr` | `hono` | high | Arbitrary file read via `serveStatic` (Prisma local dev server only; not the deployed Next.js app) |
| `GHSA-38f7-945m-qr2g` | `effect` | high | `AsyncLocalStorage` context contamination under concurrent RPC load (Prisma internal RPC only) |
| `GHSA-9r54-q6cx-xmh5` | `hono` | moderate | XSS in ErrorBoundary component (Prisma Studio only) |
| `GHSA-fvqr-27wr-82fm` | `@chevrotain/*` | moderate | Prototype pollution (Prisma schema parser CLI only) |

Note: `GHSA-q5qw-h33p-qvwr` (arbitrary file read in `hono serveStatic`) is the most serious class — CVSS 7.5. It is not exploitable in the deployed app because `@prisma/dev`'s local server is never started at runtime. However it should be re-evaluated if Prisma is ever upgraded to v8+ which may resolve these via updated sub-dependencies.

---

## Suggested Branch Protection

Require these status checks to pass before merging to `master`:
- `test`
- `lint`
- `typecheck`

`audit` is advisory — visible but not blocking.

---

## What Is Not Covered

- **End-to-end / browser tests** (Playwright) — deferred; server-side logic is the high-value test target
- **`next build` in CI** — requires Supabase secrets; add as a separate job once GitHub secrets are configured
- **Prisma 7 CVE remediation** — cannot be auto-fixed without breaking the stack; tracked separately
- **`awardDailyLoginXP` concurrent idempotency** — TOCTOU gap requires DB-level unique constraint; tracked as a separate code issue
