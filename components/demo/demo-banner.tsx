import Link from "next/link"

export function DemoBanner() {
  return (
    <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Demo mode is read-only. Your progress is not saved. <Link href="/login?next=/dashboard" className="font-semibold underline">Create an account</Link> to keep your streak and XP.
        </p>
      </div>
    </div>
  )
}
