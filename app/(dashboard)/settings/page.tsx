import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/user"
import { SettingsClient } from "./settings-client"

export const metadata = { title: "Settings — Devfluent" }

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account preferences</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <SettingsClient
          name={user.name}
          email={user.email}
          track={user.track}
          streakFreezeUsedAt={user.streakFreezeUsedAt?.toISOString() ?? null}
          dailyGoalBlocks={user.dailyGoalBlocks}
          weeklyGoalBlocks={user.weeklyGoalBlocks}
        />
      </div>
    </div>
  )
}
