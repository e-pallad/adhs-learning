import Link from "next/link"
import { getDictionary, getLocale } from "@/lib/i18n"

export default async function OfflinePage() {
  const locale = await getLocale()
  const t = await getDictionary(locale)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mx-auto">
          <span className="text-3xl">📡</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t.offline.title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t.offline.description}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {t.offline.back}
        </Link>
      </div>
    </div>
  )
}
