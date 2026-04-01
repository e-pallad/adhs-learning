"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Zap, Mail, Eye, EyeOff, Github } from "lucide-react"

type Mode = "signin" | "signup" | "magic"

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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
        scopes: "read:user user:email",
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Devfluent</h1>
          <p className="text-sm text-gray-500 mt-1">Your ADHD-friendly dev journey</p>
        </div>

        {authError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
            Authentication failed. Please try again.
          </div>
        )}

        {message && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 mb-4">
            {message}
          </div>
        )}

        {mode === "magic" && magicSent ? (
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Check your email</p>
            <p className="text-sm text-gray-500">
              We sent a magic link to <strong className="text-gray-700">{email}</strong>.
            </p>
            <button
              onClick={() => { setMagicSent(false); setMode("signin") }}
              className="text-xs text-indigo-600 hover:underline mt-4 cursor-pointer"
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
              className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Github className="w-4 h-4" />
              Continue with GitHub
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Mode tabs */}
            {mode !== "magic" && (
              <div className="flex rounded-lg border border-gray-200 p-1 gap-1">
                <button
                  onClick={() => { setMode("signin"); setError(null) }}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${mode === "signin" ? "bg-indigo-600 text-white" : "text-gray-600 hover:text-gray-900"}`}
                >
                  Sign in
                </button>
                <button
                  onClick={() => { setMode("signup"); setError(null) }}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${mode === "signup" ? "bg-indigo-600 text-white" : "text-gray-600 hover:text-gray-900"}`}
                >
                  Sign up
                </button>
              </div>
            )}

            {/* Email/password form */}
            {mode !== "magic" && (
              <form onSubmit={handlePasswordAuth} className="space-y-3">
                <div>
                  <label htmlFor="pw-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    id="pw-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="pw-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      id="pw-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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

                <Button type="submit" loading={loading} className="w-full">
                  {mode === "signup" ? "Create account" : "Sign in"}
                </Button>
              </form>
            )}

            {/* Magic link form */}
            {mode === "magic" && (
              <form onSubmit={handleMagicLink} className="space-y-3">
                <div>
                  <label htmlFor="magic-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    id="magic-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" loading={loading} className="w-full">
                  Send magic link
                </Button>
              </form>
            )}

            {/* Toggle magic link */}
            <p className="text-xs text-center text-gray-400">
              {mode === "magic" ? (
                <>
                  <button onClick={() => { setMode("signin"); setError(null) }} className="text-indigo-600 hover:underline cursor-pointer">
                    Back to password sign in
                  </button>
                </>
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
      </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="text-xs text-gray-400 flex gap-3">
        <a href="/impressum" className="hover:text-gray-600 transition-colors">Impressum</a>
        <a href="/datenschutz" className="hover:text-gray-600 transition-colors">Datenschutz</a>
      </p>
    </div>
  )
}
