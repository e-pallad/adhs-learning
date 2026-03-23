<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Devfluent — Agent Knowledge Base

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

## Confirmed Breaking Changes & Decisions

### Next.js 16
- `middleware.ts` is **deprecated** — use `proxy.ts` with `export function proxy(req)` instead
- Dynamic route `params` are **Promises** — always `await params` before accessing fields
- No `pages/` directory — App Router only

### Prisma 7
- `url`/`directUrl` are **NOT** in `prisma/schema.prisma` — they live in `prisma.config.ts` under `datasource.url`
- `prisma.config.ts` uses `defineConfig` from `"prisma/config"`
- Generated client entry point is `client.ts` — import as `from "@/app/generated/prisma/client"` (NOT `from "@/app/generated/prisma"`)
- `PrismaClient` **requires** either `adapter` or `accelerateUrl` — pass a driver adapter: `new PrismaPg({ connectionString: process.env.DATABASE_URL! })` from `@prisma/adapter-pg`
- Migrations cannot be run from WSL against Supabase direct host on port 5432 — use `supabase_apply_migration` MCP tool instead

### Supabase DB
- Project ref: `phigbihrgojcyebymwcw`
- Pooler host (pgbouncer): `aws-0-eu-west-1.pooler.supabase.com:6543` — use for `DATABASE_URL` (app runtime)
- Pooler host (session/direct): `aws-0-eu-west-1.pooler.supabase.com:5432` — use for `DIRECT_URL` (migrations)
- DB password in `.env` as `DB_PASSWORD` — never commit to git

### API Routes
- Course/project/profile APIs use **action-based POST** pattern: `{ action: "create"|"update"|"delete", ...data }`

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

## Architecture Notes

- `userId` on **every** model — multi-user ready even though single-user now
- Curriculum is weekly (12 months × N weeks × N blocks)
- Roadmap display is a list view (grouped checklist), not a canvas/graph
- `content/roadmaps/` — local JSON mirror fallback (not critical; roadmap fetches live from roadmap.sh API first)

### `lib/user.ts` — User & XP utilities

| Export | Description |
|---|---|
| `getCurrentUser()` | Upserts authenticated user on first login (race-safe) |
| `awardDailyLoginXP(userId)` | Awards 5 XP at most once per calendar day — call on every dashboard load |
| `awardXP(userId, amount, { db? })` | Awards XP + updates level; accepts optional transaction client via `db` |
| `updateStreak(userId)` | Updates streak counter; awards streak bonuses idempotently via achievement records |
| `checkAchievements(userId)` | Unlocks achievements using `createMany({ skipDuplicates: true })` — concurrent-safe |

### Concurrency & Data Integrity

All XP-awarding progress routes wrap their check → upsert → `awardXP` calls in a single `prisma.$transaction(...)` to prevent double-XP under concurrent requests. `awardXP` accepts a `db` parameter (transaction client type: `Omit<PrismaClient, "$connect" | ...>`) so it can participate in the caller's transaction.

### Security Patterns

- Auth callback (`app/api/auth/callback/route.ts`): `next` redirect param is validated to be a relative path (starts with `/`, not `//`) — prevents open redirect
- Block progress route: validates `status` against allowlist and sanitizes `minutesSpent` to non-negative integer before any DB write
- Roadmap route: validates `nodeType` against allowlist; uses stored `nodeType` on updates to prevent XP manipulation via re-submission
- Profile PATCH: enforces `name` is a string ≤ 100 characters
- Streak bonuses: awarded at most once per milestone via an `achievement` record check — prevents farming by breaking and rebuilding streak

## Known Non-Critical Warnings

- `lib/roadmap.ts` dynamic import of `@/content/roadmaps/*.json` produces a Turbopack module-not-found warning — intentional, it's a try/catch fallback that returns `[]` on failure

