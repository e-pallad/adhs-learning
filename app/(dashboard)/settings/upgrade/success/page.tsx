"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Loader2 } from "lucide-react"

export default function UpgradeSuccessPage() {
  const [status, setStatus] = useState<"loading" | "done">("loading")

  // Stripe redirects with ?session_id=... — we just show a friendly confirmation.
  // Actual tier activation happens via the webhook (checkout.session.completed).
  // Poll the user stats endpoint for up to 10 s to show "Pro active" once the
  // webhook has processed, then fall through to a generic thank-you.
  useEffect(() => {
    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      try {
        const res = await fetch("/api/user/stats")
        if (res.ok) {
          const data = await res.json()
          if (data?.user?.tier === "PRO" || data?.user?.tier === "LIFETIME") {
            setStatus("done")
            clearInterval(interval)
            return
          }
        }
      } catch {
        // ignore network errors during polling
      }
      if (attempts >= 10) {
        setStatus("done")
        clearInterval(interval)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-md mx-auto text-center space-y-6 pt-16">
      <div className="flex justify-center">
        {status === "loading" ? (
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
        ) : (
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
        )}
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">
          {status === "loading" ? "Activating your Pro plan…" : "You're all set!"}
        </h1>
        <p className="text-sm text-zinc-400">
          {status === "loading"
            ? "This only takes a moment. Hang tight."
            : "Your Pro features are now active. Enjoy focus sounds, AI coaching, and the full analytics heatmap."}
        </p>
      </div>

      {status === "done" && (
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/"
            className="inline-block px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors"
          >
            Back to dashboard
          </Link>
          <Link
            href="/training"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-4"
          >
            Start a focus session
          </Link>
        </div>
      )}
    </div>
  )
}
