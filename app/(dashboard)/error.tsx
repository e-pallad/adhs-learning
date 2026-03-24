"use client"

export default function DashboardError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold text-red-600 mb-2">Dashboard error</h2>
      <pre className="bg-red-50 border border-red-200 rounded p-4 text-sm text-red-800 whitespace-pre-wrap overflow-auto">
        {error.message}
        {"\n\n"}
        {error.stack}
      </pre>
      <p className="text-xs text-gray-500 mt-2">digest: {error.digest}</p>
    </div>
  )
}
