'use client'

import { useState, useRef, FormEvent } from 'react'
import { Sparkles, Loader2, X, Send, AlertCircle } from 'lucide-react'

interface AiTutorProps {
  lessonTitle:  string
  slideTitle:   string
  slideContent: string
}

export default function AiTutor({ lessonTitle, slideTitle, slideContent }: AiTutorProps) {
  const [open,        setOpen]       = useState(false)
  const [question,    setQuestion]   = useState('')
  const [explanation, setExplanation] = useState<string | null>(null)
  const [loading,     setLoading]    = useState(false)
  const [error,       setError]      = useState<string | null>(null)

  const cache = useRef<Record<string, string>>({})

  async function fetchExplanation(q: string) {
    const cacheKey = q.trim()
    if (cache.current[cacheKey]) {
      setExplanation(cache.current[cacheKey])
      return
    }
    setLoading(true)
    setError(null)
    setExplanation(null)
    try {
      const res = await fetch('/api/tutor', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonTitle, slideTitle, slideContent, question: q }),
      })
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()
      cache.current[cacheKey] = data.explanation
      setExplanation(data.explanation)
    } catch {
      setError('Could not reach AI. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleOpen() {
    setOpen(true)
    if (!explanation && !loading) {
      fetchExplanation('')
    }
  }

  function handleClose() {
    setOpen(false)
    setQuestion('')
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!question.trim()) return
    fetchExplanation(question)
  }

  // collapsed

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:text-violet-900 px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors border border-violet-200 bg-white w-fit"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Ask AI about this
      </button>
    )
  }

  // expanded

  return (
    <div className="bg-violet-50 border border-violet-200 rounded-xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-violet-200">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          <span className="text-xs font-bold text-violet-700 uppercase tracking-wide">AI Study Tutor</span>
        </div>
        <button
          onClick={handleClose}
          className="text-violet-400 hover:text-violet-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Response area */}
      <div className="px-4 pt-3 pb-2 min-h-[56px]">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-violet-600 py-1">
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
            <span>Thinking…</span>
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

      {/* Question input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 pb-3">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ask a follow-up question…"
          className="flex-1 text-sm px-3 py-2 rounded-lg border border-violet-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="p-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white transition-colors flex-shrink-0"
          aria-label="Ask"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  )
}
