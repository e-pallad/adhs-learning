# Devfluent — Open Tasks

> Last updated: 2026-04-02

> **Branching rule:** Every phase / major feature gets its own branch and PR. Never bundle multiple independent features into a single branch.

---

## Legal Pages

> Pages already exist at `app/(legal)/impressum/page.tsx` and `app/(legal)/datenschutz/page.tsx`.
> Before go-live, all `[placeholder]` values in both files must be filled with real contact details.

- [x] **Impressum: fix `§ 55 Abs. 2 RStV` → `§ 18 Abs. 2 MStV`**
  The Rundfunkstaatsvertrag (Broadcasting State Treaty) was replaced by the Medienstaatsvertrag in 2020.
  File: `app/(legal)/impressum/page.tsx` line 39

- [x] **Impressum: add EU dispute resolution notice**
  Required under § 36 VSBG + EU Regulation No. 524/2013.
  Add link to the OS platform `https://ec.europa.eu/consumers/odr`
  + statement on whether participation in dispute resolution proceedings is offered (even a refusal must be stated explicitly).
  File: `app/(legal)/impressum/page.tsx`

- [x] **Privacy policy: add Netcup as a data processor**
  Netcup GmbH (Karlsruhe) processes server logs including IP addresses as hosting provider.
  Must be listed as a data processing agreement (DPA) partner under Art. 28 GDPR in section 3.
  ⚠️ If the hosting provider changes (e.g. to Vercel), update this entry.
  File: `app/(legal)/datenschutz/page.tsx`

- [x] **Privacy policy: Art. 21 GDPR — right to object as a dedicated highlighted section**
  Per GDPR Recital 70, the right to object must be communicated "explicitly and separately from other information" — a bullet point is not legally sufficient.
  Add as its own `<section>` with visual emphasis (e.g. bordered box or banner).
  File: `app/(legal)/datenschutz/page.tsx`

- [x] **Privacy policy: Art. 22 GDPR — no profiling / no automated decision-making**
  Required disclosure even when no such processing takes place. Add a short paragraph.
  File: `app/(legal)/datenschutz/page.tsx`

- [x] **Fill in placeholders** (requires real provider details from the user)
  - `[Full name / company name]`
  - `[Street and house number]`, `[Postcode]`, `[City]`
  - `[Email address]`
  Files: `app/(legal)/impressum/page.tsx`, `app/(legal)/datenschutz/page.tsx`

---

## Content Contribution System

> **Architecture decision (2026-03-26):** GitHub-only workflow — no admin UI, no `ContentBlock` DB table.
> Review happens exclusively via GitHub PRs. Merge = published.
> Contributions are automatically validated by a GitHub Action (JSON schema validation).
> Multiple languages/tracks are supported (JavaScript, Python, …).
> **Branching rule:** Separate branch + PR per phase.

### Phase A — Structure (no DB, no UI) → Branch: `feature/curriculum-restructure`

- [x] **Extract shared types**
  `content/curriculum/types.ts` with `LearningBlock`, `QuizQuestion`, `WeekData`, `MonthData`

- [x] **Split curriculum into track directories**
  ```
  content/curriculum/
    tracks/
      javascript/
        meta.json          ← { id, title, description, language, level, icon }
        month-01.json … month-12.json
      python/
        meta.json
        month-01.json      ← stub for now
    types.ts
    index.ts               ← loads all tracks + months, merges them
  ```
  Block ID convention: `{track}-m{month}w{week}-b{n}` → e.g. `js-m1w1-b1`, `py-m1w1-b1`

- [x] **Add `User.track` field**
  `track String @default("javascript")` on the `User` model.
  Migration via `supabase_apply_migration`.
  Settings page: track selector (dropdown).
  Learning/Progress pages: filter by `user.track`.

- [x] **Write CONTRIBUTING.md**
  - Track structure + `meta.json` format
  - Block ID convention
  - Quiz format (`QuizQuestion`, 4 options, `correctIndex`, `explanation`)
  - Local setup (`npm run dev` + edit JSON)
  - PR process (fork → add JSON → PR → CI green → merge)

### Phase B — GitHub Infrastructure → same branch as Phase A

- [x] **GitHub Action: JSON schema validation**
  `.github/workflows/validate-curriculum.yml`
  Runs on every PR that touches `content/curriculum/tracks/**`.
  Validates required fields, ID format, and quiz structure.

- [x] **PR template for curriculum contributions**
  `.github/PULL_REQUEST_TEMPLATE/curriculum_contribution.md`
  Checklist: track, month, block IDs unique, quiz present, tested locally.

---

## i18n & Auth → PR #44 (`add-i18n-github-login`)

- [x] **Multi-language support (i18n) for menus, landing page, and legal pages**
  Add internationalisation to navigation menus, the landing page, and legal pages (`/impressum`, `/datenschutz`). Default language: English (`en`). Initially support `en` + `de`.

- [x] **Remove Google login**
  Strip Google OAuth provider from the login page and any related config.

- [x] **Add more achievements**
  Extend `ACHIEVEMENT_DEFINITIONS` in `lib/xp.ts`. Ideas:

  *Blocks / progress*
  - `blocks_10` — "Getting Started" — complete 10 blocks
  - `blocks_50` — "On a Roll" — complete 50 blocks
  - `blocks_100` — "Century" — complete 100 blocks
  - `blocks_500` — "Grinder" — complete 500 blocks

  *Streaks*
  - `streak_14` — "Two Weeks Strong" — 14-day streak (gap between 7 and 30)
  - `streak_100` — "Centurion" — 100-day streak

  *Levels*
  - `level_3` — "Apprentice" — reach level 3 (early win)
  - `level_7` — "Craftsman" — reach level 7

  *Quiz*
  - `perfect_3` — "Perfectionist" — 3 perfect quiz scores
  - `quiz_25` — "Study Machine" — pass 25 quizzes

  *GitHub*
  - `first_push` — "Shipped Code" — first GitHub push synced
  - `pr_merged_5` — "Pull Request Pro" — 5 PRs merged
  - `push_streak_7` — "Daily Committer" — pushes on 7 different days

  *Pomodoro / focus*
  - `first_pomodoro` — "Focus Mode" — complete first block using Pomodoro timer
  - `pomodoro_10` — "Deep Work" — complete 10 blocks with Pomodoro timer

  *Projects*
  - `projects_6` — "Half Way There" — complete 6 monthly projects
  - `projects_12` — "Full Stack" — complete all 12 monthly projects

  *Social / misc*
  - `accountability_linked` — "Better Together" — link an accountability partner
  - `body_double_5` — "Not Alone" — join body-double mode 5 times

- [x] **Overhaul XP system**
  XP gains are too high and levels are reached too fast. Rebalance XP values in `lib/xp.ts` and review level thresholds to make progression feel meaningful and appropriately paced.

- [x] **Add GitHub as a sign-in method**
  When a user signs in with GitHub, that OAuth token should automatically be used for the GitHub Activity Sync — no separate "Connect GitHub" step needed.

---

## ADHD-Friendly Tools — Phase 4

### Time Blindness

- [x] **Visual timer**
  Replace (or complement) the Pomodoro digit countdown with a shrinking circle/pie visual. More intuitive for people with poor time perception.
  _ADHD: Digits are abstract; a shrinking shape makes time passing viscerally visible._

- [x] **Transition warnings**
  Show a gentle alert ~2 minutes before a Pomodoro session ends so the context switch isn't abrupt.
  _ADHD: Sudden interruptions are jarring and cause frustration; a soft warning allows mental preparation._

- [ ] **Time-blocking planner**
  A simple daily schedule view where users anchor study sessions to existing habits (e.g. "09:00 — 1 block after morning coffee").
  _ADHD: Attaching new behaviours to existing routines (habit stacking) dramatically improves follow-through._

### Working Memory

- [x] **Block scratchpad**
  A quick-notes field attached to each learning block — capture thoughts, questions, or code snippets without leaving the page.
  _ADHD: Offloads working memory so the user can stay focused without losing stray thoughts._

- [ ] **Brain dump**
  A one-click notepad that appears before a session starts. User empties distracting thoughts into it, then begins studying with a clearer head.
  _ADHD: Pre-session brain dumps reduce internal noise and improve on-task focus._

- [x] **Quick-start / resume**
  A single prominent button on the dashboard that jumps straight back to the last open block — zero navigation friction.
  _ADHD: Reduces the initiation barrier; the hardest part of studying is often just starting._

### Motivation & Progress Visibility

- [x] **Progress replay**
  A "look how far you've come" view showing all completed blocks, milestones, and achievements over time.
  _ADHD: Combats imposter syndrome and RSD by making invisible progress visible and concrete._

- [x] **Celebration animations** *(opt-in)*
  More visible dopamine hit on block/level/achievement completion — confetti, sound, or a brief full-screen moment.
  Add a toggle in Settings to enable/disable (some users find animations distracting).
  _ADHD: Immediate positive reinforcement is essential; delayed rewards have little motivational effect._

### Focus & Interest

- [ ] **Interest spike mode**
  Let users temporarily jump to a different topic or month when curiosity strikes, then return to their original position. Log the detour so they never get lost.
  _ADHD: Fighting interest spikes causes frustration and avoidance; channelling them keeps momentum going._

### Routine & Structure

- [ ] **Habit stacking / study reminders**
  User defines a trigger ("after my morning coffee", "at 09:00") and receives a push notification or in-app nudge to start their session.
  _ADHD: Linking study to an existing anchor habit removes the need to remember or self-initiate._

---

## Feature Roadmap

### Phase 1 — Short-term

- [x] **Dark Mode**
  Tailwind `dark:` classes + theme toggle in Settings + `localStorage` persistence.
  _ADHD: Reduces visual overstimulation and eye strain during long study sessions._

- [x] **PWA (Progressive Web App)**
  Native Next.js 16 App Manifest + Service Worker.
  Home screen installation, offline fallback page.
  _ADHD: Eliminates friction on app launch — no need to open a browser tab._

- [x] **Daily & Weekly Goals**
  User sets a daily target of X blocks. Progress bars on the dashboard.
  DB: `dailyGoalBlocks` + `weeklyGoalBlocks` fields on the `User` model.
  _ADHD: Small, clearly defined goals create structure and immediate wins._

- [x] **Focus Sounds**
  Choice of white noise, brown noise, rain, ocean — playable directly in the Pomodoro timer.
  Implemented via Web Audio API (no external files).
  _ADHD: Auditory stimulation promotes hyperfocus and masks distracting background noise._

- [x] **Streak Freeze**
  Usable once per week. Button in Settings or on the dashboard.
  DB: `streakFreezeUsedAt` field on `User`, checked inside `updateStreak()` (`lib/user.ts`).
  _ADHD: Prevents all-or-nothing demotivation after a missed day._

- [x] **Body-Double Mode**
  Shared anonymous focus session — user sees a real-time count of active learners.
  Implementation: Supabase Realtime channel + anonymous presence.
  _ADHD: A well-established ADHD technique — the perceived presence of others significantly increases productivity._

---

### UI / Navigation

- [x] **Logout button & profile link in top bar**
  Add a user menu (avatar/name) to the top bar with quick access to the profile/settings page and a logout button. Keeps navigation consistent and reduces friction.

- [x] **Fix 502 Bad Gateway**
  Fix the Problem where if the Session timed out a error 502 is thrown on the page. The User should get redirected to the Login.

- [ ] **Data privacy & user tracking transparency page**
  Add a dedicated page where users can see exactly what data is collected and stored about them (XP history, quiz scores, GitHub tokens, etc.), download their data (GDPR Art. 20 portability), and permanently delete their account + all associated data (GDPR Art. 17 right to erasure). Link from Settings and the Datenschutz page.

- [ ] **Demo mode with limited access**
  Allow unauthenticated visitors to try the app without signing up. Show a fixed set of blocks (e.g. Month 1, Week 1), a mock XP/streak state, and a persistent banner prompting sign-up to save progress. No DB writes in demo mode.

- [ ] **Profile images**
  Allow users to upload or link a profile picture. Show it in the top bar, on the accountability partner panel, and in body-double mode.
  Options: direct upload to Supabase Storage, or pull avatar from GitHub OAuth when signed in with GitHub.

---

### Phase 2 — Mid-term

- [x] **GitHub Activity Sync**
  GitHub OAuth + event polling for commits/PRs → automatic XP awards.
  XP values for GitHub events defined in `lib/xp.ts`.
  _ADHD: Ties learning to real actions and gives instant feedback with no manual effort._

- [ ] **VS Code Extension** *(API key foundation ✓ — separate repo)*
  Separate repository. Shows the current learning block + resources directly in the sidebar.
  Communicates with the Devfluent API via API key (Settings page → already implemented).
  _ADHD: Eliminates the costly context switch between editor and browser._

- [x] **AI Recommendations**
  Based on completed blocks, weak spots (quiz scores < 70 %), and streak history.
  Claude API (`claude-haiku-4-5-20251001`) as backend, results cached in the `AiRecommendation` table.
  _ADHD: Prevents decision paralysis — clear next steps are surfaced automatically._

- [x] **Accountability Partner**
  Two users link up and can see each other's streak and weekly goal progress.
  DB: `AccountabilityPair` table, opt-in via invite link.
  _ADHD: Social accountability is one of the most effective external motivators._

---

### Phase 3 — Long-term

- [ ] **Community Challenges**
  Time-limited group learning goals (e.g. "complete 30 blocks together in 7 days").
  _ADHD: Competition and community create urgency and dopamine._

- [ ] **Mentor Matching**
  Connect learners with experienced developers. Matched by technology stack.
  _ADHD: Regular mentor check-ins provide external structure and immediate feedback._

- [ ] **Browser Extension**
  Learning block reminders while browsing, quick-log directly from the browser.
  _ADHD: Contextual reminders catch attention at the right moment._

- [ ] **Mobile App**
  React Native or expanded PWA with native push notifications.
  _ADHD: Learning in short breaks — push notifications as daily anchors._

---

## Landing Page → PR #30 (`feature/landing-page`)

### Routing
- [x] Add `"/"` to `PUBLIC_PATHS` in `proxy.ts` so the landing page is publicly accessible
- [x] Move `app/(dashboard)/page.tsx` → `app/(dashboard)/dashboard/page.tsx` (dashboard route becomes `/dashboard`)
- [x] Update `components/layout/sidebar.tsx`: change Dashboard `NAV_ITEMS` href `"/"` → `"/dashboard"` and logo `<Link href>` `"/"` → `"/dashboard"` (2 places)
- [x] Check `app/api/auth/callback/route.ts` and `app/(auth)/login/page.tsx` for hardcoded `"/"` redirect after successful auth — change to `"/dashboard"`

### Page Sections (`app/(landing)/page.tsx`)
- [x] **Navbar** — sticky white bar, Devfluent logo (indigo Zap icon) left, "Sign In" indigo button → `/login` right
- [x] **Hero** — `from-indigo-50 via-white to-purple-50` gradient bg, `⚡ Built for ADHD minds` badge chip, H1 headline, subheadline, primary CTA → `/login`, 3 trust stat pills
- [x] **Problem → Solution** — headline "Traditional courses weren't built for you", 3-column grid: ❌ endless video playlists → ✅ bite-sized blocks / ❌ no feedback loop → ✅ XP & streaks / ❌ easy to quit → ✅ body-double & accountability
- [x] **Features Grid** — 6 `rounded-xl border bg-white shadow-sm` cards in 2×3 grid: XP & Levels (Zap/indigo), Pomodoro Focus (Timer/violet), 12-Month Curriculum (BookOpen/blue), AI Coaching (Bot/green), GitHub Sync (Github/orange), Body-Double Mode (Users/amber)
- [x] **Gamification Showcase** — dark `bg-gray-950 rounded-2xl` card with mock stats strip: level badge, XP progress bar, 🔥 streak, recent achievement
- [x] **Curriculum Path Preview** — "A clear path from beginner to job-ready", Month 1–12 pills timeline, CTA → `/login`
- [x] **Final CTA Banner** — full-width `bg-indigo-600 text-white`, H2 "Ready to start your dev journey?", white "Create free account" button → `/login`
- [x] **Footer** — Devfluent logo + tagline, links to `/impressum` and `/datenschutz`
- [x] **Auth redirect** — server-side: if user already has a Supabase session, redirect to `/dashboard`

### QA & Deploy
- [x] `npm run lint` — fix any TypeScript/ESLint errors across all modified files
- [ ] End-to-end check: unauthenticated `/` → landing page → CTA → `/login` → sign in → `/dashboard`; authenticated `/` → redirects to `/dashboard`; all sidebar links work
- [x] Commit all changes with a descriptive message and pushed to `feature/landing-page`

---

## Completed

- [x] Impressum page created (`/impressum`) — placeholders still need to be filled
- [x] Privacy policy page created (`/datenschutz`) — GDPR base structure in place
- [x] `proxy.ts`: `/impressum` and `/datenschutz` added to `PUBLIC_PATHS`
- [x] Sidebar footer: links to Impressum & Datenschutz
- [x] Login page: links to Impressum & Datenschutz below the form
