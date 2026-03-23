"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface SettingsClientProps {
  name: string | null
  email: string
}

export function SettingsClient({ name: initialName, email }: SettingsClientProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [name, setName] = useState(initialName ?? "")
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
      body: JSON.stringify({ name }),
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
        <h2 className="text-sm font-semibold text-gray-900">Profile</h2>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
          <p className="text-sm text-gray-500">{email}</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Display name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <Button type="submit" size="sm" loading={saving}>
          {saved ? "Saved!" : "Save changes"}
        </Button>
        {saveError && <p className="text-xs text-red-600">{saveError}</p>}
      </form>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Sign out */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">Account</h2>
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
