# Devfluent

An ADHD-friendly developer learning tracker. Track your learning curriculum, roadmap progress, external courses, and monthly projects — with gamification (XP, levels, streaks, achievements) to keep momentum going.

## Stack

- **Framework**: Next.js 16.2.0 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase PostgreSQL
- **ORM**: Prisma 7.5.0 with `@prisma/adapter-pg`
- **Auth**: Supabase magic link (passwordless email OTP) via `@supabase/ssr`

## Features

- **Learning curriculum** — 12-month weekly structured curriculum with Pomodoro timer
- **Roadmap tracker** — Browse roadmap.sh roadmaps and track topic/subtopic completion
- **External courses** — Log courses from any platform with progress tracking
- **Monthly projects** — Track build projects tied to each learning month
- **Progress & achievements** — XP system, levels, streaks, 30-day activity calendar
- **Settings** — Profile name, logout

## Getting Started

1. Copy `.env.local.example` → `.env.local` and fill in your Supabase credentials and DB connection strings.

2. Install dependencies:

```bash
npm install
```

3. Generate the Prisma client:

```bash
npx prisma generate
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `DATABASE_URL` | Pooled connection string (pgbouncer port 6543) |
| `DIRECT_URL` | Direct connection string (port 5432, used by migrations) |

## Project Structure

```
app/
  (auth)/login/         # Magic link login page
  (dashboard)/          # All authenticated pages
    page.tsx            # Main dashboard
    learning/           # Curriculum browser
    roadmap/            # Roadmap tracker
    training/           # External courses
    projects/           # Monthly projects
    progress/           # XP history & achievements
    settings/           # Profile & account
  api/                  # API routes
    auth/callback/      # Supabase auth callback
    progress/           # block, course, project, roadmap
    user/               # stats, profile
  generated/prisma/     # Generated Prisma client (do not edit)
lib/                    # Shared utilities
  prisma.ts             # Prisma client singleton (uses @prisma/adapter-pg)
  supabase/             # Supabase server/client helpers
  xp.ts                 # XP values, level thresholds, achievements
  roadmap.ts            # roadmap.sh API integration
  user.ts               # getCurrentUser helper
components/
  ui/                   # card, button, badge, progress-bar
  gamification/         # xp-display, streak-counter, celebration-modal
  learning/             # pomodoro-timer, block-card, month-card
  roadmap/              # roadmap-list, roadmap-node-item
  training/             # course-card, add-course-form
  layout/               # sidebar, top-bar
content/
  curriculum/index.ts   # Full 12-month curriculum definition
prisma/
  schema.prisma         # Database schema
prisma.config.ts        # Prisma 7 config (datasource URL lives here)
proxy.ts                # Auth proxy (Next.js 16 — replaces middleware.ts)
```
