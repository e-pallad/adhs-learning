import { getDictionary, getLocale } from "@/lib/i18n"
import { Suspense } from "react"
import { LoginForm } from "./login-form"

export const metadata = {
  title: "Sign in — Devfluent",
  description: "Sign in with a magic link to your Devfluent account.",
  robots: { index: false },
}

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const locale = await getLocale()
  const dict = await getDictionary(locale)
  const params = await searchParams
  const next = (params.next as string) || "/dashboard"
  const error = params.error as string | undefined

  return (
    <Suspense>
      <LoginForm dict={dict} next={next} error={error} />
    </Suspense>
  )
}


