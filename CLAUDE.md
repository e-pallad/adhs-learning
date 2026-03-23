# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Development Commands

```bash
npm run dev       # Start dev server (Turbopack) at http://localhost:3000
npm run build     # Production build
npm run lint      # ESLint
npx prisma generate          # Regenerate Prisma client after schema changes
npx prisma migrate dev       # Create + apply a new migration (requires DIRECT_URL)
```

> Migrations cannot run from WSL against port 5432 — use the `supabase_apply_migration` MCP tool instead.

## Docker

```bash
docker compose build   # Build image (passes Supabase public keys as build args)
docker compose up -d   # Run on port 30005 → container 3000, using .env.production
```

## App Structure

Route groups under `app/`:
- `(auth)/` — unauthenticated pages: `/login`
- `(dashboard)/` — protected pages: `/`, `/learning`, `/roadmap`, `/training`, `/projects`, `/progress`, `/settings`
- `api/` — REST endpoints for progress tracking and user data

Key library files:
- `lib/prisma.ts` — PrismaClient singleton (uses `@prisma/adapter-pg`)
- `lib/user.ts` — `getCurrentUser`, `awardXP`, `updateStreak`, `checkAchievements`
- `lib/xp.ts` — XP values, level thresholds, achievement definitions (single source of truth)
- `lib/roadmap.ts` — roadmap.sh API integration with 24-hour cache + local JSON fallback
- `lib/supabase/server.ts` / `client.ts` — Supabase SSR/client helpers
- `content/curriculum/index.ts` — Static 12-month curriculum definition (all block data); Month 1 blocks include `quiz` questions and `practicalExample` fields
- `proxy.ts` — Auth guard replacing `middleware.ts` (Next.js 16)

Generated code: `app/generated/prisma/` — never edit directly.
