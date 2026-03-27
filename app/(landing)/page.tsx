import type { Metadata } from "next"
import Link from "next/link"
import { Zap, Timer, BookOpen, Bot, Github, Users, XCircle, CheckCircle2, Flame, Trophy, ArrowRight, Lock } from "lucide-react"

export const metadata: Metadata = {
  title: "Devfluent — Learn to code. Actually finish.",
  description: "A 12-month structured curriculum with XP, streaks, and body-double mode — designed for the way ADHD brains actually work.",
  openGraph: {
    title: "Devfluent — Learn to code. Actually finish.",
    description: "A 12-month structured curriculum with XP, streaks, and body-double mode — designed for the way ADHD brains actually work.",
    type: "website",
  },
}

const FEATURES = [
  {
    icon: Zap,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    title: "XP & Levels",
    desc: "Earn XP for every block completed. Level up as you progress through the curriculum.",
  },
  {
    icon: Timer,
    color: "text-violet-600",
    bg: "bg-violet-50",
    title: "Pomodoro Focus",
    desc: "Built-in focus timer with ambient sounds — white noise, rain, ocean — to stay in the zone.",
  },
  {
    icon: BookOpen,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "12-Month Curriculum",
    desc: "A structured path from JavaScript basics to job-ready projects. No guesswork.",
  },
  {
    icon: Bot,
    color: "text-green-600",
    bg: "bg-green-50",
    title: "AI Coaching",
    desc: "Personalised next steps based on your quiz scores, weak spots, and study pace.",
  },
  {
    icon: Github,
    color: "text-orange-600",
    bg: "bg-orange-50",
    title: "GitHub Sync",
    desc: "Real commits and pull requests earn XP automatically. Your code counts.",
  },
  {
    icon: Users,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "Body-Double Mode",
    desc: "See how many others are studying right now. A proven ADHD focus technique.",
  },
]

const PROBLEMS = [
  { bad: "Endless video playlists", good: "Bite-sized learning blocks" },
  { bad: "No feedback loop", good: "XP, streaks & achievements" },
  { bad: "Easy to quit alone", good: "Body-double & accountability partner" },
]

const MONTHS = [
  { n: 1,  label: "JS Basics",                  free: true },
  { n: 2,  label: "Functions & DOM",             free: true },
  { n: 3,  label: "Async & APIs",                free: true },
  { n: 4,  label: "Projects I",                  free: false },
  { n: 5,  label: "Next.js & Full-Stack",        free: false },
  { n: 6,  label: "Databases & APIs",            free: false },
  { n: 7,  label: "Advanced React",              free: false },
  { n: 8,  label: "DevOps & Deployment",         free: false },
  { n: 9,  label: "Testing",                     free: false },
  { n: 10, label: "Performance & Security",      free: false },
  { n: 11, label: "Real-Time & Advanced",        free: false },
  { n: 12, label: "Capstone & Career",           free: false },
]

const TRUST_STATS = [
  { value: "12", label: "structured months" },
  { value: "200+", label: "learning blocks" },
  { value: "Free", label: "to get started" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="text-lg font-bold text-gray-900">Devfluent</span>
          </div>
          <Link
            href="/login"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-24 px-6 text-center">
        <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-6">
          Built for ADHD minds
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-5 leading-tight tracking-tight">
          Learn to code.<br />Actually finish.
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          A 12-month structured curriculum with XP, streaks, and body-double mode — designed for the way ADHD brains actually work.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
          <Link
            href="/login"
            className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Start Learning Free
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
          <a
            href="#features"
            className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-lg"
          >
            See how it works ↓
          </a>
        </div>
        <div className="flex gap-6 justify-center flex-wrap">
          {TRUST_STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problem → Solution */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Traditional courses weren&apos;t built for you</h2>
          <p className="text-center text-gray-500 mb-12">Devfluent is designed around how ADHD brains actually learn.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROBLEMS.map(({ bad, good }) => (
              <div key={bad} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm text-gray-500">{bad}</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" aria-hidden="true" />
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
          <h2 className="text-3xl font-bold text-center mb-3">Everything you need to stay on track</h2>
          <p className="text-center text-gray-500 mb-12">Built around the tools that actually help ADHD learners succeed.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gamification Showcase */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Progress that keeps you coming back</h2>
            <p className="text-gray-500">XP, streaks, and achievements — the dopamine feedback loop that makes learning stick.</p>
          </div>
          <div className="bg-gray-950 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                Level 7
              </span>
              <span className="text-gray-400 text-sm">Full-Stack Developer</span>
            </div>
            <p className="text-sm text-gray-400 mb-2">2,840 / 3,000 XP to Level 8</p>
            <div className="bg-gray-800 rounded-full h-2.5 w-full mb-6">
              <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: "94%" }} />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                <Flame className="w-4 h-4 text-orange-400" aria-hidden="true" />
                <span className="text-white text-sm font-medium">23-day streak</span>
              </div>
              <div className="flex items-center gap-2 bg-yellow-900/30 rounded-lg px-3 py-2">
                <Trophy className="w-4 h-4 text-yellow-400" aria-hidden="true" />
                <span className="text-yellow-300 text-sm">Quiz Master — 10 perfect scores</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Path Preview */}
      <section className="bg-indigo-50 py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-3">A clear path from beginner to job-ready</h2>
        <p className="text-gray-600 mb-10">12 structured months. No guesswork. Free for the first 3.</p>
        <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-3xl mx-auto">
          {MONTHS.map(({ n, label, free }) => (
            <span
              key={n}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium ${
                free
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-200 text-gray-500"
              }`}
            >
              {!free && <Lock className="w-3 h-3" aria-hidden="true" />}
              <span>Month {n}: {label}</span>
            </span>
          ))}
        </div>
        <Link
          href="/login"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          Start with Month 1 — it&apos;s free
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Simple, honest pricing</h2>
          <p className="text-gray-500 mb-12">Start free. Upgrade when you&apos;re ready to go deeper.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left">

            {/* Free */}
            <div className="rounded-2xl border border-gray-200 p-7 space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Free</p>
                <p className="text-4xl font-bold text-gray-900">$0</p>
                <p className="text-sm text-gray-500 mt-1">Forever free</p>
              </div>
              <ul className="space-y-2.5 text-sm">
                {[
                  "Months 1–3 of the curriculum",
                  "Full XP, streaks & achievements",
                  "Pomodoro timer & focus sounds",
                  "Body-double mode",
                  "Up to 2 external courses",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="block w-full text-center border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border-2 border-indigo-500 p-7 space-y-5 relative">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                Most popular
              </span>
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">Pro</p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-4xl font-bold text-gray-900">$9</p>
                  <p className="text-gray-500 text-sm">/month</p>
                </div>
                <p className="text-sm text-gray-500 mt-1">or $70/year — save 35%</p>
              </div>
              <ul className="space-y-2.5 text-sm">
                {[
                  "All 12 curriculum months",
                  "Unlimited external courses",
                  "GitHub activity sync & XP",
                  "AI coaching & recommendations",
                  "Accountability partner",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="block w-full text-center bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                Start free, upgrade anytime
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-indigo-600 py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to start your dev journey?</h2>
        <p className="text-indigo-200 mb-8 max-w-xl mx-auto">
          Join developers who stopped watching tutorials and started actually building.
        </p>
        <Link
          href="/login"
          className="bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-50 transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600"
        >
          Create free account
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" aria-hidden="true" />
            <span className="text-white font-semibold">Devfluent</span>
            <span className="text-gray-500 text-sm">— Built for ADHD minds</span>
          </div>
          <div className="flex gap-5">
            <Link href="/impressum" className="text-gray-400 text-sm hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 rounded">Impressum</Link>
            <Link href="/datenschutz" className="text-gray-400 text-sm hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 rounded">Datenschutz</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
