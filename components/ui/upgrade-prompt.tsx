"use client"

import { useState } from "react"
import { X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UpgradePromptProps {
  feature: string
  onClose?: () => void
}

export function UpgradePrompt({ feature, onClose }: UpgradePromptProps) {
  const [loading, setLoading] = useState<"month" | "year" | null>(null)

  const handleUpgrade = async (interval: "month" | "year") => {
    setLoading(interval)
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interval }),
    })
    if (res.ok) {
      const { url } = await res.json() as { url: string }
      window.location.href = url
    } else {
      setLoading(null)
    }
  }

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-800 p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
            Upgrade to Pro to unlock {feature}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-900 p-4 space-y-2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Monthly</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">$9</p>
          <p className="text-xs text-gray-400">per month</p>
          <Button
            size="sm"
            className="w-full"
            loading={loading === "month"}
            disabled={!!loading}
            onClick={() => handleUpgrade("month")}
          >
            Upgrade
          </Button>
        </div>

        <div className="rounded-lg border border-indigo-400 dark:border-indigo-500 bg-white dark:bg-gray-900 p-4 space-y-2 relative">
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-xs font-medium">
            Save 35%
          </span>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Annual</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">$70</p>
          <p className="text-xs text-gray-400">per year</p>
          <Button
            size="sm"
            className="w-full"
            loading={loading === "year"}
            disabled={!!loading}
            onClick={() => handleUpgrade("year")}
          >
            Upgrade
          </Button>
        </div>
      </div>
    </div>
  )
}
