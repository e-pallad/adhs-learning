import "server-only"
import { cookies } from "next/headers"
import type { Dictionary } from "./dictionaries/en"
import { DEFAULT_LOCALE, LOCALE_COOKIE, isValidLocale, type Locale } from "./config"

export { LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE, isValidLocale } from "./config"
export type { Locale } from "./config"

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const value = cookieStore.get(LOCALE_COOKIE)?.value ?? ""
  return isValidLocale(value) ? value : DEFAULT_LOCALE
}

const dictionaries: Record<Locale, () => Promise<{ default: Dictionary }>> = {
  en: () => import("./dictionaries/en"),
  de: () => import("./dictionaries/de"),
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return (await dictionaries[locale]()).default
}
