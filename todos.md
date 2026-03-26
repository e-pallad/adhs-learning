# Todo

## Landing Page (`claude/design-landing-page-gIlXM`)

### Routing
- [ ] Add `"/"` to `PUBLIC_PATHS` in `proxy.ts` so the landing page is publicly accessible
- [ ] Move `app/(dashboard)/page.tsx` → `app/(dashboard)/dashboard/page.tsx` (dashboard route becomes `/dashboard`)
- [ ] Update `components/layout/sidebar.tsx`: change Dashboard `NAV_ITEMS` href `"/"` → `"/dashboard"` and logo `<Link href>` `"/"` → `"/dashboard"` (2 places)
- [ ] Check `app/api/auth/callback/route.ts` and `app/(auth)/login/page.tsx` for hardcoded `"/"` redirect after successful auth — change to `"/dashboard"`

### Landing Page (`app/(landing)/page.tsx`)
- [ ] **Navbar** — sticky white bar, Devfluent logo (indigo Zap icon) left, "Sign In" indigo button → `/login` right
- [ ] **Hero** — `from-indigo-50 via-white to-purple-50` gradient bg, `⚡ Built for ADHD minds` badge chip, H1 headline, subheadline, primary CTA → `/login`, 3 trust stat pills
- [ ] **Problem → Solution** — headline "Traditional courses weren't built for you", 3-column grid: ❌ endless video playlists → ✅ bite-sized blocks / ❌ no feedback loop → ✅ XP & streaks / ❌ easy to quit → ✅ body-double & accountability
- [ ] **Features Grid** — 6 `rounded-xl border bg-white shadow-sm` cards in 2×3 grid: XP & Levels (Zap/indigo), Pomodoro Focus (Timer/violet), 12-Month Curriculum (BookOpen/blue), AI Coaching (Bot/green), GitHub Sync (Github/orange), Body-Double Mode (Users/amber)
- [ ] **Gamification Showcase** — dark `bg-gray-950 rounded-2xl` card with mock stats strip: level badge, XP progress bar, 🔥 streak, recent achievement
- [ ] **Curriculum Path Preview** — "A clear path from beginner to job-ready", Month 1–12 pills timeline, CTA → `/login`
- [ ] **Final CTA Banner** — full-width `bg-indigo-600 text-white`, H2 "Ready to start your dev journey?", white "Create free account" button → `/login`
- [ ] **Footer** — Devfluent logo + tagline, links to `/impressum` and `/datenschutz`
- [ ] **Auth redirect** — server-side: if user already has a Supabase session, redirect to `/dashboard`

### QA
- [ ] `npm run lint` — fix any TypeScript/ESLint errors across all modified files
- [ ] End-to-end check: unauthenticated `/` → landing page → click CTA → `/login` → sign in → `/dashboard`; authenticated `/` → redirects to `/dashboard`; all sidebar links work

### Deploy
- [ ] Commit all changes with descriptive message and push to `claude/design-landing-page-gIlXM`
