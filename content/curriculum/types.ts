export interface QuizQuestion {
  question: string
  options: string[]   // 4 options
  correctIndex: number // 0-3
  explanation: string  // why this answer is correct
}

export interface LearningBlock {
  id: string
  title: string
  description: string
  durationMinutes: number
  type: "theory" | "practice" | "project" | "review"
  resources?: { label: string; url: string }[]
  quiz?: QuizQuestion[]       // 3-5 questions per block
  practicalExample?: string   // code or practical tip (markdown)
}

export interface Week {
  week: number
  theme: string
  blocks: LearningBlock[]
}

export interface AlternativeProject {
  title: string
  description: string
}

export interface Month {
  month: number
  title: string
  description: string
  projectTitle: string
  projectDescription: string
  alternativeProjects: AlternativeProject[]
  weeks: Week[]
}

export interface TrackMeta {
  id: string
  title: string
  description: string
  language: string
  level: "beginner" | "intermediate" | "advanced"
  icon: string
}

export interface Track {
  meta: TrackMeta
  months: Month[]
}
