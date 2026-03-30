"use client"

import { useState } from "react"
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react"

export default function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus("loading")
    setMessage("")

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus("success")
        setMessage(
          data.alreadyRegistered
            ? "You're already on the list — we'll be in touch!"
            : "You're on the list! We'll notify you when we launch."
        )
        setEmail("")
      } else {
        setStatus("error")
        setMessage(data.error ?? "Something went wrong. Please try again.")
      }
    } catch {
      setStatus("error")
      setMessage("Network error. Please try again.")
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-xl px-5 py-4 max-w-md mx-auto">
        <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600" aria-hidden="true" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" noValidate>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        disabled={status === "loading"}
        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
        aria-label="Email address"
      />
      <button
        type="submit"
        disabled={status === "loading" || !email.trim()}
        className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {status === "loading" ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        ) : (
          <>
            Join the waitlist
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </>
        )}
      </button>
      {status === "error" && (
        <p className="sm:col-span-2 text-red-600 text-xs mt-1" role="alert">{message}</p>
      )}
    </form>
  )
}
