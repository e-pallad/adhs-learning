import Link from "next/link"
import { ArrowLeft, Check } from "lucide-react"
import { ProBadge } from "@/components/ui/pro-badge"

export const metadata = {
  title: "Upgrade to Pro — Devfluent",
  description: "Unlock focus sounds, AI coaching, accountability partner, and analytics heatmap.",
}

const FREE_FEATURES = [
  "Pomodoro timer (unlimited sessions)",
  "Full 12-month JavaScript curriculum",
  "XP & level-up system",
  "Daily + weekly streak tracking",
  "Streak freeze (auto, once per week)",
  "Roadmap progress tracker",
  "Project portfolio tracking",
  "External course tracker",
  "Basic progress stats",
  "Body-double mode",
  "VS Code extension sync",
]

const PRO_FEATURES = [
  { name: "Focus sounds", description: "White noise, brown noise, rain, and ocean — Web Audio, no files." },
  { name: "AI Coach", description: "Daily personalised suggestions based on your XP, streak, and quiz scores." },
  { name: "Accountability partner", description: "See a study buddy's weekly block progress alongside yours." },
  { name: "Analytics heatmap", description: "Full activity calendar and detailed XP breakdown over time." },
]

const FAQ = [
  {
    q: "What happens to my data if I go back to Free?",
    a: "Nothing is deleted. Your XP, streak, progress, achievements, and courses are always yours. Pro features just become read-only previews.",
  },
  {
    q: "Can I use Devfluent without Pro?",
    a: "Absolutely. The free tier is fully functional — Pomodoro timer, full curriculum, XP, streak, roadmap, and projects are all free forever.",
  },
  {
    q: "Is there a trial?",
    a: "Pro is not yet available for purchase. When it launches, there will be a way to try it risk-free.",
  },
  {
    q: "What does 'Lifetime' mean?",
    a: "A one-time payment for permanent Pro access — no recurring subscription.",
  },
]

export default function UpgradePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-16">
      {/* Back link */}
      <Link
        href="/settings"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to settings
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white">Plans</h1>
          <ProBadge />
        </div>
        <p className="text-sm text-zinc-400">
          Devfluent is free. Pro unlocks a small set of extras for power learners.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Free */}
        <div className="rounded-2xl border border-white/8 bg-[#111118] p-6 space-y-4">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">Free</p>
            <p className="text-3xl font-bold text-white">$0</p>
            <p className="text-xs text-zinc-500 mt-0.5">Forever</p>
          </div>
          <ul className="space-y-2">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <div className="pt-2">
            <span className="inline-block w-full text-center px-4 py-2.5 rounded-xl bg-white/5 text-sm font-medium text-zinc-400 border border-white/8 cursor-default">
              Your current plan
            </span>
          </div>
        </div>

        {/* Pro */}
        <div className="rounded-2xl border border-indigo-500/40 bg-indigo-500/5 p-6 space-y-4 relative">
          <div>
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1">Pro</p>
            <p className="text-3xl font-bold text-white">Coming soon</p>
            <p className="text-xs text-zinc-500 mt-0.5">Monthly &amp; lifetime options</p>
          </div>
          <p className="text-xs text-zinc-400">
            Everything in Free, plus:
          </p>
          <ul className="space-y-3">
            {PRO_FEATURES.map((f) => (
              <li key={f.name} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-zinc-200">{f.name}</p>
                  <p className="text-xs text-zinc-500">{f.description}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="pt-2">
            <a
              href="mailto:kontakt@devfluent.de?subject=Devfluent%20Pro%20%E2%80%94%20notify%20me"
              className="inline-block w-full text-center px-4 py-2.5 rounded-xl bg-indigo-600/20 text-sm font-medium text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors"
            >
              Notify me when available
            </a>
          </div>
        </div>
      </div>

      {/* Continue free CTA */}
      <div className="text-center">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-4"
        >
          Continue with Free — no action needed
        </Link>
      </div>

      {/* FAQ */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">FAQ</h2>
        <dl className="space-y-4">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="rounded-xl border border-white/6 bg-[#111118] px-5 py-4 space-y-1">
              <dt className="text-sm font-semibold text-zinc-200">{q}</dt>
              <dd className="text-sm text-zinc-400">{a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
