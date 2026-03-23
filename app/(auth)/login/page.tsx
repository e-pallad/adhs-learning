"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Zap, Mail } from "lucide-react"

type Mode = "signin" | "signup" | "magic"

function LoginForm() {
  const [mode, setMode] = useState<Mode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [magicSent, setMagicSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/"
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

  const handleGoogle = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
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
            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
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
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
