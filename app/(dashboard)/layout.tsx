import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/top-bar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { getCurrentUser } from "@/lib/user"
import { getXPProgress } from "@/lib/xp"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const xpProgress = getXPProgress(user.totalXP)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
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
      <MobileNav />
    </div>
  )
}
