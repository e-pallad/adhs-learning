"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Zap, Mail, Eye, EyeOff, Github, CheckCircle2, Flame, Trophy } from "lucide-react"

type Mode = "signin" | "signup" | "magic"

const SOCIAL_PROOF = [
  { icon: Zap, color: "text-indigo-400", text: "XP & levels after every study block" },
  { icon: Flame, color: "text-orange-400", text: "Daily streaks that actually keep you going" },
  { icon: Trophy, color: "text-amber-400", text: "Achievements unlock as you hit milestones" },
  { icon: CheckCircle2, color: "text-emerald-400", text: "12-month curriculum — no guesswork" },
]

function LoginForm() {
  const [mode, setMode] = useState<Mode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [magicSent, setMagicSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const rawNext = searchParams.get("next") ?? "/dashboard"
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard"
  const authError = searchParams.get("error")

  const supabase = createClient()

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage("Check your email to confirm your account, then sign in.")
        setMode("signin")
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        window.location.href = next
      }
    }
    setLoading(false)
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setMagicSent(true)
    }
    setLoading(false)
  }

  const handleGitHub = async () => {
    setLoading(true)
    setError(null)
    window.location.href = `/api/auth/github/login?next=${encodeURIComponent(next)}`
  }

  return (
    <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-10 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 w-80 h-80 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Devfluent</span>
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight mb-3">
            Learn to code.<br />
            <span className="text-indigo-200">Actually finish.</span>
          </h2>
          <p className="text-indigo-200 text-sm leading-relaxed mb-10">
            A structured 12-month curriculum built for ADHD brains — with XP, streaks, and the dopamine loop that keeps you coming back.
          </p>

          <ul className="space-y-4">
            {SOCIAL_PROOF.map(({ icon: Icon, color, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <span className="text-sm text-indigo-100">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-indigo-300 mt-10">
          Free to start. No credit card required.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 bg-white flex flex-col justify-center p-8 sm:p-10">
        {/* Mobile-only logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">Devfluent</span>
        </div>

        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === "signup"
              ? "Start your coding journey today."
              : "Continue your dev journey."}
          </p>
        </div>

        {authError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-5">
            Authentication failed. Please try again.
          </div>
        )}

        {message && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 mb-5">
            {message}
          </div>
        )}

        {mode === "magic" && magicSent ? (
          <div className="text-center space-y-3 py-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7 text-indigo-600" />
            </div>
            <p className="font-semibold text-gray-900">Check your inbox</p>
            <p className="text-sm text-gray-500">
              We sent a magic link to <strong className="text-gray-700">{email}</strong>.
            </p>
            <button
              onClick={() => { setMagicSent(false); setMode("signin") }}
              className="text-xs text-indigo-600 hover:underline mt-2 cursor-pointer"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* GitHub */}
            <button
              onClick={handleGitHub}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Github className="w-4 h-4 shrink-0" />
              Continue with GitHub
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Mode tabs */}
            {mode !== "magic" && (
              <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1 gap-1">
                <button
                  onClick={() => { setMode("signin"); setError(null) }}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all cursor-pointer ${mode === "signin" ? "bg-white text-indigo-700 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Sign in
                </button>
                <button
                  onClick={() => { setMode("signup"); setError(null) }}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all cursor-pointer ${mode === "signup" ? "bg-white text-indigo-700 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Sign up
                </button>
              </div>
            )}

            {/* Email/password form */}
            {mode !== "magic" && (
              <form onSubmit={handlePasswordAuth} className="space-y-3">
                <div>
                  <label htmlFor="pw-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    id="pw-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  />
                </div>
                <div>
                  <label htmlFor="pw-password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      id="pw-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <Button type="submit" loading={loading} className="w-full rounded-xl">
                  {mode === "signup" ? "Create account" : "Sign in"}
                </Button>
              </form>
            )}

            {/* Magic link form */}
            {mode === "magic" && (
              <form onSubmit={handleMagicLink} className="space-y-3">
                <div>
                  <label htmlFor="magic-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    id="magic-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" loading={loading} className="w-full rounded-xl">
                  Send magic link
                </Button>
              </form>
            )}

            {/* Toggle magic link */}
            <p className="text-xs text-center text-gray-400 pt-1">
              {mode === "magic" ? (
                <button onClick={() => { setMode("signin"); setError(null) }} className="text-indigo-600 hover:underline cursor-pointer">
                  Back to password sign in
                </button>
              ) : (
                <>
                  Prefer passwordless?{" "}
                  <button onClick={() => { setMode("magic"); setError(null) }} className="text-indigo-600 hover:underline cursor-pointer">
                    Send a magic link
                  </button>
                </>
              )}
            </p>
          </div>
        )}

        <p className="text-xs text-gray-400 flex gap-3 mt-8 pt-6 border-t border-gray-100">
          <a href="/impressum" className="hover:text-gray-600 transition-colors">Impressum</a>
          <a href="/datenschutz" className="hover:text-gray-600 transition-colors">Datenschutz</a>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
