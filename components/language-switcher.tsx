"use client"

import { useRouter } from "next/navigation"
import { LOCALE_COOKIE, LOCALES, type Locale } from "@/lib/i18n/config"

interface LanguageSwitcherProps {
  current: Locale
  label: string
  className?: string
}

export function LanguageSwitcher({ current, label, className }: LanguageSwitcherProps) {
  const router = useRouter()

  function toggle() {
    const next: Locale = LOCALES.find((l) => l !== current) ?? "en"
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      className={className}
      aria-label={`Switch to ${label}`}
    >
      {label}
    </button>
  )
}
