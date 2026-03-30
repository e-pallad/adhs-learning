"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronDown, Play, RotateCcw, CheckCircle, XCircle, Lightbulb } from "lucide-react"
import type { Exercise } from "@/content/curriculum/types"

interface TestResult {
  description: string
  passed: boolean
  error?: string
}

interface RunnerResult {
  type: "done" | "error"
  results?: TestResult[]
  message?: string
}

function buildSrcDoc(userCode: string, tests: { description: string; code: string }[]): string {
  // Escape </script> so it can't break out of the script tag inside srcDoc
  const testsJson = JSON.stringify(tests).replace(/<\/script>/gi, "<\\/script>")
  return `<!DOCTYPE html><html><body><script>
(function () {
  var tests = ${testsJson};
  try {
    eval(${JSON.stringify(userCode)});
    var results = tests.map(function (t) {
      try {
        var passed = Boolean(eval(t.code));
        return { description: t.description, passed: passed };
      } catch (e) {
        return { description: t.description, passed: false, error: e.message };
      }
    });
    window.parent.postMessage({ type: 'done', results: results }, '*');
  } catch (e) {
    window.parent.postMessage({ type: 'error', message: e.message }, '*');
  }
})();
<\/script></body></html>`
}

export function ExerciseRunner({ exercise }: { exercise: Exercise }) {
  const [code, setCode] = useState(exercise.starterCode)
  const [results, setResults] = useState<TestResult[] | null>(null)
  const [runtimeError, setRuntimeError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [showHints, setShowHints] = useState(false)
  const [srcDoc, setSrcDoc] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return
      const data = e.data as RunnerResult
      setRunning(false)
      setSrcDoc(null)
      if (data.type === "done") {
        setResults(data.results ?? [])
        setRuntimeError(null)
      } else {
        setRuntimeError(data.message ?? "Unknown error")
        setResults(null)
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])

  const handleRun = () => {
    setRunning(true)
    setResults(null)
    setRuntimeError(null)
    setSrcDoc(buildSrcDoc(code, exercise.tests))
  }

  const handleReset = () => {
    setCode(exercise.starterCode)
    setResults(null)
    setRuntimeError(null)
    setShowSolution(false)
    setRunning(false)
    setSrcDoc(null)
  }

  const passed = results !== null && results.length > 0 && results.every((r) => r.passed)

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className={cn(
        "px-4 py-3 border-b border-gray-200 dark:border-gray-700",
        passed ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-50 dark:bg-gray-800/50"
      )}>
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{exercise.title}</h4>
          {passed && <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 whitespace-pre-line">{exercise.description}</p>
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className={cn(
            "w-full font-mono text-sm p-4 resize-none bg-gray-900 text-gray-100",
            "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500",
            "min-h-[160px]"
          )}
          rows={Math.max(8, code.split("\n").length + 1)}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleRun} disabled={running}>
            <Play className="w-3 h-3 mr-1" />
            {running ? "Running…" : "Run"}
          </Button>
          <button
            onClick={handleReset}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
        <div className="flex items-center gap-2">
          {exercise.hints && exercise.hints.length > 0 && (
            <button
              onClick={() => setShowHints((v) => !v)}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <Lightbulb className="w-3 h-3" />
              {showHints ? "Hide hints" : "Show hints"}
            </button>
          )}
          <button
            onClick={() => setShowSolution((v) => !v)}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1"
          >
            <ChevronDown className={cn("w-3 h-3 transition-transform", showSolution && "rotate-180")} />
            {showSolution ? "Hide solution" : "Show solution"}
          </button>
        </div>
      </div>

      {/* Hints */}
      {showHints && exercise.hints && exercise.hints.length > 0 && (
        <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800">
          <ul className="space-y-1">
            {exercise.hints.map((hint, i) => (
              <li key={i} className="text-xs text-amber-800 dark:text-amber-300 flex gap-2">
                <span className="font-medium flex-shrink-0">{i + 1}.</span>
                <span>{hint}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Solution */}
      {showSolution && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Solution</p>
          </div>
          <pre className="font-mono text-sm p-4 bg-gray-900 text-gray-100 overflow-x-auto whitespace-pre-wrap">
            {exercise.solution}
          </pre>
        </div>
      )}

      {/* Results */}
      {runtimeError && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">Runtime error</p>
          <pre className="text-xs text-red-600 dark:text-red-300 font-mono whitespace-pre-wrap">{runtimeError}</pre>
        </div>
      )}

      {results && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 space-y-1.5">
          {results.map((r, i) => (
            <div key={i} className="flex items-start gap-2">
              {r.passed ? (
                <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <p className={cn(
                  "text-xs",
                  r.passed ? "text-green-700 dark:text-green-300" : "text-red-600 dark:text-red-400"
                )}>
                  {r.description}
                </p>
                {r.error && (
                  <p className="text-xs text-red-500 dark:text-red-400 font-mono mt-0.5">{r.error}</p>
                )}
              </div>
            </div>
          ))}
          {passed && (
            <p className="text-xs text-green-700 dark:text-green-300 font-medium pt-1">All tests pass!</p>
          )}
        </div>
      )}

      {/* Hidden sandbox iframe */}
      {srcDoc && (
        <iframe
          ref={iframeRef}
          sandbox="allow-scripts"
          srcDoc={srcDoc}
          className="hidden"
          title="exercise-sandbox"
        />
      )}
    </div>
  )
}
