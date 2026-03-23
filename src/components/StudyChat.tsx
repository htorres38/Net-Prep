'use client'

import { useState, useRef, useEffect, useCallback, FormEvent } from 'react'
import { Sparkles, X, Send, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

export function StudyChat() {
  const { user, isGuest, isLoading } = useAuth()
  const pathname = usePathname()

  const [open,     setOpen]     = useState(false)
  const [input,    setInput]    = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading,  setLoading]  = useState(false)

  const [position,   setPosition]   = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null)
  const didDrag   = useRef(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  // drag

  const handleHeaderMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragStart.current = { mx: e.clientX, my: e.clientY, px: position.x, py: position.y }
    setIsDragging(true)
  }, [position])

  useEffect(() => {
    if (!isDragging) return
    const BTN = 40
    const BASE = 24
    const PAD = 8
    const onMove = (e: MouseEvent) => {
      if (!dragStart.current) return
      const dx = e.clientX - dragStart.current.mx
      const dy = e.clientY - dragStart.current.my
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true
      const rawX = dragStart.current.px + dx
      const rawY = dragStart.current.py + dy
      const clampedX = Math.min(BASE - PAD, Math.max(BASE - window.innerWidth + BTN + PAD, rawX))
      const clampedY = Math.min(BASE - PAD, Math.max(BASE - window.innerHeight + BTN + PAD, rawY))
      setPosition({ x: clampedX, y: clampedY })
    }
    const onUp = () => { setIsDragging(false); dragStart.current = null }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
  }, [isDragging])

  // scroll / focus

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // guards

  if (isLoading) return null
  if (!user && !isGuest) return null
  if (pathname === '/login' || pathname === '/reset-password') return null

  // submit

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const updated: Message[] = [...messages, { role: 'user', text }]
    setMessages(updated)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: updated }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', text: data.text ?? 'Sorry, something went wrong.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Could not reach AI. Check your connection.' }])
    } finally {
      setLoading(false)
    }
  }

  // render

  return (
    <div
      className="fixed z-40 flex flex-col items-end gap-2 select-none"
      style={{ bottom: `${24 - position.y}px`, right: `${24 - position.x}px` }}
    >
      {/* Chat panel */}
      {open && (
        <div className="border border-violet-200 rounded-2xl shadow-xl overflow-hidden flex flex-col" style={{ width: '302px', height: '380px', background: 'white' }}>

          <div className="h-0.5 bg-gradient-to-r from-violet-400 via-purple-400 to-violet-300 flex-shrink-0" />

          {/* Header */}
          <div
            onMouseDown={handleHeaderMouseDown}
            className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-violet-100 via-violet-50 to-purple-50 border-b border-violet-200 cursor-grab active:cursor-grabbing flex-shrink-0"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-violet-600 flex items-center justify-center shadow-sm">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-bold text-violet-700 uppercase tracking-wide">CCNA Assistant</span>
            </div>
            <div className="flex items-center gap-1" onMouseDown={e => e.stopPropagation()}>
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="text-xs text-violet-400 hover:text-violet-600 transition-colors px-1.5 py-0.5 rounded hover:bg-violet-100"
                  title="Clear chat"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-violet-400 hover:text-violet-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5" style={{ background: 'linear-gradient(160deg, #faf5ff 0%, #ffffff 60%, #f5f3ff 100%)' }}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center pt-8 gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-gray-400 text-center leading-relaxed">Ask any CCNA question.<br/>I'm here to help.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed shadow-sm ${
                  m.role === 'user'
                    ? 'bg-gradient-to-br from-violet-600 to-purple-500 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border border-violet-100 rounded-bl-sm shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start gap-1.5 items-center px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2.5 border-t border-violet-100 flex-shrink-0" style={{ background: 'linear-gradient(to right, #faf5ff, #f5f3ff)' }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question…"
              disabled={loading}
              className="flex-1 text-sm px-3 py-2 rounded-xl border border-violet-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition shadow-sm"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 disabled:opacity-40 text-white transition-all shadow-sm flex-shrink-0"
              aria-label="Send"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Toggle button */}
      <button
        onMouseDown={e => {
          dragStart.current = { mx: e.clientX, my: e.clientY, px: position.x, py: position.y }
          didDrag.current = false
          setIsDragging(true)
        }}
        onClick={() => { if (!didDrag.current) setOpen(v => !v) }}
        aria-label={open ? 'Close assistant' : 'Open CCNA assistant'}
        className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg flex items-center justify-center transition-colors cursor-grab active:cursor-grabbing"
      >
        {open ? <X className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </button>
    </div>
  )
}
