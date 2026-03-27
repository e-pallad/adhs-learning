import Link from "next/link"
import { Zap, Timer, BookOpen, Bot, Github, Users } from "lucide-react"

const FEATURES = [
  {
    icon: Zap,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    title: "XP & Levels",
    desc: "Earn XP for every block completed. Level up as you progress.",
  },
  {
    icon: Timer,
    color: "text-violet-600",
    bg: "bg-violet-50",
    title: "Pomodoro Focus",
    desc: "Built-in focus timer with ambient sounds to stay in the zone.",
  },
  {
    icon: BookOpen,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "12-Month Curriculum",
    desc: "A structured path from JavaScript basics to job-ready projects.",
  },
  {
    icon: Bot,
    color: "text-green-600",
    bg: "bg-green-50",
    title: "AI Coaching",
    desc: "Personalised recommendations based on your quiz scores and pace.",
  },
  {
    icon: Github,
    color: "text-orange-600",
    bg: "bg-orange-50",
    title: "GitHub Sync",
    desc: "Earn XP for real commits and pull requests. Code counts.",
  },
  {
    icon: Users,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "Body-Double Mode",
    desc: "See how many others are studying right now. Focus together.",
  },
]

const PROBLEMS = [
  { bad: "Endless video playlists", good: "Bite-sized learning blocks" },
  { bad: "No feedback loop", good: "XP, streaks & achievements" },
  { bad: "Easy to quit alone", good: "Body-double & accountability partner" },
]

const MONTHS = [
  "JS Basics", "Functions & DOM", "Async & APIs", "Projects I",
  "Month 5", "Month 6", "Month 7", "Month 8",
  "Month 9", "Month 10", "Month 11", "Month 12",
]

export default function LandingPage() {
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
          <Link
            href="/login"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-24 px-6 text-center">
        <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-6">
          ⚡ Built for ADHD minds
        </span>
        <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Learn to code.<br />Actually finish.
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          A 12-month structured curriculum with XP, streaks, and body-double mode — designed for the way ADHD brains actually work.
        </p>
        <Link
          href="/login"
          className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-colors inline-block"
        >
          Start Learning Free
        </Link>
        <div className="mt-12 flex gap-4 justify-center flex-wrap">
          {["12-month curriculum", "XP & achievement system", "Free to use"].map((s) => (
            <span key={s} className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 shadow-sm">
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* Problem → Solution */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Traditional courses weren&apos;t built for you</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PROBLEMS.map(({ bad, good }) => (
              <div key={bad} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded mt-0.5 flex-shrink-0">❌</span>
                  <p className="text-sm text-gray-500">{bad}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-green-100 text-green-600 text-xs font-semibold px-2 py-0.5 rounded mt-0.5 flex-shrink-0">✅</span>
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
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need to stay on track</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gamification Showcase */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Progress that keeps you coming back</h2>
          <div className="bg-gray-950 rounded-2xl p-8 text-left">
            <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              Level 7
            </span>
            <p className="text-sm text-gray-400 mt-4 mb-2">2,840 / 3,000 XP to Level 8</p>
            <div className="bg-gray-800 rounded-full h-2 w-full">
              <div className="bg-indigo-500 h-2 rounded-full" style={{ width: "94%" }} />
            </div>
            <p className="text-white font-semibold mt-4">🔥 23-day streak</p>
            <span className="bg-yellow-900/30 text-yellow-400 text-xs px-3 py-1.5 rounded-lg inline-block mt-3">
              🏆 Quiz Master — 10 perfect scores
            </span>
          </div>
        </div>
      </section>

      {/* Curriculum Path Preview */}
      <section className="bg-indigo-50 py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">A clear path from beginner to job-ready</h2>
        <p className="text-gray-600 mb-10">12 structured months. No guesswork.</p>
        <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-3xl mx-auto">
          {MONTHS.map((label, i) => (
            <span
              key={i}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                i < 4
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              {i < 4 ? `Month ${i + 1}: ${label}` : label}
            </span>
          ))}
        </div>
        <Link
          href="/login"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-block"
        >
          Start with Month 1 →
        </Link>
      </section>

      {/* Final CTA */}
      <section className="bg-indigo-600 py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to start your dev journey?</h2>
        <p className="text-indigo-200 mb-8">Join developers learning with a system built for focus.</p>
        <Link
          href="/login"
          className="bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-50 transition-colors inline-block"
        >
          Create free account
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="text-white font-semibold">Devfluent</span>
            <span className="text-gray-400 text-sm ml-1">— Built for ADHD minds</span>
          </div>
          <div className="flex gap-4">
            <Link href="/impressum" className="text-gray-400 text-sm hover:text-white transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="text-gray-400 text-sm hover:text-white transition-colors">Datenschutz</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
