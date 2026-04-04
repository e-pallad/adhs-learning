import type { Metadata } from "next"
import Link from "next/link"
import { Zap, Timer, BookOpen, Bot, Github, Users, Star, ArrowRight, CheckCircle2, Flame, Trophy, Code2 } from "lucide-react"
import { getLocale, getDictionary } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"

export const metadata: Metadata = {
  title: "Devfluent — Learn to code. Actually finish.",
  description: "A 12-month structured curriculum with XP, streaks, and body-double mode — designed for the way ADHD brains actually work.",
  alternates: {
    canonical: "https://devfluent.de",
  },
  openGraph: {
    title: "Devfluent — Learn to code. Actually finish.",
    description: "A 12-month structured curriculum with XP, streaks, and body-double mode — designed for the way ADHD brains actually work.",
    type: "website",
    siteName: "Devfluent",
    url: "https://devfluent.de",
  },
  twitter: {
    card: "summary_large_image",
    title: "Devfluent — Learn to code. Actually finish.",
    description: "A 12-month structured curriculum with XP, streaks, and body-double mode — designed for the way ADHD brains actually work.",
  },
}

const FEATURE_ICONS = [Zap, Timer, BookOpen, Bot, Github, Users]
const FEATURE_COLORS = [
  { color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
  { color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
]

export default async function LandingPage() {
  const locale = await getLocale()
  const t = await getDictionary(locale)
  const l = t.landing

  return (
    <div className="min-h-screen bg-[#09090f] text-zinc-100 dark">

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#09090f]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Devfluent</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher
              current={locale}
              label={t.locale.switchTo}
              className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors"
            />
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-500 transition-all duration-150 shadow-lg shadow-indigo-600/20"
            >
              {l.signIn}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-32 px-6 text-center">
        {/* Background glow blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[400px] h-[300px] bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[300px] bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
            <Code2 className="w-3.5 h-3.5" />
            {l.hero.badge}
          </span>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.05] tracking-tight">
            {l.hero.headline1}
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
              {l.hero.headline2}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {l.hero.subheadline}
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-7 py-3.5 rounded-xl text-base font-semibold hover:bg-indigo-500 transition-all duration-150 shadow-xl shadow-indigo-600/25 hover:shadow-indigo-500/35"
            >
              {l.hero.cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <form method="POST" action="/api/auth/demo" className="inline-block">
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-white/8 border border-white/10 text-zinc-200 px-7 py-3.5 rounded-xl text-base font-semibold hover:bg-white/12 hover:border-white/20 transition-all duration-150 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                Try Demo
              </button>
            </form>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex gap-3 justify-center flex-wrap">
            {l.hero.trust.map((s) => (
              <span key={s} className="flex items-center gap-1.5 text-xs text-zinc-500 bg-white/4 border border-white/8 rounded-full px-4 py-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Gamification Showcase — the "dopamine loop" preview */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">{l.gamification.headline}</h2>
            <p className="text-zinc-400">The progress system that makes you want to come back every day.</p>
          </div>

          {/* Gamification card — dark glass */}
          <div className="relative rounded-2xl border border-white/8 bg-[#111118] overflow-hidden p-8 shadow-2xl shadow-black/60">
            {/* Glow bg */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />

            <div className="relative space-y-6">
              {/* Level + XP bar */}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-full">
                  <Star className="w-3 h-3 fill-indigo-400 text-indigo-400" />
                  {l.gamification.level}
                </span>
                <span className="text-sm text-zinc-400">{l.gamification.xpLabel}</span>
              </div>

              <div className="space-y-2">
                <div className="h-3 bg-white/6 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 animate-xp-fill"
                    style={{ width: "94%", boxShadow: "0 0 12px rgba(99,102,241,0.5)" }}
                  />
                </div>
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>1,880 XP</span>
                  <span>Level 8 · 2,000 XP</span>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-orange-500/10 border border-orange-500/15 rounded-xl p-3 text-center">
                  <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">14</p>
                  <p className="text-[11px] text-zinc-500">day streak</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/15 rounded-xl p-3 text-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">87</p>
                  <p className="text-[11px] text-zinc-500">blocks done</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/15 rounded-xl p-3 text-center">
                  <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">12</p>
                  <p className="text-[11px] text-zinc-500">achievements</p>
                </div>
              </div>

              {/* Achievement unlock */}
              <div className="flex items-center gap-3 bg-amber-500/8 border border-amber-500/15 rounded-xl px-4 py-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="text-sm font-semibold text-amber-300">{l.gamification.achievement}</p>
                  <p className="text-xs text-zinc-500">+25 XP bonus unlocked</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem → Solution */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">{l.problem.headline}</h2>
            <p className="text-zinc-400">Sound familiar? Here&apos;s how Devfluent fixes it.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {l.problem.items.map(({ bad, good }) => (
              <div key={bad} className="bg-[#111118] rounded-2xl p-6 border border-white/6 space-y-4 hover:border-white/10 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                  </span>
                  <p className="text-sm text-zinc-500 leading-relaxed">{bad}</p>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </span>
                  <p className="text-sm text-zinc-200 font-medium leading-relaxed">{good}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">{l.features.headline}</h2>
            <p className="text-zinc-400">Everything you need. Nothing you don&apos;t.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {l.features.items.map(({ title, desc }, i) => {
              const Icon = FEATURE_ICONS[i]
              const { color, bg } = FEATURE_COLORS[i]
              return (
                <div key={title} className="bg-[#111118] rounded-2xl p-6 border border-white/6 hover:border-white/12 transition-all group">
                  <div className={`w-10 h-10 rounded-xl ${bg} border flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-100 mb-1.5">{title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Curriculum Path Preview */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-3">{l.curriculum.headline}</h2>
          <p className="text-zinc-400 mb-10">{l.curriculum.subheadline}</p>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {l.curriculum.months.map((label, i) => (
              <span
                key={i}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  i < 4
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-white/5 border border-white/8 text-zinc-500"
                }`}
              >
                {i < 4 ? `${l.curriculum.monthLabel} ${i + 1}: ${label}` : label}
              </span>
            ))}
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-500 transition-all duration-150 shadow-lg shadow-indigo-600/20"
          >
            {l.curriculum.cta}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">{l.testimonials.headline}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {l.testimonials.items.map(({ quote, name, role }) => (
              <div key={name} className="bg-[#111118] rounded-2xl p-6 border border-white/6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-zinc-400 mb-5 leading-relaxed">&ldquo;{quote}&rdquo;</p>
                <div className="border-t border-white/5 pt-4">
                  <p className="text-sm font-semibold text-zinc-200">{name}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-12 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/8 to-transparent" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-3">{l.cta.headline}</h2>
              <p className="text-indigo-200 mb-8 text-lg">{l.cta.subheadline}</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-white text-indigo-700 px-8 py-4 rounded-xl text-lg font-bold hover:bg-indigo-50 transition-all duration-150 shadow-xl"
              >
                {l.cta.button}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-600/20 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <span className="text-sm font-semibold text-zinc-400">Devfluent</span>
            <span className="text-zinc-700 text-sm ml-1">·</span>
            <span className="text-zinc-600 text-sm">{l.footer.tagline}</span>
          </div>
          <div className="flex gap-5">
            <Link href="/impressum" className="text-zinc-600 text-sm hover:text-zinc-300 transition-colors">{t.nav.impressum}</Link>
            <Link href="/datenschutz" className="text-zinc-600 text-sm hover:text-zinc-300 transition-colors">{t.nav.datenschutz}</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
