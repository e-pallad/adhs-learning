# CLAUDE.md — Galactic Code

## What This Is

**Galactic Code** is a space-themed RPG learning platform for developers. Players are cadets at an intergalactic academy, completing coding missions to earn XP, rank up, and unlock medals. ADHD-first design: chunked content, streak mechanics with a freeze, visual progress everywhere, and a built-in focus timer.

Curriculum lives in the database, editable via a built-in admin panel. Auth is Clerk. DB is Neon (PostgreSQL via Drizzle). Real-time crew presence uses Upstash Redis + SSE.

---

## caveman

Terse like caveman. Technical substance exact. Only fluff die.
Drop: articles, filler (just/really/basically), pleasantries, hedging.
Fragments OK. Short synonyms. Code unchanged.
Pattern: [thing] [action] [reason]. [next step].
ACTIVE EVERY RESPONSE.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript strict) |
| ORM | Drizzle ORM — `drizzle-orm/neon-http` driver |
| Database | Neon serverless PostgreSQL |
| Auth | Clerk (`@clerk/nextjs` v6+) |
| Validation | Zod (all API request bodies + env vars) |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix primitives) |
| Animations | Motion v12 (`import { motion } from "motion/react"`) |
| Charts | Recharts — **dynamic import only**, always `"use client"` |
| Real-time | Upstash Redis + SSE (Crew Bay presence) |
| Date utils | date-fns v3+ (named imports only) |
| AI | Anthropic SDK (`claude-haiku-4-5-20251001`) |
| Analytics | `@vercel/analytics` (`<Analytics />` in root layout) |
| Package manager | npm |

### Critical Runtime Rules

| Rule | Reason |
|---|---|
| Never `export const runtime = "edge"` on routes that import `lib/db` | Neon HTTP driver is Node-only — crashes in edge |
| SSE route (`/api/crew-bay/presence`) uses Upstash Redis only → `export const runtime = "edge"` is correct | Redis client is edge-compatible |
| All Motion + Recharts components must have `"use client"` | React Server Component incompatible |
| Recharts: always dynamic import | Reduces bundle size significantly |
| `date-fns`: named imports only, never default | v3 removed default export |

### Recharts Dynamic Import Pattern
```tsx
// components/dashboard/activity-heatmap.tsx
"use client"
import dynamic from "next/dynamic"
const BarChart = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false })
```

---

## Environment Variables

Validated at startup via Zod in `lib/env.ts`. App refuses to start if any required var is missing.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key |
| `CLERK_SECRET_KEY` | Clerk secret — never commit |
| `CLERK_WEBHOOK_SECRET` | Svix signing secret (`whsec_…`) — never commit |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/onboarding` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash token — never commit |
| `ANTHROPIC_API_KEY` | Claude API key — never commit |
| `NEXT_PUBLIC_APP_URL` | Full app URL (e.g. `https://galacticcode.dev`) |

---

## Development Commands

```bash
npm run dev                    # Turbopack dev server http://localhost:3000
npm run build                  # Production build
npm run lint                   # ESLint
npm run type-check             # tsc --noEmit
npx drizzle-kit push           # Push schema to Neon (dev only)
npx drizzle-kit generate       # Generate migration SQL
npx drizzle-kit migrate        # Run migrations (CI/prod)
npx drizzle-kit studio         # Visual DB browser
npx tsx scripts/seed-demo.ts   # Seed demo star system + first admin user
npm test                       # Vitest
npm run test:watch
npm run test:coverage
```

---

## Project Structure

```
galactic-code/
├── app/
│   ├── page.tsx                          # Landing page (public, SEO)
│   ├── layout.tsx                        # Root layout — fonts, Analytics, Clerk provider
│   ├── not-found.tsx                     # Global 404
│   ├── error.tsx                         # Global error boundary
│   ├── loading.tsx                       # Global loading skeleton
│   ├── robots.ts                         # robots.txt generator
│   ├── sitemap.ts                        # XML sitemap generator
│   ├── manifest.ts                       # PWA manifest
│   ├── opengraph-image.tsx               # Default OG image
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── onboarding/page.tsx               # Track + goal setup (post sign-up)
│   ├── offline/page.tsx                  # PWA offline fallback
│   ├── (dashboard)/
│   │   ├── layout.tsx                    # Sidebar (desktop) + mobile nav + top bar
│   │   ├── error.tsx                     # Dashboard error boundary
│   │   ├── loading.tsx                   # Dashboard loading skeleton
│   │   ├── dashboard/page.tsx            # Command Bridge
│   │   ├── academy/
│   │   │   ├── page.tsx                  # Star system grid
│   │   │   └── [system]/page.tsx         # Sector + mission list
│   │   ├── character/page.tsx            # Pilot profile + medals
│   │   ├── mission-log/page.tsx          # Progress heatmap + full medal gallery
│   │   ├── operations/page.tsx           # Capstone projects
│   │   ├── sim-bay/page.tsx              # External courses + practice
│   │   ├── star-map/
│   │   │   ├── page.tsx                  # Roadmap list
│   │   │   └── [slug]/page.tsx           # Individual roadmap
│   │   ├── leaderboard/page.tsx          # Top pilots (opt-in)
│   │   └── settings/
│   │       ├── page.tsx                  # Profile + preferences
│   │       └── goals/page.tsx
│   ├── admin/
│   │   ├── layout.tsx                    # Role check → notFound() if not admin
│   │   ├── page.tsx                      # Admin overview
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   └── [userId]/page.tsx
│   │   └── curriculum/
│   │       ├── page.tsx
│   │       ├── new/page.tsx
│   │       └── [systemId]/
│   │           ├── page.tsx
│   │           └── sectors/[sectorId]/
│   │               ├── page.tsx
│   │               └── missions/
│   │                   ├── new/page.tsx
│   │                   └── [missionId]/page.tsx
│   └── api/
│       ├── health/route.ts
│       ├── progress/mission/route.ts
│       ├── progress/skill-check/route.ts
│       ├── operations/route.ts
│       ├── courses/route.ts
│       ├── star-map/route.ts
│       ├── crew-bay/presence/route.ts    # export const runtime = "edge"
│       ├── user/stats/route.ts
│       ├── user/onboarding/route.ts
│       ├── ai/recommendations/route.ts
│       ├── leaderboard/route.ts
│       ├── admin/users/route.ts
│       ├── admin/users/[userId]/route.ts
│       ├── admin/curriculum/route.ts
│       └── webhooks/clerk/route.ts
├── components/
│   ├── ui/                               # shadcn/ui
│   ├── layout/sidebar.tsx
│   ├── layout/mobile-nav.tsx
│   ├── layout/top-bar.tsx
│   ├── layout/star-field.tsx
│   ├── landing/hero.tsx
│   ├── landing/features.tsx
│   ├── landing/demo-preview.tsx
│   ├── onboarding/track-selector.tsx
│   ├── academy/star-system-card.tsx
│   ├── academy/mission-card.tsx
│   ├── academy/focus-cycle-timer.tsx
│   ├── academy/skill-check-modal.tsx
│   ├── academy/focus-sounds.tsx
│   ├── gamification/rank-badge.tsx
│   ├── gamification/xp-bar.tsx
│   ├── gamification/hyperdrive-counter.tsx
│   ├── gamification/mission-quota.tsx
│   ├── gamification/celebration-modal.tsx
│   ├── character/pilot-sheet.tsx
│   ├── character/medal-grid.tsx
│   ├── dashboard/activity-heatmap.tsx
│   ├── dashboard/crew-widget.tsx
│   ├── dashboard/quick-nav.tsx
│   ├── admin/user-table.tsx
│   ├── admin/curriculum-tree.tsx
│   └── admin/mission-editor.tsx
├── lib/
│   ├── db/index.ts
│   ├── db/schema.ts
│   ├── env.ts
│   ├── xp.ts
│   ├── missions.ts
│   ├── crew-bay.ts
│   └── rate-limit.ts
├── content/star-maps/
├── scripts/seed-demo.ts
├── middleware.ts
├── drizzle.config.ts
└── .env.example
```

---

## Space Terminology

| Concept | UI Name |
|---|---|
| Learning block | Mission |
| Month of content | Star System |
| Week / theme | Sector |
| Streak | Hyperdrive Charge |
| Level | Rank |
| Achievement | Medal |
| Co-study feature | Crew Bay |
| Pomodoro timer | Focus Cycle |
| Quiz | Skill Check |
| Daily goal | Daily Mission Quota |
| Weekly goal | Weekly Mission Target |
| Theory block | Briefing |
| Practice block | Training Op |
| Project block | Strike Mission |
| Review block | Debrief |
| Roadmap | Star Map |
| External courses | Simulation Bay |
| Projects | Operations |
| Progress page | Mission Log |
| Dashboard | Command Bridge |

---

## XP System (`lib/xp.ts` — single source of truth)

```ts
export const XP_VALUES = {
  COMPLETE_MISSION: 15,
  COMPLETE_MISSION_FOCUS_CYCLE: 20,
  DAILY_LOGIN: 5,
  SKILL_CHECK_ATTEMPT: 5,
  SKILL_CHECK_PASS: 15,
  SKILL_CHECK_PERFECT: 30,
  COMPLETE_OPERATION: 100,
  SKIP_MISSION: 2,
  STAR_MAP_TOPIC: 10,
  STAR_MAP_SUBTOPIC: 5,
  ADD_COURSE: 10,
  COMPLETE_COURSE: 50,
  STREAK_BONUS_7: 10,
  STREAK_BONUS_30: 25,
} as const

// Skill Check XP:
// score < 70:  5 XP
// score 70-99: 20 XP
// score 100:   35 XP
```

### Space Ranks

| Rank | XP | Label |
|---|---|---|
| 1 | 0 | Cadet |
| 2 | 100 | Navigator |
| 3 | 250 | Ensign |
| 4 | 500 | Lieutenant |
| 5 | 1000 | Commander |
| 6 | 2000 | Captain |
| 7 | 3500 | Fleet Captain |
| 8 | 5000 | Admiral |
| 9 | 7500 | Grand Admiral |
| 10 | 10000 | Starfleet Legend |

`getRankProgress()` returns `nextXp: null` at max rank. UI must handle `null`.

### Character Classes

| Track | Class | Icon |
|---|---|---|
| javascript | Code Pilot | ⚡ |
| python | Data Mage | 🔮 |
| default | Space Cadet | 🛸 |

### Medals

| Slug | Label | Trigger | XP Bonus |
|---|---|---|---|
| first_mission | First Mission | 1 mission done | 10 |
| hyperdrive_3 | Hyperdrive Online | 3-day streak | 15 |
| hyperdrive_7 | Warp Speed | 7-day streak | 30 |
| hyperdrive_30 | Cosmic Velocity | 30-day streak | 100 |
| rank_5 | Commander Rank | Reach rank 5 | 50 |
| rank_10 | Starfleet Legend | Reach rank 10 | 200 |
| first_operation | First Operation | 1 operation done | 50 |
| operations_3 | Fleet Builder | 3 operations done | 100 |
| first_check | Skill Check | 1 attempt | 10 |
| tactical_genius | Tactical Genius | 5 checks passed | 50 |
| perfect_score | Flawless Execution | 100% on check | 25 |

---

## Database Schema

All tables in `lib/db/schema.ts`. Full Drizzle ORM definitions.

### Enums
- `user_role`: user, admin, moderator
- `mission_type`: briefing, training-op, strike-mission, debrief
- `mission_status`: NOT_STARTED, IN_PROGRESS, COMPLETED, SKIPPED
- `operation_status`: NOT_STARTED, IN_PROGRESS, COMPLETED
- `node_type`: topic, subtopic
- `node_status`: NOT_STARTED, COMPLETED

### Tables
- `users` — id(uuid), clerkId(unique), email, name, avatarUrl, role, totalXp(0), rank(1), track("javascript"), streak(0), lastSeenAt, streakFreezeUsedAt, dailyGoalMissions(3), weeklyGoalMissions(10), onboardingCompleted(false), showOnLeaderboard(false), createdAt, deletedAt
- `tracks` — id(text pk), name, characterClass, icon, description, isActive
- `star_systems` — id(uuid), trackId→tracks, number, title, description, operationTitle, operationDescription, alternativeOperations(jsonb), publishedAt(nullable=draft), createdAt, updatedAt — unique(trackId,number)
- `sectors` — id, systemId→star_systems(cascade), number, theme — unique(systemId,number)
- `missions` — id, sectorId→sectors(cascade), systemId→star_systems(cascade), number, title, type, durationMinutes, description, practicalExample, publishedAt — unique(sectorId,number)
- `mission_resources` — id, missionId(cascade), label, url, displayOrder
- `skill_check_questions` — id, missionId(cascade), question, options(jsonb string[4]), correctIndex(0-3), explanation, displayOrder
- `exercises` — id, missionId(cascade), title, description, starterCode, solution, hints(jsonb string[]), displayOrder
- `exercise_tests` — id, exerciseId(cascade), description, code, displayOrder
- `mission_progress` — id, userId(cascade), missionId, status, minutesSpent, xpEarned, usedFocusCycle, completedAt — unique(userId,missionId)
- `daily_logs` — id, userId(cascade), date(date UTC), xpEarned, minutesStudied, missionsCompleted — unique(userId,date)
- `medals` — id, userId(cascade), slug, label, description, icon, xpBonus, unlockedAt — unique(userId,slug)
- `skill_check_attempts` — id, userId(cascade), missionId, score(0-100), passed, perfect, xpEarned, attemptedAt
- `mission_notes` — id, userId(cascade), missionId, content(max 10000), updatedAt — unique(userId,missionId)
- `operations` — id, userId(cascade), trackId, systemNumber, title, description, repoUrl, liveUrl, status, xpEarned, completedAt — unique(userId,trackId,systemNumber)
- `external_courses` — id, userId(cascade), platform, url, title, totalLessons, completedLessons, xpEarned, isCompleted, completedAt
- `star_map_progress` — id, userId(cascade), roadmapSlug, nodeId, nodeType, status, completedAt — unique(userId,roadmapSlug,nodeId)
- `ai_recommendations` — id, userId(unique cascade), content, generatedAt, expiresAt

---

## Key Library Files

### `lib/db/index.ts`
```ts
import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"
const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

### `drizzle.config.ts`
```ts
import { defineConfig } from "drizzle-kit"
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
})
```

### Route Auth Pattern
```ts
const { userId: clerkId } = await auth()
if (!clerkId) return Response.json({ error: "Unauthorized" }, { status: 401 })
const user = await getUser(clerkId)
if (!user) return Response.json({ error: "User not found" }, { status: 404 })
const body = await req.json()
const result = mySchema.safeParse(body)
if (!result.success) return Response.json({ error: result.error.flatten() }, { status: 422 })
```

### XP Transaction Pattern
```ts
await db.transaction(async (tx) => {
  // 1. Check status — return early if COMPLETED
  // 2. Upsert missionProgress
  // 3. awardXP(userId, amount, { tx })
  // 4. Increment dailyLogs.missionsCompleted
})
// Outside tx (idempotent):
updateStreak(userId)
checkMedals(userId)
```

---

## API Routes

| Route | Method | Notes |
|---|---|---|
| `/api/health` | GET | SELECT 1 ping |
| `/api/progress/mission` | POST | in db.transaction() |
| `/api/progress/skill-check` | POST | in db.transaction() |
| `/api/operations` | POST | action-based |
| `/api/courses` | POST | action-based |
| `/api/star-map` | POST | toggle node status |
| `/api/crew-bay/presence` | GET/POST/DELETE | SSE edge route |
| `/api/user/stats` | GET | aggregated stats |
| `/api/user/onboarding` | POST | sets onboardingCompleted |
| `/api/ai/recommendations` | GET/POST | cached 24h |
| `/api/leaderboard` | GET | top 50 opt-in |
| `/api/admin/users` | GET | paginated |
| `/api/admin/users/[userId]` | PATCH | edit XP/role |
| `/api/admin/curriculum` | GET/POST/PATCH/DELETE | full CRUD |
| `/api/webhooks/clerk` | POST | PUBLIC, svix verified |

---

## User Flows

- New user: `/` → sign-up → `/onboarding` → `/dashboard`
- Middleware redirects `onboardingCompleted=false` to `/onboarding`
- `user.deleted` webhook → soft-delete PII
- First deploy: `npx tsx scripts/seed-demo.ts` sets admin + seed curriculum

---

## Crew Bay (Real-Time)

- Redis key: `galactic:presence:{userId}` TTL 60s
- Heartbeat POST every 30s
- SSE edge route counts keys every 5s
- `export const runtime = "edge"` on SSE route only

---

## Admin Panel `/admin`

- Layout: role !== admin → notFound()
- Users: paginated table, search, edit XP/role, soft-delete
- Curriculum: tree CRUD, publish/unpublish toggle (publishedAt null = draft)

---

## Visual Design

- Background: `#080C14` + CSS star field (no canvas)
- Primary: Cyan `#06B6D4` · Indigo `#6366F1` · Violet `#8B5CF6` · Success `#10B981`
- Fonts: Space Grotesk (headings) + Inter (body) via next/font/google
- Always dark, no light mode
- Mobile: bottom nav <768px; sidebar ≥768px
- Mission card left-border: briefing=blue, training-op=green, strike-mission=purple, debrief=orange

---

## Security

- Clerk middleware guards (dashboard) + /admin
- All API routes: auth() → 401, getUser() → 404
- Admin: notFound() not 403
- Webhook: svix signature verified
- Zod on all request bodies
- XP double-award: transaction-level status check
- Rate limit AI + mutations via Upstash
- GDPR: PII nulled on user.deleted

---

## Accessibility (WCAG 2.1 AA)

- Cyan on #080C14: passes 4.5:1
- focus-visible:ring-2 ring-cyan-400 on all interactive elements
- Skill Check modal: focus-trapped (Radix Dialog)
- prefers-reduced-motion: skip celebration effects
- aria-live="polite" on XP counter

---

## PWA

- app/manifest.ts: standalone, #080C14, shortcuts to /dashboard + /academy
- public/sw.js: pre-caches /offline, navigate fallback
- sw.js: Cache-Control no-cache

---

## Implementation Order

1. Scaffold + deps + shadcn + lib/env.ts + .env.example + drizzle.config.ts
2. Drizzle schema + npx drizzle-kit push
3. Clerk middleware + webhook (user.created + user.deleted)
4. lib/xp.ts + lib/missions.ts + unit tests
5. Seed script
6. Landing page + auth pages + onboarding
7. Dashboard layout (sidebar + mobile nav + top bar + star field)
8. Academy (star system grid + mission cards + Focus Cycle + Skill Check modal)
9. Progress APIs
10. Command Bridge (stats, heatmap, quotas, crew widget)
11. Gamification components (rank badge, XP bar, hyperdrive, celebration modal)
12. Character page + Mission Log
13. Crew Bay (Redis + SSE + widget)
14. Admin panel (users + curriculum CRUD)
15. Secondary pages (Operations, Sim Bay, Star Map, Leaderboard, Settings)
16. PWA
17. SEO (metadata, robots, sitemap, OG)
18. CI + pre-push checks
19. Polish

---

## Future Ideas

- Progress share card (@vercel/og)
- Mission difficulty ratings
- Re-engagement emails on streak risk
- VS Code extension with gc_-prefixed API keys
- Weekly challenge missions
- XP multiplier events (admin toggle)
- Mentor system
- Export progress CSV
- Mobile app (React Native)
