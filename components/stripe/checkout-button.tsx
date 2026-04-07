"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"

interface CheckoutButtonProps {
  priceId: string
  label: string
  disabled?: boolean
  variant?: "primary" | "secondary"
}

export function CheckoutButton({
  priceId,
  label,
  disabled = false,
  variant = "primary",
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong. Please try again.")
        setLoading(false)
        return
      }
      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch {
      setError("Network error. Please try again.")
      setLoading(false)
    }
  }

  const base =
    "inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white",
    secondary: "bg-white/8 hover:bg-white/12 text-zinc-300 border border-white/10",
  }

  return (
    <div className="space-y-1.5">
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]}`}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Redirecting…" : label}
      </button>
      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
    </div>
  )
}

export function ManagePlanButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong.")
        setLoading(false)
        return
      }
      window.location.href = data.url
    } catch {
      setError("Network error. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-1.5">
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-white/8 hover:bg-white/12 text-zinc-300 border border-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Opening…" : "Manage plan"}
      </button>
      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
    </div>
  )
}

// Thin wrapper: a link that navigates to the upgrade page.
// Used from settings when the user is on Free tier.
export function UpgradeLink({ className }: { className?: string }) {
  return (
    <Link href="/settings/upgrade" className={className}>
      Upgrade to Pro
    </Link>
  )
}
