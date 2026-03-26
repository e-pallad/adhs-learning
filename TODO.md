# Devfluent — Offene Aufgaben

> Zuletzt aktualisiert: 2026-03-26
> Aktiver Branch: `claude/add-legal-pages-todo-PdxBj`
> Zum Fortfahren: Branch auschecken, diese Datei lesen, erledigte Tasks abhaken.

> **Branching-Regel:** Jede Phase / jedes größere Feature bekommt einen eigenen Branch und PR.
> Niemals mehrere unabhängige Features in einen Branch bündeln.

---

## Legal Pages

> Die Seiten existieren bereits unter `app/(legal)/impressum/page.tsx` und `app/(legal)/datenschutz/page.tsx`.
> Vor Go-Live müssen die `[Platzhalter]` in beiden Dateien mit echten Kontaktdaten befüllt werden.

- [x] **Impressum: `§ 55 Abs. 2 RStV` → `§ 18 Abs. 2 MStV` korrigieren**
  Der Rundfunkstaatsvertrag wurde 2020 durch den Medienstaatsvertrag ersetzt.
  Datei: `app/(legal)/impressum/page.tsx` Zeile 39

- [x] **Impressum: EU-Streitschlichtungshinweis ergänzen**
  Pflicht gemäß § 36 VSBG + EU-Verordnung Nr. 524/2013.
  Link zur OS-Plattform `https://ec.europa.eu/consumers/odr` einfügen
  + Erklärung, ob Teilnahme an Streitbeilegungsverfahren angeboten wird (auch Ablehnung muss schriftlich erklärt werden).
  Datei: `app/(legal)/impressum/page.tsx`

- [x] **Datenschutz: Netcup als Auftragsverarbeiter ergänzen**
  Netcup GmbH (Karlsruhe) verarbeitet als Hosting-Anbieter Server-Logs inkl. IP-Adressen.
  Muss als AVV-Partner gemäß Art. 28 DSGVO in Abschnitt 3 genannt werden.
  ⚠️ Falls Hosting-Anbieter wechselt (z. B. zu Vercel), diesen Eintrag aktualisieren.
  Datei: `app/(legal)/datenschutz/page.tsx`

- [x] **Datenschutz: Art. 21 DSGVO — Widerspruchsrecht als eigene hervorgehobene Section**
  Laut DSGVO Erwägungsgrund 70 muss das Widerspruchsrecht „ausdrücklich und getrennt von anderen Informationen" mitgeteilt werden — ein Listenpunkt reicht rechtlich nicht aus.
  Als eigene `<Section>` mit visueller Hervorhebung (z. B. Rahmen/Banner) ergänzen.
  Datei: `app/(legal)/datenschutz/page.tsx`

- [x] **Datenschutz: Art. 22 DSGVO — Kein Profiling / keine automatisierte Entscheidungsfindung**
  Pflichtangabe auch wenn keine stattfindet. Kurzen Abschnitt ergänzen.
  Datei: `app/(legal)/datenschutz/page.tsx`

- [x] **Platzhalter befüllen** (benötigt echte Anbieterdaten vom Nutzer)
  - `[Vor- und Nachname / Firmenname]`
  - `[Straße und Hausnummer]`, `[PLZ]`, `[Stadt]`
  - `[E-Mail-Adresse]`
  Dateien: `app/(legal)/impressum/page.tsx`, `app/(legal)/datenschutz/page.tsx`

---

## Content-Contribution-System

> **Architektur-Entscheidung (2026-03-26):** GitHub-only Workflow — kein Admin-UI, keine ContentBlock-DB-Tabelle.
> Review erfolgt ausschließlich über GitHub PRs. Merge = published.
> Beiträge werden durch eine GitHub Action (JSON-Schema-Validierung) automatisch geprüft.
> Mehrere Sprachen/Tracks werden unterstützt (JavaScript, Python, …).
> **Branch-Regel:** Eigener Branch + PR pro Phase.

### Phase A — Struktur (kein DB, kein UI) → Branch: `feature/curriculum-restructure`

- [x] **Types auslagern**
  `content/curriculum/types.ts` mit `LearningBlock`, `QuizQuestion`, `WeekData`, `MonthData`

- [x] **Curriculum in Track-Verzeichnisse aufsplitten**
  ```
  content/curriculum/
    tracks/
      javascript/
        meta.json          ← { id, title, description, language, level, icon }
        month-01.json … month-12.json
      python/
        meta.json
        month-01.json      ← zunächst stub/leer
    types.ts
    index.ts               ← lädt alle Tracks + Monate, merged
  ```
  Block-ID-Konvention: `{track}-m{month}w{week}-b{n}` → z.B. `js-m1w1-b1`, `py-m1w1-b1`

- [x] **User.track-Feld ergänzen**
  `track String @default("javascript")` auf `User`-Model.
  Migration via `supabase_apply_migration`.
  Settings-Seite: Track-Auswahl (Dropdown).
  Learning/Progress-Seiten: nach `user.track` filtern.

- [x] **CONTRIBUTING.md schreiben**
  - Track-Struktur + `meta.json`-Format
  - Block-ID-Konvention
  - Quiz-Format (`QuizQuestion`, 4 Optionen, `correctIndex`, `explanation`)
  - Lokales Setup (npm run dev + JSON editieren)
  - PR-Prozess (Fork → JSON ergänzen → PR → CI grün → Merge)

### Phase B — GitHub Infra → gleicher Branch wie Phase A

- [x] **GitHub Action: JSON-Schema-Validierung**
  `.github/workflows/validate-curriculum.yml`
  Läuft auf jedem PR der `content/curriculum/tracks/**` berührt.
  Validiert Pflichtfelder, ID-Format, Quiz-Struktur.

- [x] **PR-Template für Curriculum-Beiträge**
  `.github/PULL_REQUEST_TEMPLATE/curriculum_contribution.md`
  Checkliste: Track, Monat, Block-IDs eindeutig, Quiz vorhanden, lokal getestet.

---

## Feature-Roadmap

### Phase 1 — Kurzfristig

- [x] **Dark Mode**
  Tailwind `dark:`-Klassen + Theme-Toggle in Settings + `localStorage`-Persistenz.
  _ADHS: Reduziert visuelle Reizüberflutung und Augenermüdung bei langen Lernsessions._

- [x] **PWA (Progressive Web App)**
  `next-pwa` oder natives Next.js 16 App-Manifest + Service Worker.
  Home-Screen-Installation, Offline-Fallback-Seite.
  _ADHS: Eliminiert Reibung beim App-Start — kein Browser-Tab öffnen nötig._

- [x] **Tages- und Wochenziele**
  Nutzer setzt täglich X Blöcke / Y Minuten als Ziel. Fortschrittsbalken auf Dashboard.
  DB: neue `DailyGoal`-Tabelle oder Erweiterung des `User`-Modells.
  _ADHS: Kleine, klar definierte Ziele schaffen Struktur und sofortige Erfolgserlebnisse._

- [x] **Fokus-Sounds**
  Auswahl aus White Noise, Rain, Lo-Fi, Café — abspielbar direkt im Pomodoro-Timer.
  Entweder externe URLs (royalty-free) oder eingebetteter Audio-Player.
  _ADHS: Auditive Stimulation fördert Hyperfokus und blockiert ablenkende Umgebungsgeräusche._

- [x] **Streak Freeze**
  1× pro Woche verwendbar. Button in Settings oder auf Dashboard.
  DB: `streakFreezeUsedAt`-Feld auf `User`, Prüfung in `updateStreak()` (`lib/user.ts`).
  _ADHS: Verhindert Alles-oder-nichts-Demotivation nach einem vergessenen Tag._

- [ ] **Body-Double-Modus**
  Geteilte anonyme Fokus-Session — Nutzer sieht Echtzeit-Zähler aktiver Lernender.
  Technisch: Supabase Realtime-Channel + anonyme Presence.
  _ADHS: Bewährte ADHS-Technik — gefühlte Anwesenheit anderer erhöht Arbeitsleistung signifikant._

---

### Phase 2 — Mittelfristig

- [x] **GitHub Activity Sync**
  GitHub OAuth + API-Polling für Commits/PRs → automatische XP-Vergabe.
  XP-Wert für GitHub-Events in `lib/xp.ts` ergänzen.
  _ADHS: Koppelt Lernen an reale Handlungen, gibt sofortiges Feedback ohne manuellen Aufwand._

- [ ] **VS Code Extension** *(API-Key-Foundation ✓ — separates Repo)*
  Separates Repo. Zeigt aktuellen Lernblock + Ressourcen direkt in der Sidebar an.
  Kommuniziert mit Devfluent-API via API-Key (Settings-Seite → bereits implementiert).
  _ADHS: Eliminiert den teuren Kontextwechsel zwischen Editor und Browser._

- [x] **KI-Empfehlungen**
  Basierend auf abgeschlossenen Blöcken, Schwächen (Quiz-Scores < 70 %), Streak-Verlauf.
  Claude API (`claude-sonnet-4-6`) als Backend, Ergebnisse gecacht in DB.
  _ADHS: Verhindert Entscheidungsparalyse — klare nächste Schritte werden vorgegeben._

- [x] **Accountability Partner**
  Zwei Nutzer verknüpfen sich, sehen gegenseitig Streak und Wochenziel-Fortschritt.
  DB: `AccountabilityPair`-Tabelle, opt-in per Einladungslink.
  _ADHS: Soziale Verantwortlichkeit ist einer der effektivsten externen Motivatoren._

---

### Phase 3 — Langfristig

- [ ] **Community Challenges**
  Zeitlich begrenzte Gruppen-Lernziele (z. B. „30 Blöcke in 7 Tagen gemeinsam").
  _ADHS: Wettbewerb und Gemeinschaft erzeugen Dringlichkeit und Dopamin-Ausschüttung._

- [ ] **Mentor-Matching**
  Lernende mit erfahrenen Entwicklern verbinden. Matching per Technologie-Stack.
  _ADHS: Regelmäßige Mentor-Gespräche liefern externe Struktur und sofortiges Feedback._

- [ ] **Browser Extension**
  Lernblock-Reminders beim Browsen, Quick-Log direkt aus dem Browser.
  _ADHS: Kontextuelle Erinnerungen fangen Aufmerksamkeit im richtigen Moment ab._

- [ ] **Mobile App**
  React Native oder PWA-Ausbau mit nativen Push-Notifications.
  _ADHS: Lernen in Kurzpausen — Push-Notifications als Alltags-Anker._

---

## Landing Page → Branch: `claude/design-landing-page-gIlXM`

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

### QA & Deploy
- [ ] `npm run lint` — fix any TypeScript/ESLint errors across all modified files
- [ ] End-to-end check: unauthenticated `/` → landing page → CTA → `/login` → sign in → `/dashboard`; authenticated `/` → redirects to `/dashboard`; all sidebar links work
- [ ] Commit all changes with descriptive message and push to `claude/design-landing-page-gIlXM`

---

## Erledigte Aufgaben

- [x] Impressum-Seite erstellt (`/impressum`) — Platzhalter noch zu befüllen
- [x] Datenschutzerklärung erstellt (`/datenschutz`) — DSGVO-Grundstruktur vorhanden
- [x] `proxy.ts`: `/impressum` und `/datenschutz` als PUBLIC_PATHS eingetragen
- [x] Sidebar-Footer: Links zu Impressum & Datenschutz
- [x] Login-Seite: Links zu Impressum & Datenschutz unterhalb des Formulars
