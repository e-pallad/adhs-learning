"use client"

import { LOCALE_COOKIE } from "@/lib/i18n"

function getClientLocale(): "en" | "de" {
  if (typeof document === "undefined") return "en"

  const value = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${LOCALE_COOKIE}=`))
    ?.split("=")[1]

  return value === "de" ? "de" : "en"
}

const messages = {
  en: {
    title: "Something went wrong",
    description: "An unexpected error occurred. Please try refreshing the page.",
    retry: "Try again",
  },
  de: {
    title: "Etwas ist schiefgelaufen",
    description: "Ein unerwarteter Fehler ist aufgetreten. Bitte lade die Seite neu.",
    retry: "Erneut versuchen",
  },
} as const

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = messages[getClientLocale()]

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold text-red-600 mb-2">{t.title}</h2>
      <p className="text-sm text-gray-600 mb-4">
        {t.description}
      </p>
      <button
        onClick={reset}
        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
      >
        {t.retry}
      </button>
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-4 bg-red-50 border border-red-200 rounded p-4 text-sm text-red-800 whitespace-pre-wrap overflow-auto">
          {error.message}
          {"\n\n"}
          {error.stack}
        </pre>
      )}
    </div>
  )
}
