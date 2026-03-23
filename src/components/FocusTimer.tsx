'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Play, Pause, RotateCcw, Coffee, Brain, X, Minus, ChevronUp } from 'lucide-react'
import { formatTime, FOCUS_DURATIONS, BREAK_DURATIONS } from '@/lib/utils'

interface FocusTimerProps {
  onClose: () => void
  onSessionComplete?: () => void
}

type TimerMode = 'focus' | 'break'
type TimerState = 'idle' | 'running' | 'paused'

export function FocusTimer({ onClose, onSessionComplete }: FocusTimerProps) {
  const [mode, setMode] = useState<TimerMode>('focus')
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [timeRemaining, setTimeRemaining] = useState(FOCUS_DURATIONS.medium)
  const [selectedDuration, setSelectedDuration] = useState<keyof typeof FOCUS_DURATIONS>('medium')
  const [cycles, setCycles] = useState(0)
  const [minimized, setMinimized] = useState(false)

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null)

  const handleHeaderMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragStart.current = { mx: e.clientX, my: e.clientY, px: position.x, py: position.y }
    setIsDragging(true)
  }, [position])

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e: MouseEvent) => {
      if (!dragStart.current) return
      setPosition({
        x: dragStart.current.px + (e.clientX - dragStart.current.mx),
        y: dragStart.current.py + (e.clientY - dragStart.current.my),
      })
    }
    const onUp = () => { setIsDragging(false); dragStart.current = null }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
  }, [isDragging])

  const reset = useCallback(() => {
    setTimerState('idle')
    setTimeRemaining(mode === 'focus' ? FOCUS_DURATIONS[selectedDuration] : BREAK_DURATIONS.short)
  }, [mode, selectedDuration])

  const toggle = useCallback(() => {
    setTimerState(s => s === 'running' ? 'paused' : 'running')
  }, [])

  useEffect(() => {
    if (timerState !== 'running') return
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1000) {
          setTimerState('idle')
          if (mode === 'focus') {
            setCycles(c => c + 1)
            onSessionComplete?.()
            setTimeout(() => { setMode('break'); setTimeRemaining(BREAK_DURATIONS.short) }, 600)
          } else {
            setTimeout(() => { setMode('focus'); setTimeRemaining(FOCUS_DURATIONS[selectedDuration]) }, 600)
          }
          return 0
        }
        return prev - 1000
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timerState, mode, selectedDuration, onSessionComplete])

  const maxTime = mode === 'focus' ? FOCUS_DURATIONS[selectedDuration] : BREAK_DURATIONS.short
  const progress = ((maxTime - timeRemaining) / maxTime) * 100

  const isFocus = mode === 'focus'
  const accent = isFocus ? 'text-indigo-600' : 'text-emerald-600'
  const accentBar = isFocus ? 'bg-indigo-500' : 'bg-emerald-500'
  const accentBtn = isFocus ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
  const accentBgLight = isFocus ? 'bg-indigo-50' : 'bg-emerald-50'
  const accentSelected = isFocus ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
  const dotColor = isFocus ? 'bg-indigo-500' : 'bg-emerald-500'

  return (
    <div
      className="fixed z-50 select-none"
      style={{
        bottom: `${20 - position.y}px`,
        right: `${20 - position.x}px`,
        width: '13rem',
      }}
    >
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden">

        <div
          onMouseDown={handleHeaderMouseDown}
          className={`flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing border-b border-gray-100 ${accentBgLight}`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${dotColor} ${timerState === 'running' ? 'animate-pulse' : 'opacity-60'}`} />
            <span className={`text-xs font-semibold ${accent}`}>
              {isFocus ? 'Focus' : 'Break'}
              {cycles > 0 && <span className="text-gray-400 font-normal ml-1">· {cycles}×</span>}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setMinimized(v => !v)}
              className="p-1 rounded-md hover:bg-black/5 transition-colors"
              title={minimized ? 'Expand' : 'Minimize'}
            >
              {minimized
                ? <ChevronUp className="w-3 h-3 text-gray-400" />
                : <Minus className="w-3 h-3 text-gray-400" />}
            </button>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-black/5 transition-colors" title="Close timer">
              <X className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </div>

        {minimized && (
          <div className="flex items-center gap-2 px-3 py-2">
            <span className={`text-sm font-mono font-bold ${accent}`}>{formatTime(timeRemaining)}</span>
            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${accentBar} rounded-full transition-all duration-1000`} style={{ width: `${progress}%` }} />
            </div>
            <button onClick={toggle} className="flex-shrink-0">
              {timerState === 'running'
                ? <Pause className={`w-3.5 h-3.5 ${accent}`} />
                : <Play className={`w-3.5 h-3.5 ${accent}`} />}
            </button>
          </div>
        )}

        {!minimized && (
          <div className="p-3 space-y-3">
            <div className="text-center py-1">
              <div className={`text-4xl font-mono font-bold tabular-nums tracking-tight ${accent}`}>
                {formatTime(timeRemaining)}
              </div>
            </div>

            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${accentBar} rounded-full transition-all duration-1000 ease-linear`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {isFocus && timerState === 'idle' && (
              <div className="flex gap-1">
                {Object.entries(FOCUS_DURATIONS).map(([key, dur]) => (
                  <button
                    key={key}
                    onClick={() => { setSelectedDuration(key as keyof typeof FOCUS_DURATIONS); setTimeRemaining(dur) }}
                    className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      selectedDuration === key ? accentSelected : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {Math.floor(dur / 60000)}m
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-1.5">
              <button
                onClick={toggle}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-white text-xs font-bold transition-colors ${accentBtn}`}
              >
                {timerState === 'running'
                  ? <><Pause className="w-3.5 h-3.5" /> Pause</>
                  : <><Play className="w-3.5 h-3.5" /> {timerState === 'paused' ? 'Resume' : 'Start'}</>}
              </button>
              <button
                onClick={reset}
                className="px-2.5 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                title="Reset"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <button
                onClick={() => {
                  const next = mode === 'focus' ? 'break' : 'focus'
                  setMode(next)
                  setTimerState('idle')
                  setTimeRemaining(next === 'focus' ? FOCUS_DURATIONS[selectedDuration] : BREAK_DURATIONS.short)
                }}
                disabled={timerState === 'running'}
                className="px-2.5 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-40"
                title={isFocus ? 'Switch to break' : 'Switch to focus'}
              >
                {isFocus ? <Coffee className="w-3.5 h-3.5 text-gray-500" /> : <Brain className="w-3.5 h-3.5 text-gray-500" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
