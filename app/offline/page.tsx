"use client"

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mx-auto">
          <span className="text-3xl">📡</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">You&apos;re offline</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No internet connection. Pages you&apos;ve visited recently are still available — go back and keep learning.
        </p>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Go back
        </button>
      </div>
    </div>
  )
}
