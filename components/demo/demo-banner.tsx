import Link from "next/link"
import { getDictionary, getLocale } from "@/lib/i18n"

export async function DemoBanner() {
  const locale = await getLocale()
  const dict = await getDictionary(locale)

  return (
    <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {dict.demo.banner.text}{" "}
          <Link href="/login?next=/dashboard" className="font-semibold underline">
            {dict.demo.banner.cta}
          </Link>{" "}
          {dict.demo.banner.ctaSuffix}
        </p>
      </div>
    </div>
  )
}
