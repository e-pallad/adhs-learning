"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Badge } from "@/components/ui/badge"

interface Course {
  id: string
  title: string
  platform: string
  url?: string | null
  totalLessons: number
  completedLessons: number
  isCompleted: boolean
  xpEarned: number
}

interface CourseCardProps {
  course: Course
  onUpdate?: (id: string, completedLessons: number) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export function CourseCard({ course, onUpdate, onDelete }: CourseCardProps) {
  const [editing, setEditing] = useState(false)
  const [lessons, setLessons] = useState(course.completedLessons)
  const [loading, setLoading] = useState(false)

  const progress = course.totalLessons > 0
    ? Math.round((course.completedLessons / course.totalLessons) * 100)
    : 0

  const handleSave = async () => {
    if (!onUpdate) return
    setLoading(true)
    await onUpdate(course.id, lessons)
    setEditing(false)
    setLoading(false)
  }

  return (
    <Card className={course.isCompleted ? "border-green-300" : undefined}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm">{course.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default">{course.platform}</Badge>
              {course.isCompleted && <Badge variant="success">Completed</Badge>}
              {course.xpEarned > 0 && (
                <span className="text-xs text-indigo-600">{course.xpEarned} XP earned</span>
              )}
            </div>
          </div>
          {course.url && (
            <a
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:underline flex-shrink-0"
            >
              Open →
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {course.totalLessons > 0 && (
          <div className="space-y-3">
            <ProgressBar
              value={progress}
              label={`${course.completedLessons} / ${course.totalLessons} lessons`}
              showPercentage
              color={course.isCompleted ? "green" : "indigo"}
            />

            {!course.isCompleted && !editing && (
              <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                Update progress
              </Button>
            )}

            {editing && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={lessons}
                  min={0}
                  max={course.totalLessons}
                  onChange={(e) => setLessons(Number(e.target.value))}
                  className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm"
                />
                <span className="text-sm text-gray-500">/ {course.totalLessons}</span>
                <Button size="sm" onClick={handleSave} loading={loading}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            )}
          </div>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(course.id)}
            className="text-xs text-red-400 hover:text-red-600 mt-3 block"
          >
            Remove course
          </button>
        )}
      </CardContent>
    </Card>
  )
}
