# CLAUDE.md

> **This is NOT the Next.js you know.** This version has breaking changes — APIs, conventions, and file structure may differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.0 (Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase PostgreSQL (project: `phigbihrgojcyebymwcw`, region: `eu-west-1`) |
| ORM | Prisma 7.5.0 |
| Auth | Supabase magic link (passwordless email OTP) via `@supabase/ssr` |
| Package manager | npm (Bun-compatible locally) |
| Runtime | Node 24 / npm 11 (Dockerfile uses `node:24-alpine`) |

---

## Breaking Changes

### Next.js 16
- `middleware.ts` is **deprecated** — use `proxy.ts` with `export function proxy(req)` instead
- Dynamic route `params` are **Promises** — always `await params` before accessing fields
- App Router only — no `pages/` directory

### Prisma 7
- `url`/`directUrl` are **NOT** in `prisma/schema.prisma` — they live in `prisma.config.ts` under `datasource.url`
- `prisma.config.ts` uses `defineConfig` from `"prisma/config"`
- Import generated client as `from "@/app/generated/prisma/client"` (not `from "@/app/generated/prisma"`)
- `PrismaClient` **requires** a driver adapter: `new PrismaPg({ connectionString: process.env.DATABASE_URL! })` from `@prisma/adapter-pg`
- Migrations cannot run from WSL against port 5432 — use the `supabase_apply_migration` MCP tool instead

### Supabase DB
- Project ref: `phigbihrgojcyebymwcw`
- `DATABASE_URL` (runtime): pooler pgbouncer `aws-0-eu-west-1.pooler.supabase.com:6543`
- `DIRECT_URL` (migrations): pooler session `aws-0-eu-west-1.pooler.supabase.com:5432`
- DB password in `.env` as `DB_PASSWORD` — **never commit**

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Supabase pooler (pgbouncer, port 6543) — runtime |
| `DIRECT_URL` | Supabase pooler (session, port 5432) — migrations only |
| `DB_PASSWORD` | Raw DB password — never commit |
| `ANTHROPIC_API_KEY` | AI recommendations widget (`claude-haiku-4-5-20251001`) |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret |
| `NEXT_PUBLIC_APP_URL` | Full app URL (e.g. `https://devfluent.de`) — used for GitHub OAuth callback |

---

## Development Commands

```bash
npm run dev                       # Start dev server (Turbopack) at http://localhost:3000
npm run build                     # Production build
npm run lint                      # ESLint
npm run review                    # Self-review staged changes before committing
npm run review:branch             # Self-review all changes on current branch vs master
npx prisma generate               # Regenerate Prisma client after schema changes
npx prisma migrate dev            # Create + apply migration (requires DIRECT_URL, not from WSL)
node scripts/validate-curriculum.js  # Validate all curriculum JSON files
```

> The `prepare` script installs the pre-push hook — guarded with `[ -d .git ]` so it's skipped in Docker/CI.

---

## App Structure

Route groups under `app/`:
- `(auth)/` — unauthenticated: `/login`, `/offline`
- `(dashboard)/` — protected: `/`, `/learning`, `/roadmap`, `/training`, `/projects`, `/progress`, `/settings`
- `api/` — REST endpoints for progress tracking and user data

Key library files:
- `lib/prisma.ts` — PrismaClient singleton (uses `@prisma/adapter-pg`)
- `lib/user.ts` — `getCurrentUser`, `awardXP`, `updateStreak`, `checkAchievements`
- `lib/xp.ts` — XP values, level thresholds, achievement definitions (single source of truth)
- `lib/roadmap.ts` — roadmap.sh API integration with 24-hour cache + local JSON fallback
- `lib/supabase/server.ts` / `client.ts` — Supabase SSR/client helpers
- `content/curriculum/index.ts` — Curriculum loader; exports `CURRICULUM`, `TRACKS`, `getTrackById()`
- `content/curriculum/tracks/javascript/month-01..12.json` — Per-month JSON curriculum files
- `content/curriculum/types.ts` — Shared TypeScript interfaces for curriculum data
- `proxy.ts` — Auth guard replacing `middleware.ts`

Generated code: `app/generated/prisma/` — **never edit directly.**

### PUBLIC_PATHS in `proxy.ts`
`/login`, `/offline`, `/sw.js`, `/manifest.webmanifest` — all must be publicly accessible (PWA + auth).

### API Patterns
- Course/project/profile: action-based POST `{ action: "create"|"update"|"delete", ...data }`
- Quiz: direct POST `{ blockId: string, score: number, answers?: Record<string, number> }`
- AI recommendations: GET (cached, 24h TTL) / POST (force-refresh)
- GitHub sync: POST (sync events + award XP) / DELETE (disconnect)

### API Routes (newer)

| Route | Purpose |
|---|---|
| `api/ai/recommendations` | AI coach — personalised suggestions via `claude-haiku-4-5-20251001`, cached 24h in `AiRecommendation` |
| `api/accountability` | Link/unlink accountability partner by email |
| `api/user/api-key` | Generate / regenerate / revoke `df_`-prefixed VS Code extension API keys |
| `api/auth/github` | GitHub OAuth initiation (CSRF state cookie) |
| `api/auth/github/callback` | GitHub OAuth callback — token exchange + username fetch |
| `api/github/sync` | Sync last 30 days of GitHub events + award XP idempotently |

---

## Database Models (key additions)

| Model | Key fields | Notes |
|---|---|---|
| `User` | `dailyGoalBlocks` (default 3), `weeklyGoalBlocks` (default 10), `track` (default `"javascript"`), `githubUsername`, `githubAccessToken`, `githubLastSyncAt`, `apiKey @unique` | Multi-user ready |
| `AiRecommendation` | `userId @unique`, cached JSON, `updatedAt` | 1 row per user; 24h TTL checked at request time |
| `AccountabilityPair` | `userId`, `partnerId` | Bidirectional link |
| `GithubEvent` | `(userId, eventId) @unique` | Deduplication table for idempotent XP awards |

---

## XP System

Defined in `lib/xp.ts` — single source of truth.

| Action | XP |
|---|---|
| Complete block | 15 |
| Complete block (with Pomodoro) | 20 |
| Daily login | 5 |
| 7-day streak bonus | 10 |
| 30-day streak bonus | 25 |
| Roadmap topic | 10 |
| Roadmap subtopic | 5 |
| Add course | 10 |
| Complete course | 50 |
| Complete project | 100 |
| Skip block | 2 |
| Quiz attempt (any score) | 5 |
| Quiz pass (score ≥ 70%) | +15 (stacks) |
| Quiz perfect (score 100%) | +30 (stacks) |
| GitHub push | 5 |
| GitHub PR opened | 10 |
| GitHub PR merged | 20 |

### `lib/user.ts` Exports

| Export | Description |
|---|---|
| `getCurrentUser()` | Upserts authenticated user on first login (race-safe) |
| `awardDailyLoginXP(userId)` | Awards 5 XP at most once per calendar day |
| `awardXP(userId, amount, { db? })` | Awards XP + updates level; accepts optional transaction client |
| `updateStreak(userId)` | Updates streak; awards streak bonuses idempotently via achievement records |
| `checkAchievements(userId)` | Unlocks achievements with `createMany({ skipDuplicates: true })` — concurrent-safe |

### Concurrency & Data Integrity
All XP-awarding routes wrap check → upsert → `awardXP` in a single `prisma.$transaction(...)`. `awardXP` accepts a `db` param (`Omit<PrismaClient, "$connect" | ...>`) to participate in the caller's transaction.

`DailyLog.blocksCompleted` must be incremented **inside** the same `$transaction` when a block is marked COMPLETE — this powers the daily/weekly goal progress bars.

---

## Features

### PWA
- `app/manifest.ts` — web app manifest (standalone mode, indigo theme, shortcuts to `/` and `/learning`)
- `public/sw.js` — service worker; pre-caches `/offline`, intercepts **only** `navigate`-mode requests, falls back to offline page
- `app/offline/page.tsx` — shown when connectivity is lost
- `Cache-Control: no-cache` on `sw.js` so users always get the latest worker

### Multi-track Curriculum
- Curriculum split into per-month JSON files under `content/curriculum/tracks/javascript/`
- `content/curriculum/index.ts` exports `CURRICULUM` (backward compat), `TRACKS`, `getTrackById()`
- `User.track` field selects active track; default `"javascript"`; Python stub track ready for contributions
- Validate with `node scripts/validate-curriculum.js` (checks IDs, quiz structure, duplicates)

### Daily/Weekly Goals
- `User.dailyGoalBlocks` (default 3) and `User.weeklyGoalBlocks` (default 10)
- Dashboard shows progress bars; turns green at goal
- Settings: validated server-side (daily 1–20, weekly 1–100)

### GitHub Activity Sync
- GitHub OAuth app required; set `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `NEXT_PUBLIC_APP_URL`
- Syncs last 30 days of push + PR events; idempotent via `GithubEvent` deduplication table
- OAuth CSRF protected via state cookie

### AI Recommendations
- `ANTHROPIC_API_KEY` required; widget renders `null` gracefully when key is absent
- Calls `claude-haiku-4-5-20251001` with user's level, XP, streak, block progress, quiz scores
- Results cached 24h in `AiRecommendation`; POST to force-refresh

### Body-Double Mode
- Supabase Realtime presence on `body-double` channel — anonymous headcount only
- Component cleans up channel on unmount

### Focus Sounds (PomodoroTimer)
- Web Audio API — no external files; 4 sounds: white noise, brown noise, rain, ocean
- Audio suspends/resumes with timer state; rain LFO modulates a tremolo GainNode

---

## Security Patterns

- **Auth callback**: `next` redirect param validated as relative path (starts with `/`, not `//`) — prevents open redirect
- **Block progress**: `status` validated against allowlist; `minutesSpent` sanitized to non-negative integer
- **Roadmap route**: `nodeType` validated against allowlist; stored `nodeType` used on updates to prevent XP manipulation
- **Profile PATCH**: `name` enforced as string ≤ 100 characters
- **Streak bonuses**: awarded at most once per milestone via achievement record check
- **Quiz route**: `score` validated as integer 0–100; XP stacks correctly; wrapped in `prisma.$transaction`
- **GitHub OAuth**: CSRF state cookie validated on callback
- **GitHub sync XP**: idempotent via `(userId, eventId)` unique constraint — no double-XP on re-sync

---

## Pre-push Checks (`scripts/pre-push-check.sh`)

Runs automatically on every push. Blocks on:
1. `awardXP` call outside a `$transaction` — prevents double-XP on concurrent requests
2. `getCurrentUser` without a 401 guard — catches accidentally public API routes
3. Unawaited route `params` — catches Next.js 16 breaking change (`params` is a Promise)

Warns (non-blocking) on:
4. `DailyLog.upsert` that updates `xpEarned` but not `blocksCompleted` — goal bars may not update

---

## Testing

```bash
docker compose -f compose.test.yml up -d   # Start test DB (port 5433)
npm test                                    # Run all tests
npm run test:watch                          # Watch mode
npm run test:coverage                       # Coverage report
docker compose -f compose.test.yml down    # Tear down test DB
```

- Test DB: `devfluent_test` on port **5433**; schema pushed via `prisma db push --force-reset` in `vitest.globalSetup.ts`
- Connection string in `.env.test` (gitignored): `DATABASE_URL=postgresql://postgres:test@localhost:5433/devfluent_test`
- **Isolation**: each test file owns a dedicated test user; `beforeEach` resets mutable fields and related records; `afterAll` deletes the user
- **Auth mock**: `tests/setup.ts` mocks `@/lib/supabase/server`; use `setTestUserId(id)` / `null` (→ 401)

---

## Deployment

### Docker (local / TrueNAS)

```bash
docker compose build   # Build image (node:24-alpine; passes Supabase public keys as build args)
docker compose up -d   # Run on port 30005 → container 3000, using .env.production
```

### Netcup vServer

One-time setup:

```bash
apt install -y docker.io docker-compose-plugin certbot
systemctl enable --now docker
git clone <repo-url> /opt/devfluent && cd /opt/devfluent
cp .env.production.example .env.production  # fill in all values
./scripts/deploy-netcup.sh your.domain.com  # obtains TLS cert, builds, starts app + nginx
```

Update after code push:

```bash
cd /opt/devfluent && git pull
docker compose -f compose.netcup.yml build
docker compose -f compose.netcup.yml up -d
```

Cert auto-renewal (crontab):
```
0 3 * * * certbot renew --quiet && docker compose -f /opt/devfluent/compose.netcup.yml restart nginx
```

Relevant files: `compose.netcup.yml`, `nginx/netcup.conf`, `scripts/deploy-netcup.sh`

---

## Known Non-Critical Warnings

- `lib/roadmap.ts` dynamic import of `@/content/roadmaps/*.json` produces a Turbopack module-not-found warning — intentional, it's a try/catch fallback returning `[]` on failure
