"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface AddCourseFormProps {
  onAdd: (data: {
    title: string
    platform: string
    url: string
    totalLessons: number
  }) => Promise<void>
}

const PLATFORMS = ["Udemy", "YouTube", "Frontend Masters", "Egghead", "Pluralsight", "Coursera", "LinkedIn Learning", "Other"]

export function AddCourseForm({ onAdd }: AddCourseFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: "",
    platform: "Udemy",
    url: "",
    totalLessons: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onAdd({
      title: form.title,
      platform: form.platform,
      url: form.url,
      totalLessons: Number(form.totalLessons) || 0,
    })
    setForm({ title: "", platform: "Udemy", url: "", totalLessons: "" })
    setOpen(false)
    setLoading(false)
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="secondary">
        + Add course
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4 bg-white dark:bg-gray-800">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Add external course</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
          <input
            required
            autoComplete="off"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="The Complete JavaScript Course"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Platform *</label>
            <select
              value={form.platform}
              onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-gray-100"
            >
              {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Total lessons</label>
            <input
              type="number"
              min="0"
              value={form.totalLessons}
              onChange={(e) => setForm((f) => ({ ...f, totalLessons: e.target.value }))}
              placeholder="120"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
          <input
            type="url"
            autoComplete="url"
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            placeholder="https://www.udemy.com/..."
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" loading={loading} size="sm">Add course (+{10} XP)</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  )
}
