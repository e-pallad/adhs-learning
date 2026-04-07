"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Loader2, Clock } from "lucide-react"

type Status = "loading" | "active" | "pending"

export default function UpgradeSuccessPage() {
  const [status, setStatus] = useState<Status>("loading")

  // Stripe redirects with ?session_id=... — actual tier activation happens via the
  // checkout.session.completed webhook. We poll /api/user/stats for up to 15 s.
  // If the webhook hasn't fired by then we show a "still processing" state rather
  // than falsely claiming Pro is active.
  useEffect(() => {
    let attempts = 0
    const MAX_ATTEMPTS = 15

    const interval = setInterval(async () => {
      attempts++
      try {
        const res = await fetch("/api/user/stats")
        if (res.ok) {
          const data = await res.json()
          if (data?.user?.tier === "PRO" || data?.user?.tier === "LIFETIME") {
            setStatus("active")
            clearInterval(interval)
            return
          }
        }
      } catch {
        // ignore transient network errors during polling
      }
      if (attempts >= MAX_ATTEMPTS) {
        // Webhook hasn't confirmed yet — show a neutral "still processing" state
        setStatus("pending")
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-md mx-auto text-center space-y-6 pt-16">
      <div className="flex justify-center">
        {status === "loading" && <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />}
        {status === "active" && <CheckCircle2 className="w-12 h-12 text-emerald-400" />}
        {status === "pending" && <Clock className="w-12 h-12 text-amber-400" />}
      </div>

      <div className="space-y-2">
        {status === "loading" && (
          <>
            <h1 className="text-2xl font-bold text-white">Activating your Pro plan…</h1>
            <p className="text-sm text-zinc-400">This only takes a moment. Hang tight.</p>
          </>
        )}
        {status === "active" && (
          <>
            <h1 className="text-2xl font-bold text-white">You&apos;re all set!</h1>
            <p className="text-sm text-zinc-400">
              Your Pro features are now active. Enjoy focus sounds, AI coaching, and the full analytics heatmap.
            </p>
          </>
        )}
        {status === "pending" && (
          <>
            <h1 className="text-2xl font-bold text-white">Payment received — still activating</h1>
            <p className="text-sm text-zinc-400">
              Your payment went through but your Pro access is still being confirmed.
              This usually completes within a minute. Refresh this page or check back shortly.
            </p>
            <p className="text-xs text-zinc-500">
              If it&apos;s still not active after a few minutes, email{" "}
              <a
                href="mailto:kontakt@devfluent.de"
                className="text-indigo-400 hover:underline"
              >
                kontakt@devfluent.de
              </a>{" "}
              and we&apos;ll sort it out.
            </p>
          </>
        )}
      </div>

      {(status === "active" || status === "pending") && (
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/"
            className="inline-block px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors"
          >
            Back to dashboard
          </Link>
          {status === "active" && (
            <Link
              href="/training"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-4"
            >
              Start a focus session
            </Link>
          )}
          {status === "pending" && (
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-4"
            >
              Refresh to check again
            </button>
          )}
        </div>
      )}
    </div>
  )
}
