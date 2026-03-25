"use client"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold text-red-600 mb-2">Something went wrong</h2>
      <p className="text-sm text-gray-600 mb-4">
        An unexpected error occurred. Please try refreshing the page.
      </p>
      <button
        onClick={reset}
        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
      >
        Try again
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
