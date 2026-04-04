import Link from "next/link"
import { getDictionary, getLocale } from "@/lib/i18n"

export async function DemoBanner() {
  const locale = await getLocale()
  const dict = await getDictionary(locale)

  return (
    <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/8 px-6 py-4 shadow-lg shadow-amber-500/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="text-2xl animate-bounce">⚡</span>
          <div>
            <p className="font-semibold text-amber-300 text-base">
              {dict.demo.banner.text}
            </p>
            <p className="text-sm text-amber-400/70 mt-1">
              {dict.demo.banner.ctaSuffix}
            </p>
          </div>
        </div>
        <Link href="/login?next=/dashboard" className="flex-shrink-0 inline-block bg-amber-500 text-amber-950 font-bold px-5 py-2.5 rounded-xl hover:bg-amber-400 transition-all duration-200 hover:scale-105 transform whitespace-nowrap">
          {dict.demo.banner.cta}
        </Link>
      </div>
    </div>
  )
}
