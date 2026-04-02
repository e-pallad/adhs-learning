"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { User, LogOut, Settings } from "lucide-react"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"

interface TopBarUserMenuProps {
  name: string | null
  email: string | null
  isDemo?: boolean
  dict?: Dictionary
}

export function TopBarUserMenu({ name, email, isDemo = false, dict }: TopBarUserMenuProps) {
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  const handleSignOut = async () => {
    setSigningOut(true)
    if (isDemo) {
      await fetch("/api/auth/demo", { method: "DELETE" })
    } else {
      const supabase = createClient()
      await supabase.auth.signOut()
    }
    router.push("/login")
  }

  const guestLabel = dict?.demo.guestLabel || "Demo Guest"
  const leaveDemo = dict?.demo.leaveDemo || "Leave demo"
  const signoutLabel = "Sign out"

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline max-w-28 truncate">{name || "Profile"}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-2 z-50">
          <div className="px-2 py-1.5 border-b border-gray-100 dark:border-gray-700 mb-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{name || (isDemo ? guestLabel : "User")}</p>
            {email && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{email}</p>}
          </div>

          {!isDemo && (
            <Link
              href="/settings"
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Profile & settings
            </Link>
          )}

          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            <LogOut className="h-4 w-4" />
            {signingOut ? (isDemo ? "Leaving demo..." : "Signing out...") : (isDemo ? leaveDemo : signoutLabel)}
          </button>
        </div>
      )}
    </div>
  )
}
