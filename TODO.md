# Devfluent — Offene Aufgaben

> Zuletzt aktualisiert: 2026-03-25
> Aktiver Branch: `claude/add-legal-pages-todo-PdxBj`
> Zum Fortfahren: Branch auschecken, diese Datei lesen, erledigte Tasks abhaken.

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

> Aktuell ist das gesamte Curriculum statisch in `content/curriculum/index.ts` (1.541 Zeilen) hardcodiert.
> Externe Entwickler können keine Inhalte einbringen. Ziel: PR-basierter und später DB-gestützter Beitrags-Workflow.

- [ ] **Curriculum in separate JSON-Dateien pro Monat aufsplitten**
  `content/curriculum/index.ts` → `content/curriculum/month-01.json` … `month-12.json`
  Interfaces (`LearningBlock`, `QuizQuestion`, etc.) in eine separate `types.ts` auslagern.
  Loader-Funktion in `index.ts` belassen, die alle JSON-Dateien importiert und zusammenführt.
  → Externe Devs können per PR eine einzelne Monatsdatei ergänzen, ohne die gesamte TS-Datei anzufassen.

- [ ] **Prisma-Schema: `ContentBlock`-Tabelle ergänzen**
  Neue Tabelle für DB-gestützte Lerninhalte mit Feldern:
  `id`, `blockId` (stable ID), `title`, `description`, `type`, `durationMinutes`,
  `status` (`draft | review | published`), `authorId`, `source` (z. B. `"community"`, `"core"`),
  `createdAt`, `updatedAt`
  Migration via `supabase_apply_migration` MCP-Tool (kein direktes `prisma migrate` aus WSL).

- [ ] **Admin/Contributor-UI erstellen**
  Route: `app/(dashboard)/admin/content/page.tsx`
  Funktionen: Lernblock einreichen, Liste aller `draft`/`review`-Blöcke, Status ändern (publish/reject).
  Nur für Nutzer mit Admin-Flag zugänglich (User-Modell ggf. um `role`-Feld erweitern).

- [ ] **CONTRIBUTING.md schreiben**
  Erklärt externen Entwicklern:
  - JSON-Dateistruktur und Pflichtfelder
  - ID-Konvention (`m{month}w{week}-b{n}`)
  - Quiz-Format (`QuizQuestion` mit 4 Optionen, `correctIndex`, `explanation`)
  - Review-Prozess (PR → Admin-Review → published)
  - Lokales Setup zum Testen neuer Blöcke

---

## Feature-Roadmap

### Phase 1 — Kurzfristig

- [ ] **Dark Mode**
  Tailwind `dark:`-Klassen + Theme-Toggle in Settings + `localStorage`-Persistenz.
  _ADHS: Reduziert visuelle Reizüberflutung und Augenermüdung bei langen Lernsessions._

- [ ] **PWA (Progressive Web App)**
  `next-pwa` oder natives Next.js 16 App-Manifest + Service Worker.
  Home-Screen-Installation, Offline-Fallback-Seite.
  _ADHS: Eliminiert Reibung beim App-Start — kein Browser-Tab öffnen nötig._

- [ ] **Tages- und Wochenziele**
  Nutzer setzt täglich X Blöcke / Y Minuten als Ziel. Fortschrittsbalken auf Dashboard.
  DB: neue `DailyGoal`-Tabelle oder Erweiterung des `User`-Modells.
  _ADHS: Kleine, klar definierte Ziele schaffen Struktur und sofortige Erfolgserlebnisse._

- [ ] **Fokus-Sounds**
  Auswahl aus White Noise, Rain, Lo-Fi, Café — abspielbar direkt im Pomodoro-Timer.
  Entweder externe URLs (royalty-free) oder eingebetteter Audio-Player.
  _ADHS: Auditive Stimulation fördert Hyperfokus und blockiert ablenkende Umgebungsgeräusche._

- [ ] **Streak Freeze**
  1× pro Woche verwendbar. Button in Settings oder auf Dashboard.
  DB: `streakFreezeUsedAt`-Feld auf `User`, Prüfung in `updateStreak()` (`lib/user.ts`).
  _ADHS: Verhindert Alles-oder-nichts-Demotivation nach einem vergessenen Tag._

- [ ] **Body-Double-Modus**
  Geteilte anonyme Fokus-Session — Nutzer sieht Echtzeit-Zähler aktiver Lernender.
  Technisch: Supabase Realtime-Channel + anonyme Presence.
  _ADHS: Bewährte ADHS-Technik — gefühlte Anwesenheit anderer erhöht Arbeitsleistung signifikant._

---

### Phase 2 — Mittelfristig

- [ ] **GitHub Activity Sync**
  GitHub OAuth + API-Polling für Commits/PRs → automatische XP-Vergabe.
  XP-Wert für GitHub-Events in `lib/xp.ts` ergänzen.
  _ADHS: Koppelt Lernen an reale Handlungen, gibt sofortiges Feedback ohne manuellen Aufwand._

- [ ] **VS Code Extension**
  Separates Repo. Zeigt aktuellen Lernblock + Ressourcen direkt in der Sidebar an.
  Kommuniziert mit Devfluent-API via API-Key (Settings-Seite).
  _ADHS: Eliminiert den teuren Kontextwechsel zwischen Editor und Browser._

- [ ] **KI-Empfehlungen**
  Basierend auf abgeschlossenen Blöcken, Schwächen (Quiz-Scores < 70 %), Streak-Verlauf.
  Claude API (`claude-sonnet-4-6`) als Backend, Ergebnisse gecacht in DB.
  _ADHS: Verhindert Entscheidungsparalyse — klare nächste Schritte werden vorgegeben._

- [ ] **Accountability Partner**
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

## Erledigte Aufgaben

- [x] Impressum-Seite erstellt (`/impressum`) — Platzhalter noch zu befüllen
- [x] Datenschutzerklärung erstellt (`/datenschutz`) — DSGVO-Grundstruktur vorhanden
- [x] `proxy.ts`: `/impressum` und `/datenschutz` als PUBLIC_PATHS eingetragen
- [x] Sidebar-Footer: Links zu Impressum & Datenschutz
- [x] Login-Seite: Links zu Impressum & Datenschutz unterhalb des Formulars
