"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { QuizQuestion } from "@/content/curriculum"

interface QuizModalProps {
  blockId: string
  blockTitle: string
  questions: QuizQuestion[]
  onComplete: (result: {
    xpEarned: number
    passed: boolean
    perfect: boolean
    achievements: unknown[]
  }) => void
  onClose: () => void
}

type Phase = "answering" | "reviewing" | "completed"

const OPTION_LABELS = ["A", "B", "C", "D"] as const

const PASS_THRESHOLD = 0.7

export function QuizModal({
  blockId,
  blockTitle,
  questions,
  onComplete,
  onClose,
}: QuizModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [phase, setPhase] = useState<Phase>("answering")
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{
    xpEarned: number
    passed: boolean
    perfect: boolean
    achievements: unknown[]
  } | null>(null)

  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dialogRef.current?.focus()
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()

      // Keyboard navigation for quiz options: A/B/C/D or 1/2/3/4
      if (phase === "answering" && selectedIndex === null) {
        const keyMap: Record<string, number> = {
          "a": 0, "1": 0,
          "b": 1, "2": 1,
          "c": 2, "3": 2,
          "d": 3, "4": 3,
        }
        const option = keyMap[e.key.toLowerCase()]
        if (option !== undefined && option < currentQuestion.options?.length) {
          e.preventDefault()
          handleSelect(option)
        }
      }

      // Space or Enter to confirm selection when reviewing
      if (phase === "reviewing" && (e.key === " " || e.key === "Enter")) {
        e.preventDefault()
        handleNext()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose, phase, selectedIndex, currentQuestion, handleSelect, handleNext])

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1

  const handleSelect = (optionIndex: number) => {
    if (phase !== "answering") return
    setSelectedIndex(optionIndex)
    setPhase("reviewing")
  }

  const handleNext = async () => {
    if (selectedIndex === null) return
    if (submitting) return  // Prevent double-submission

    const updatedAnswers = [...answers, selectedIndex]
    setAnswers(updatedAnswers)

    if (!isLastQuestion) {
      setCurrentIndex((i) => i + 1)
      setSelectedIndex(null)
      setPhase("answering")
      return
    }

    // Last question — submit
    setSubmitting(true)
    const correctCount = updatedAnswers.filter(
      (ans, i) => ans === questions[i].correctIndex
    ).length
    const scoreRatio = correctCount / questions.length
    // API expects an integer 0–100
    const score = Math.round(scoreRatio * 100)

    try {
      const res = await fetch("/api/progress/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId, score, answers: updatedAnswers }),
      })

      if (res.ok) {
        const data = await res.json()
        setResult(data)
        setPhase("completed")
      } else {
        // Fallback — show local result without server XP
        setResult({
          xpEarned: 0,
          passed: scoreRatio >= PASS_THRESHOLD,
          perfect: scoreRatio === 1,
          achievements: [],
        })
        setPhase("completed")
      }
    } catch {
      setResult({
        xpEarned: 0,
        passed: scoreRatio >= PASS_THRESHOLD,
        perfect: scoreRatio === 1,
        achievements: [],
      })
      setPhase("completed")
    } finally {
      setSubmitting(false)
    }
  }

  const handleFinish = () => {
    if (result) {
      onComplete(result)
    }
    onClose()
  }

  const correctCount = answers.filter(
    (ans, i) => ans === questions[i].correctIndex
  ).length

  const isCorrect =
    phase === "reviewing" &&
    selectedIndex !== null &&
    selectedIndex === currentQuestion.correctIndex

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-modal-title"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg outline-none flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
              Quiz
            </p>
            <h2
              id="quiz-modal-title"
              className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-0.5"
            >
              {blockTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close quiz"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex-1">
          {phase !== "completed" ? (
            <>
              {/* Progress */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-500">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <div className="flex gap-1">
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1.5 w-6 rounded-full transition-colors",
                        i < currentIndex
                          ? "bg-indigo-400"
                          : i === currentIndex
                          ? "bg-indigo-600"
                          : "bg-gray-200"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Question */}
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4 leading-relaxed">
                {currentQuestion.question}
              </p>

              {/* Options */}
              <div className="space-y-2">
                {currentQuestion.options.map((option, i) => {
                  const isSelected = selectedIndex === i
                  const isCorrectOption =
                    i === currentQuestion.correctIndex
                  const showResult = phase === "reviewing"

                  let optionStyle = "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-gray-600 cursor-pointer"
                  if (showResult) {
                    if (isCorrectOption) {
                      optionStyle = "border-green-400 bg-green-50 dark:bg-green-900/30 cursor-default"
                    } else if (isSelected && !isCorrectOption) {
                      optionStyle = "border-red-400 bg-red-50 dark:bg-red-900/30 cursor-default"
                    } else {
                      optionStyle = "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 opacity-50 cursor-default"
                    }
                  } else if (isSelected) {
                    optionStyle = "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(i)}
                      disabled={phase === "reviewing"}
                      className={cn(
                        "w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all",
                        optionStyle
                      )}
                    >
                      <span
                        className={cn(
                          "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                          showResult && isCorrectOption
                            ? "bg-green-500 text-white"
                            : showResult && isSelected && !isCorrectOption
                            ? "bg-red-500 text-white"
                            : "bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                        )}
                      >
                        {OPTION_LABELS[i]}
                      </span>
                      <span className="text-sm text-gray-800 dark:text-gray-200 leading-snug pt-0.5">
                        {option}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Explanation */}
              {phase === "reviewing" && (
                <div
                  className={cn(
                    "mt-4 p-3 rounded-xl text-sm",
                    isCorrect
                      ? "bg-green-50 border border-green-200 text-green-800"
                      : "bg-red-50 border border-red-200 text-red-800"
                  )}
                >
                  <p className="font-semibold mb-1">
                    {isCorrect ? "Correct!" : "Not quite"}
                  </p>
                  <p className="text-xs leading-relaxed opacity-90">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Completed screen */
            <div className="text-center space-y-5 py-2">
              <div className="text-5xl">
                {result?.perfect ? "🏆" : result?.passed ? "🎉" : "📚"}
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {result?.perfect
                    ? "Perfect score!"
                    : result?.passed
                    ? "Quiz passed!"
                    : "Keep practising"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {correctCount} of {questions.length} correct (
                  {Math.round((correctCount / questions.length) * 100)}%)
                </p>
              </div>

              {result?.passed ? (
                <div className="space-y-2">
                  {result.xpEarned > 0 && (
                    <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 rounded-full px-4 py-2 text-sm font-bold">
                      +{result.xpEarned} XP earned
                    </div>
                  )}
                  <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <p className="text-sm text-green-800 font-medium">
                      You passed — great work!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-sm text-amber-800 font-medium">
                    You need 70% to pass. Review the material and try again.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          {phase === "reviewing" && (
            <Button
              className="w-full"
              onClick={handleNext}
              loading={submitting}
            >
              {isLastQuestion ? "See results" : "Next question"}
            </Button>
          )}
          {phase === "answering" && (
            <p className="text-center text-xs text-gray-400">
              Select an answer to continue
            </p>
          )}
          {phase === "completed" && (
            <Button className="w-full" onClick={handleFinish}>
              {result?.passed ? "Continue learning" : "Close"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
