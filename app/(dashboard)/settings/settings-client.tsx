"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useTheme } from "@/components/theme-provider"
import { Moon, Sun } from "lucide-react"

const TRACKS = [
  { id: "javascript", label: "Full-Stack JavaScript", icon: "⚡" },
  { id: "python", label: "Python Development", icon: "🐍" },
]

interface SettingsClientProps {
  name: string | null
  email: string
  track: string
  streakFreezeUsedAt: string | null
}

export function SettingsClient({ name: initialName, email, track: initialTrack, streakFreezeUsedAt }: SettingsClientProps) {
  const { theme, toggle } = useTheme()
  const freezeAvailable = !streakFreezeUsedAt ||
    Math.floor((Date.now() - new Date(streakFreezeUsedAt).getTime()) / (1000 * 60 * 60 * 24)) >= 7
  const daysUntilReset = streakFreezeUsedAt
    ? Math.max(0, 7 - Math.floor((Date.now() - new Date(streakFreezeUsedAt).getTime()) / (1000 * 60 * 60 * 24)))
    : 0
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [name, setName] = useState(initialName ?? "")
  const [track, setTrack] = useState(initialTrack)
  const [saving, setSaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, track }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      startTransition(() => router.refresh())
    } else {
      const data = await res.json().catch(() => ({}))
      setSaveError(data.error ?? "Failed to save. Please try again.")
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="space-y-8">
      {/* Profile */}
      <form onSubmit={handleSaveName} className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Profile</h2>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <p className="text-sm text-gray-500 dark:text-gray-400">{email}</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Display name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full max-w-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Learning track</label>
          <div className="flex flex-col gap-2 mt-1">
            {TRACKS.map(t => (
              <label key={t.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="track"
                  value={t.id}
                  checked={track === t.id}
                  onChange={() => setTrack(t.id)}
                  className="accent-indigo-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t.icon} {t.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <Button type="submit" size="sm" loading={saving}>
          {saved ? "Saved!" : "Save changes"}
        </Button>
        {saveError && <p className="text-xs text-red-600">{saveError}</p>}
      </form>

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-gray-700" />

      {/* Appearance */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Appearance</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Toggle between light and dark mode.</p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={toggle}
        >
          {theme === "dark" ? (
            <><Sun className="w-4 h-4 mr-2" /> Light mode</>
          ) : (
            <><Moon className="w-4 h-4 mr-2" /> Dark mode</>
          )}
        </Button>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-gray-700" />

      {/* Streak Freeze */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Streak Freeze</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Once per week, your streak is automatically preserved if you miss exactly one day.
          No action needed — it activates itself.
        </p>
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          freezeAvailable
            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
            : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
        }`}>
          {freezeAvailable ? (
            <><span>🧊</span> Freeze available</>
          ) : (
            <><span>⏳</span> Used — resets in {daysUntilReset} day{daysUntilReset !== 1 ? "s" : ""}</>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-gray-700" />

      {/* Sign out */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Account</h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleSignOut}
          loading={signingOut}
        >
          Sign out
        </Button>
      </div>
    </div>
  )
}
