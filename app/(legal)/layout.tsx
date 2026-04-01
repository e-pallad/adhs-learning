import Link from "next/link"
import { Zap } from "lucide-react"
import { getLocale, getDictionary } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"

export default async function LegalLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const t = await getDictionary(locale)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">Devfluent</span>
          </Link>
          <LanguageSwitcher
            current={locale}
            label={t.locale.switchTo}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
          />
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        {children}
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex gap-4 text-sm text-gray-500">
          <Link href="/impressum" className="hover:text-gray-900 transition-colors">{t.nav.impressum}</Link>
          <Link href="/datenschutz" className="hover:text-gray-900 transition-colors">{t.nav.datenschutz}</Link>
          <Link href="/" className="hover:text-gray-900 transition-colors">{t.nav.backToApp}</Link>
        </div>
      </footer>
    </div>
  )
}
