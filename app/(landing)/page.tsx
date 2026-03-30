import type { Metadata } from "next"
import Link from "next/link"
import {
  Zap, Timer, BookOpen, Bot, Github, Users,
  XCircle, CheckCircle2, Flame, Trophy, ArrowRight, Lock, Star,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Devfluent — Learn to code. Actually finish.",
  description: "A 12-month structured curriculum with XP, streaks, and body-double mode — designed for the way ADHD brains actually work.",
  openGraph: {
    title: "Devfluent — Learn to code. Actually finish.",
    description: "A 12-month structured curriculum with XP, streaks, and body-double mode — designed for the way ADHD brains actually work.",
    type: "website",
  },
}

const FEATURES_HERO = [
  {
    icon: Zap,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    title: "XP & Levels",
    desc: "Every block you complete earns XP. Level up, unlock milestones, and watch your progress compound — the dopamine hit that keeps you coming back.",
  },
  {
    icon: Users,
    color: "text-violet-600",
    bg: "bg-violet-100",
    title: "Body-Double Mode",
    desc: "See how many other developers are studying right now. A scientifically-backed ADHD focus technique — you're never learning alone.",
  },
]

const FEATURES_GRID = [
  {
    icon: Timer,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Pomodoro Focus",
    desc: "Built-in focus timer with ambient sounds — white noise, rain, ocean — to stay in the zone.",
  },
  {
    icon: BookOpen,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
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
]

const PROBLEMS_BAD = [
  "Endless video playlists you never finish",
  "No feedback loop — progress feels invisible",
  "Easy to quit when studying alone",
  "Jump between resources constantly",
]

const PROBLEMS_GOOD = [
  "Bite-sized blocks — one at a time, always clear",
  "XP, streaks & achievements after every session",
  "Body-double mode + accountability partner",
  "One structured 12-month path, start to finish",
]

const MONTHS = [
  { n: 1,  label: "JS Basics",             free: true  },
  { n: 2,  label: "Functions & DOM",        free: true  },
  { n: 3,  label: "Async & APIs",           free: true  },
  { n: 4,  label: "Projects I",             free: false },
  { n: 5,  label: "Next.js & Full-Stack",   free: false },
  { n: 6,  label: "Databases & APIs",       free: false },
  { n: 7,  label: "Advanced React",         free: false },
  { n: 8,  label: "DevOps & Deployment",    free: false },
  { n: 9,  label: "Testing",                free: false },
  { n: 10, label: "Performance & Security", free: false },
  { n: 11, label: "Real-Time & Advanced",   free: false },
  { n: 12, label: "Capstone & Career",      free: false },
]

const TESTIMONIALS = [
  {
    quote: "Finally a platform that doesn't punish me for getting distracted. The XP system is genuinely addictive.",
    name: "Marcus T.",
    role: "Career changer, 4 months in",
  },
  {
    quote: "Body-double mode sounds gimmicky but it actually works. Knowing others are online keeps me at my desk.",
    name: "Priya S.",
    role: "Self-taught dev, Month 7",
  },
  {
    quote: "I've started 6 courses before this one. Devfluent is the first I've stuck with past week two.",
    name: "Jan K.",
    role: "Student, currently Month 5",
  },
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

      {/* Hero — 2 column */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50 py-20 lg:py-28 px-6">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-100 opacity-40 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-violet-100 opacity-40 blur-3xl" aria-hidden="true" />

        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div>
            <span className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-8">
              <Zap className="w-3.5 h-3.5" aria-hidden="true" />
              Built for ADHD minds
            </span>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
              Learn to code.<br />
              <span className="text-indigo-600">Actually finish.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
              A 12-month structured curriculum with XP, streaks, and body-double mode — designed for the way ADHD brains actually work.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                href="/login"
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                Start Learning Free
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-gray-900 transition-colors text-base font-medium px-4 py-4 inline-flex items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-lg"
              >
                See how it works ↓
              </a>
            </div>
            <div className="flex gap-8">
              <div>
                <p className="text-2xl font-bold text-indigo-600">12</p>
                <p className="text-sm text-gray-500 mt-0.5">structured months</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-indigo-600">200+</p>
                <p className="text-sm text-gray-500 mt-0.5">learning blocks</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-indigo-600">Free</p>
                <p className="text-sm text-gray-500 mt-0.5">to get started</p>
              </div>
            </div>
          </div>

          {/* Right: product mockup */}
          <div className="hidden lg:block">
            <div className="bg-gray-950 rounded-2xl p-6 shadow-2xl ring-1 ring-white/10">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 mb-5">
                <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
                <div className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
                <span className="ml-3 text-xs text-gray-500 font-mono">devfluent.de/learning</span>
              </div>

              {/* Level + XP */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">Level 7</span>
                  <span className="text-gray-400 text-xs">Full-Stack Developer</span>
                </div>
                <div className="flex items-center gap-1.5 text-orange-400">
                  <Flame className="w-4 h-4" aria-hidden="true" />
                  <span className="text-sm font-semibold text-white">23</span>
                  <span className="text-xs text-gray-500">day streak</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-1.5">2,840 / 3,000 XP to Level 8</p>
              <div className="bg-gray-800 rounded-full h-2 w-full mb-5">
                <div className="bg-indigo-500 h-2 rounded-full animate-xp-fill" />
              </div>

              {/* Current block */}
              <div className="bg-gray-900 rounded-xl p-4 mb-3 border border-gray-800">
                <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">Current block</p>
                <p className="text-white font-medium mb-1">JavaScript Closures &amp; Scope</p>
                <p className="text-gray-500 text-xs mb-3">Month 2 · Block 4 of 8</p>
                <div className="flex gap-2">
                  <span className="bg-indigo-900/60 text-indigo-300 text-xs px-2 py-1 rounded-md">+15 XP on complete</span>
                  <span className="bg-violet-900/60 text-violet-300 text-xs px-2 py-1 rounded-md">+5 XP with Pomodoro</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-1.5 bg-yellow-900/30 rounded-lg px-2.5 py-1.5">
                  <Trophy className="w-3.5 h-3.5 text-yellow-400" aria-hidden="true" />
                  <span className="text-yellow-300 text-xs font-medium">Quiz Master</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-800 rounded-lg px-2.5 py-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />
                  <span className="text-white text-xs">Week Warrior</span>
                </div>
              </div>

              {/* Body-double */}
              <div className="flex items-center gap-2 bg-indigo-900/30 rounded-lg px-3 py-2 border border-indigo-800/40">
                <div className="flex -space-x-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-5 h-5 rounded-full bg-indigo-500 ring-2 ring-gray-950 flex items-center justify-center text-[9px] text-white font-bold">
                      {["M","J","A"][i]}
                    </div>
                  ))}
                </div>
                <span className="text-indigo-300 text-xs">14 developers studying right now</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem → Solution */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Traditional courses weren&apos;t built for you</h2>
          <p className="text-center text-gray-500 mb-12">Devfluent is designed around how ADHD brains actually learn.</p>

          <div className="grid md:grid-cols-2 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            {/* Without */}
            <div className="bg-red-50 p-8 border-r border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <XCircle className="w-5 h-5 text-red-500" aria-hidden="true" />
                <p className="font-semibold text-red-700">Without Devfluent</p>
              </div>
              <ul className="space-y-4">
                {PROBLEMS_BAD.map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-red-900/70">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-red-200 shrink-0 flex items-center justify-center">
                      <span className="block w-1.5 h-0.5 bg-red-500 rounded" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* With */}
            <div className="bg-green-50 p-8">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 className="w-5 h-5 text-green-600" aria-hidden="true" />
                <p className="font-semibold text-green-700">With Devfluent</p>
              </div>
              <ul className="space-y-4">
                {PROBLEMS_GOOD.map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-green-900/80">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Everything you need to stay on track</h2>
          <p className="text-center text-gray-500 mb-12">Built around the tools that actually help ADHD learners succeed.</p>

          {/* Hero features — larger cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {FEATURES_HERO.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mb-5`}>
                  <Icon className={`w-7 h-7 ${color}`} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Supporting features — smaller grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES_GRID.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gamification Showcase */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Progress that keeps you coming back</h2>
            <p className="text-gray-500">XP, streaks, and achievements — the dopamine feedback loop that makes learning stick.</p>
          </div>
          <div className="bg-gray-950 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-5">
              <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">Level 7</span>
              <span className="text-gray-400 text-sm">Full-Stack Developer</span>
              <span className="ml-auto flex items-center gap-1.5 text-sm">
                <Flame className="w-4 h-4 text-orange-400" aria-hidden="true" />
                <span className="text-white font-semibold">23</span>
                <span className="text-gray-500">day streak</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-2">2,840 / 3,000 XP to Level 8</p>
            <div className="bg-gray-800 rounded-full h-3 w-full mb-6">
              <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-3 rounded-full animate-xp-fill" />
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
              <div className="flex items-center gap-2 bg-indigo-900/40 rounded-lg px-3 py-2">
                <Zap className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                <span className="text-indigo-300 text-sm">Speed Learner</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-indigo-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Real developers, real results</h2>
          <p className="text-center text-gray-500 mb-12">From people who finally stopped quitting.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, name, role }) => (
              <div key={name} className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {[0,1,2,3,4].map(i => (
                    <Star key={i} className="w-4 h-4 fill-indigo-500 text-indigo-500" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">&ldquo;{quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{name}</p>
                  <p className="text-xs text-gray-500">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Path Preview */}
      <section className="py-20 px-6 bg-white text-center">
        <h2 className="text-3xl font-bold mb-3">A clear path from beginner to job-ready</h2>
        <p className="text-gray-600 mb-10">12 structured months. No guesswork. First 3 months are completely free.</p>
        <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-3xl mx-auto">
          {MONTHS.map(({ n, label, free }) => (
            <span
              key={n}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium ${
                free
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 border border-gray-200 text-gray-500"
              }`}
            >
              {!free && <Lock className="w-3 h-3" aria-hidden="true" />}
              <span>Month {n}: {label}</span>
            </span>
          ))}
        </div>
        <Link
          href="/login"
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          Start with Month 1 — it&apos;s free
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-indigo-600 to-violet-600 py-24 px-6 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Ready to start your dev journey?</h2>
        <p className="text-indigo-200 mb-10 max-w-xl mx-auto text-lg">
          Join developers who stopped watching tutorials and started actually building.
        </p>
        <Link
          href="/login"
          className="bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-50 transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600"
        >
          Create free account
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </Link>
        <p className="text-indigo-300 text-sm mt-5">No credit card required · First 3 months free · Cancel anytime</p>
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
