import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/top-bar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { AppTour } from "@/components/tour/app-tour"
import { getCurrentUser } from "@/lib/user"
import { getXPProgress } from "@/lib/xp"
import { getLocale, getDictionary } from "@/lib/i18n"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()])
  if (!user) redirect("/login")

  const [xpProgress, t] = [getXPProgress(user.totalXP), await getDictionary(locale)]

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar locale={locale} t={t} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          totalXP={user.totalXP}
          level={xpProgress.level}
          streak={user.streak}
        />
        <main className="flex-1 p-6 overflow-auto pb-20 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav t={t} />
      <AppTour autoStart />
    </div>
  )
}
