export const LOCALES = ["en", "de"] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "en"
export const LOCALE_COOKIE = "NEXT_LOCALE"

export function isValidLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}
