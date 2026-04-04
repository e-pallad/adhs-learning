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
        className="inline-flex items-center gap-2 rounded-xl border border-white/8 px-2.5 py-1.5 text-sm text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline max-w-28 truncate">{name || "Profile"}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/8 bg-[#111118] shadow-xl shadow-black/40 p-2 z-50">
          <div className="px-2 py-1.5 border-b border-white/6 mb-1">
            <p className="text-sm font-medium text-white truncate">{name || (isDemo ? guestLabel : "User")}</p>
            {email && <p className="text-xs text-zinc-500 truncate">{email}</p>}
          </div>

          {!isDemo && (
            <Link
              href="/settings"
              className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Profile & settings
            </Link>
          )}

          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
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
