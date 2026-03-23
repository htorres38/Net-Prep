'use client'

import { useState, useRef } from 'react'
import { Sparkles, Loader2, ChevronUp, AlertCircle } from 'lucide-react'

interface AiExplanationProps {
  questionId: string
  question: string
  options: string[]
  userAnswer: string
  correctAnswer: string
  existingExplanation: string
  context?: string
}

export default function AiExplanation({
  questionId,
  question,
  options,
  userAnswer,
  correctAnswer,
  existingExplanation,
  context = 'quiz',
}: AiExplanationProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const cache = useRef<Record<string, string>>({})

  const handleExplain = async () => {
    if (open) {
      setOpen(false)
      return
    }
    setOpen(true)
    if (cache.current[questionId]) {
      setExplanation(cache.current[questionId])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          options,
          userAnswer,
          correctAnswer,
          existingExplanation,
          context,
        }),
      })
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()
      cache.current[questionId] = data.explanation
      setExplanation(data.explanation)
    } catch {
      setError('Could not load AI explanation. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-3">
      {!open ? (
        <button
          onClick={handleExplain}
          className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:text-violet-900 px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors border border-violet-200 bg-white"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Explain This
        </button>
      ) : (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              <span className="text-xs font-bold text-violet-700 uppercase tracking-wide">
                AI Study Coach
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-violet-400 hover:text-violet-600 transition-colors"
              aria-label="Close explanation"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-violet-600 py-1">
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              <span>Generating explanation…</span>
            </div>
          )}

          {error && !loading && (
            <div className="flex items-start gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {explanation && !loading && (
            <p className="text-sm text-violet-900 leading-relaxed whitespace-pre-line">
              {explanation}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
