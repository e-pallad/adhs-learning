import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/user"
import { SettingsClient } from "./settings-client"
import { getDictionary, getLocale } from "@/lib/i18n"

export const metadata = { title: "Settings — Devfluent" }

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  const locale = await getLocale()
  const t = await getDictionary(locale)

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t.settings.pageTitle}</h1>
        <p className="text-sm text-zinc-400 mt-0.5">{t.settings.pageSubtitle}</p>
      </div>

      <div className="bg-[#111118] border border-white/6 rounded-2xl p-6">
        <SettingsClient
          name={user.name}
          email={user.email}
          track={user.track}
          streakFreezeUsedAt={user.streakFreezeUsedAt?.toISOString() ?? null}
          dailyGoalBlocks={user.dailyGoalBlocks}
          weeklyGoalBlocks={user.weeklyGoalBlocks}
          githubUsername={user.githubUsername ?? null}
          githubLastSyncAt={user.githubLastSyncAt?.toISOString() ?? null}
          apiKey={user.apiKey ?? null}
        />
      </div>
    </div>
  )
}
