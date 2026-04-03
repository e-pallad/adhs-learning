import type { Metadata } from "next"
import Link from "next/link"
import { Zap, Timer, BookOpen, Bot, Github, Users, Star } from "lucide-react"
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
  { color: "text-indigo-600", bg: "bg-indigo-50" },
  { color: "text-violet-600", bg: "bg-violet-50" },
  { color: "text-blue-600", bg: "bg-blue-50" },
  { color: "text-green-600", bg: "bg-green-50" },
  { color: "text-orange-600", bg: "bg-orange-50" },
  { color: "text-amber-600", bg: "bg-amber-50" },
]

export default async function LandingPage() {
  const locale = await getLocale()
  const t = await getDictionary(locale)
  const l = t.landing

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Devfluent</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher
              current={locale}
              label={t.locale.switchTo}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            />
            <Link
              href="/login"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              {l.signIn}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-24 px-6 text-center">
        <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-6">
          {l.hero.badge}
        </span>
        <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {l.hero.headline1}<br />{l.hero.headline2}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          {l.hero.subheadline}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/login"
            className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-colors inline-block"
          >
            {l.hero.cta}
          </Link>
          <form method="POST" action="/api/auth/demo" className="inline-block">
            <button
              type="submit"
              className="bg-amber-400 text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-amber-300 transition-colors inline-flex items-center gap-2 hover:scale-105 transform duration-200"
            >
              <span>⚡</span>
              Try Demo
            </button>
          </form>
        </div>
        <div className="mt-12 flex gap-4 justify-center flex-wrap">
          {l.hero.trust.map((s) => (
            <span key={s} className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 shadow-sm">
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* Problem → Solution */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{l.problem.headline}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {l.problem.items.map(({ bad, good }) => (
              <div key={bad} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <span aria-hidden="true" className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded mt-0.5 flex-shrink-0">❌</span>
                  <p className="text-sm text-gray-500">{bad}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span aria-hidden="true" className="bg-green-100 text-green-600 text-xs font-semibold px-2 py-0.5 rounded mt-0.5 flex-shrink-0">✅</span>
                  <p className="text-sm font-medium text-gray-900">{good}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{l.features.headline}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {l.features.items.map(({ title, desc }, i) => {
              const Icon = FEATURE_ICONS[i]
              const { color, bg } = FEATURE_COLORS[i]
              return (
                <div key={title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                  <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Gamification Showcase */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">{l.gamification.headline}</h2>
          <div className="bg-gray-950 rounded-2xl p-8 text-left">
            <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              {l.gamification.level}
            </span>
            <p className="text-sm text-gray-400 mt-4 mb-2">{l.gamification.xpLabel}</p>
            <div className="bg-gray-800 rounded-full h-2 w-full">
              <div className="bg-indigo-500 h-2 rounded-full animate-xp-fill" style={{ width: "94%" }} />
            </div>
            <p className="text-white font-semibold mt-4">{l.gamification.streak}</p>
            <span className="bg-yellow-900/30 text-yellow-400 text-xs px-3 py-1.5 rounded-lg inline-block mt-3">
              {l.gamification.achievement}
            </span>
          </div>
        </div>
      </section>

      {/* Curriculum Path Preview */}
      <section className="bg-indigo-50 py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">{l.curriculum.headline}</h2>
        <p className="text-gray-600 mb-10">{l.curriculum.subheadline}</p>
        <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-3xl mx-auto">
          {l.curriculum.months.map((label, i) => (
            <span
              key={i}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                i < 4
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              {i < 4 ? `${l.curriculum.monthLabel} ${i + 1}: ${label}` : label}
            </span>
          ))}
        </div>
        <Link
          href="/login"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-block"
        >
          {l.curriculum.cta}
        </Link>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-indigo-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{l.testimonials.headline}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {l.testimonials.items.map(({ quote, name, role }) => (
              <div key={name} className="bg-white rounded-xl p-6 border border-indigo-100 shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">&ldquo;{quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{name}</p>
                  <p className="text-xs text-gray-400">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-indigo-600 py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">{l.cta.headline}</h2>
        <p className="text-indigo-200 mb-8">{l.cta.subheadline}</p>
        <Link
          href="/login"
          className="bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-50 transition-colors inline-block"
        >
          {l.cta.button}
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="text-white font-semibold">Devfluent</span>
            <span className="text-gray-400 text-sm ml-1">{l.footer.tagline}</span>
          </div>
          <div className="flex gap-4">
            <Link href="/impressum" className="text-gray-400 text-sm hover:text-white transition-colors">{t.nav.impressum}</Link>
            <Link href="/datenschutz" className="text-gray-400 text-sm hover:text-white transition-colors">{t.nav.datenschutz}</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
