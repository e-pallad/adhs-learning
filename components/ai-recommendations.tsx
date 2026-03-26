"use client"
import { useEffect, useRef, useState } from "react"

interface Recommendation {
  title: string
  description: string
  priority: "high" | "medium" | "low"
  icon: string
}

type ResponseData = { recommendations: Recommendation[] }

function fetchRecommendations(force: boolean): Promise<Recommendation[]> {
  return fetch("/api/ai/recommendations", { method: force ? "POST" : "GET" })
    .then((r) => (r.ok ? (r.json() as Promise<ResponseData>) : Promise.resolve({ recommendations: [] })))
    .then((d) => d.recommendations)
    .catch(() => [])
}

export function AiRecommendations() {
  const [recs, setRecs] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const initialFetched = useRef(false)

  useEffect(() => {
    if (initialFetched.current) return
    initialFetched.current = true
    fetchRecommendations(false)
      .then((data) => { setRecs(data) })
      .finally(() => { setLoading(false) })
  }, [])

  function handleRefresh() {
    setRefreshing(true)
    fetchRecommendations(true)
      .then((data) => { setRecs(data) })
      .finally(() => { setRefreshing(false) })
  }

  if (loading)
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    )

  if (recs.length === 0) return null

  const priorityBadge: Record<Recommendation["priority"], string> = {
    high: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    medium: "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
    low: "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400",
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">AI Coach</h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-xs text-indigo-600 hover:text-indigo-700 disabled:opacity-50 transition-colors"
        >
          {refreshing ? "Thinking..." : "Refresh"}
        </button>
      </div>
      <ul className="space-y-2">
        {recs.map((r, i) => (
          <li
            key={i}
            className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700"
          >
            <span className="text-lg leading-none mt-0.5">{r.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{r.title}</p>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-medium ${priorityBadge[r.priority]}`}
                >
                  {r.priority}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{r.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
