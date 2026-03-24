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

## Docker (local / TrueNAS)

```bash
docker compose build   # Build image (passes Supabase public keys as build args)
docker compose up -d   # Run on port 30005 → container 3000, using .env.production
```

## Netcup vServer Deployment

One-time setup on the server:

```bash
# Install Docker and certbot
apt install -y docker.io docker-compose-plugin certbot
systemctl enable --now docker

# Clone repo & create env file
git clone <repo-url> /opt/devfluent
cd /opt/devfluent
cp .env.production.example .env.production
# → fill in all values in .env.production

# Deploy (obtains TLS cert, builds image, starts app + nginx)
./scripts/deploy-netcup.sh your.domain.com
```

Relevant files:
- `compose.netcup.yml` — builds app + runs nginx reverse proxy on 80/443
- `nginx/netcup.conf` — nginx config (HTTP→HTTPS redirect + proxy_pass to app:3000)
- `scripts/deploy-netcup.sh` — full deploy script

To update after a code push:

```bash
cd /opt/devfluent
git pull
docker compose -f compose.netcup.yml build
docker compose -f compose.netcup.yml up -d
```

Certificate auto-renewal (add to crontab):

```
0 3 * * * certbot renew --quiet && docker compose -f /opt/devfluent/compose.netcup.yml restart nginx
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
