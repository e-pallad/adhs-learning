"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export function BodyDoubleMode() {
  const [joined, setJoined] = useState(false)
  const [count, setCount] = useState(0)
  const [channelRef, setChannelRef] = useState<RealtimeChannel | null>(null)

  const leave = useCallback(() => {
    if (channelRef) {
      channelRef.untrack().then(() => {
        channelRef.unsubscribe()
      })
      setChannelRef(null)
    }
    setJoined(false)
    setCount(0)
  }, [channelRef])

  const join = useCallback(() => {
    const supabase = createClient()
    const channel = supabase.channel("body-double", {
      config: { presence: { key: crypto.randomUUID() } },
    })

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        setCount(Object.keys(state).length)
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() })
          setJoined(true)
        }
      })

    setChannelRef(channel)
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (channelRef) {
        channelRef.untrack().then(() => channelRef.unsubscribe())
      }
    }
  }, [channelRef])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Body-Double Mode</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Focus together with other learners — no chat, just presence.
          </p>
        </div>
        <button
          onClick={joined ? leave : join}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            joined
              ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/60"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          {joined ? "Leave" : "Join"}
        </button>
      </div>

      {joined && (
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">{count}</span>{" "}
            {count === 1 ? "person is" : "people are"} focusing right now
          </span>
        </div>
      )}
    </div>
  )
}
