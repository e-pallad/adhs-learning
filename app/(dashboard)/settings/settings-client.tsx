"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useTheme } from "@/components/theme-provider"
import { CELEBRATION_ANIMATIONS_KEY } from "@/lib/preferences"
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
  dailyGoalBlocks: number
  weeklyGoalBlocks: number
  githubUsername: string | null
  githubLastSyncAt: string | null
  apiKey: string | null
}

export function SettingsClient({ name: initialName, email, track: initialTrack, streakFreezeUsedAt, dailyGoalBlocks: initialDailyGoal, weeklyGoalBlocks: initialWeeklyGoal, githubUsername: initialGithubUsername, githubLastSyncAt, apiKey: initialApiKey }: SettingsClientProps) {
  const { theme, toggle } = useTheme()
  // Capture current time once at mount — avoids calling Date.now() during render
  const [now] = useState<number>(() => Date.now())
  const daysSinceFreeze = streakFreezeUsedAt
    ? Math.floor((now - new Date(streakFreezeUsedAt).getTime()) / (1000 * 60 * 60 * 24))
    : Infinity
  const freezeAvailable = daysSinceFreeze >= 7
  const daysUntilReset = daysSinceFreeze === Infinity ? 0 : Math.max(0, 7 - daysSinceFreeze)
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [name, setName] = useState(initialName ?? "")
  const [track, setTrack] = useState(initialTrack)
  const [dailyGoal, setDailyGoal] = useState(initialDailyGoal)
  const [weeklyGoal, setWeeklyGoal] = useState(initialWeeklyGoal)
  const [saving, setSaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState(initialApiKey)
  const [generatingKey, setGeneratingKey] = useState(false)
  const [keyCopied, setKeyCopied] = useState(false)
  const [githubUsername, setGithubUsername] = useState(initialGithubUsername)
  const [syncing, setSyncing] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [syncResult, setSyncResult] = useState<{ newEvents: number; totalXPAwarded: number } | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [celebrationsEnabled, setCelebrationsEnabled] = useState(() => {
    if (typeof window === "undefined") return false
    return window.localStorage.getItem(CELEBRATION_ANIMATIONS_KEY) === "true"
  })

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, track, dailyGoalBlocks: dailyGoal, weeklyGoalBlocks: weeklyGoal }),
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

  const handleGithubSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    setSyncError(null)
    const res = await fetch("/api/github/sync", { method: "POST" })
    setSyncing(false)
    if (res.ok) {
      const data = await res.json() as { newEvents: number; totalXPAwarded: number }
      setSyncResult(data)
      startTransition(() => router.refresh())
    } else {
      const data = await res.json().catch(() => ({})) as { error?: string }
      setSyncError(data.error ?? "Sync failed. Please try again.")
    }
  }

  const handleGenerateKey = async () => {
    setGeneratingKey(true)
    const res = await fetch("/api/user/api-key", { method: "POST" })
    setGeneratingKey(false)
    if (res.ok) {
      const data = await res.json() as { apiKey: string }
      setApiKey(data.apiKey)
    }
  }

  const handleRevokeKey = async () => {
    const res = await fetch("/api/user/api-key", { method: "DELETE" })
    if (res.ok) setApiKey(null)
  }

  const handleCopyKey = () => {
    if (!apiKey) return
    navigator.clipboard.writeText(apiKey)
    setKeyCopied(true)
    setTimeout(() => setKeyCopied(false), 2000)
  }

  const handleGithubDisconnect = async () => {
    setDisconnecting(true)
    setSyncResult(null)
    setSyncError(null)
    const res = await fetch("/api/github/sync", { method: "DELETE" })
    setDisconnecting(false)
    if (res.ok) {
      setGithubUsername(null)
      startTransition(() => router.refresh())
    } else {
      setSyncError("Failed to disconnect GitHub.")
    }
  }

  const handleCelebrationToggle = () => {
    const nextValue = !celebrationsEnabled
    setCelebrationsEnabled(nextValue)
    window.localStorage.setItem(CELEBRATION_ANIMATIONS_KEY, String(nextValue))
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
            autoComplete="name"
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

        {/* Learning goals */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Daily goal</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={20}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Math.max(1, Math.min(20, Number(e.target.value))))}
              className="w-20 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-gray-100"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">blocks per day</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Weekly goal</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={100}
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(Math.max(1, Math.min(100, Number(e.target.value))))}
              className="w-20 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-gray-100"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">blocks per week</span>
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

      {/* Learning experience */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Learning experience</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Choose whether completion celebrations are shown after blocks and quizzes.</p>
        <Button
          type="button"
          variant={celebrationsEnabled ? "secondary" : "ghost"}
          size="sm"
          onClick={handleCelebrationToggle}
        >
          Celebration animations: {celebrationsEnabled ? "On" : "Off"}
        </Button>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-gray-700" />

      {/* GitHub */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">GitHub</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Connect your GitHub account to earn XP for push events and pull requests.
        </p>
        {githubUsername ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                Connected as <span className="font-semibold">@{githubUsername}</span>
              </span>
            </div>
            {githubLastSyncAt && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Last synced: {new Date(githubLastSyncAt).toLocaleString()}
              </p>
            )}
            {syncResult && (
              <p className="text-xs text-green-600 dark:text-green-400">
                Synced {syncResult.newEvents} new event{syncResult.newEvents !== 1 ? "s" : ""} — +{syncResult.totalXPAwarded} XP awarded
              </p>
            )}
            {syncError && <p className="text-xs text-red-600">{syncError}</p>}
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" loading={syncing} onClick={handleGithubSync}>
                Sync now
              </Button>
              <Button type="button" variant="secondary" size="sm" loading={disconnecting} onClick={handleGithubDisconnect}>
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <a
            href="/api/auth/github"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
            </svg>
            Connect GitHub
          </a>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-gray-700" />

      {/* API Key */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">API Key</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Use this key in the Devfluent VS Code Extension to sync your progress.
        </p>
        {apiKey ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2">
              <span className="flex-1 text-gray-700 dark:text-gray-300 truncate">{apiKey.slice(0, 8)}…</span>
              <button
                type="button"
                onClick={handleCopyKey}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors flex-shrink-0"
              >
                {keyCopied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" loading={generatingKey} onClick={handleGenerateKey}>
                Regenerate
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={handleRevokeKey}>
                Revoke
              </Button>
            </div>
          </div>
        ) : (
          <Button type="button" size="sm" loading={generatingKey} onClick={handleGenerateKey}>
            Generate API Key
          </Button>
        )}
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
