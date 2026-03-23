'use client'

import { setLabCompletion, getLabCompletion } from '@/lib/progress'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, Lightbulb, Eye, RotateCcw, Trophy,
  ArrowUp, ArrowDown, Check, X, Star, Clock, BookOpen,
  Zap, ChevronDown, ChevronUp, Terminal, AlertCircle,
  CornerDownRight, Network,
} from 'lucide-react'
import {
  QUESTIONS, TOPO_HIGHLIGHTS,
  LAB12_META, LAB12_SCENARIO, LAB12_COMPLETION,
  type Question, type MCQuestion, type SeqQuestion, type CLIQuestion,
} from '@/data/lab12Data'

const isMC  = (q: Question): q is MCQuestion  => q.type !== 'sequencing' && q.type !== 'cli-input'
const isSeq = (q: Question): q is SeqQuestion => q.type === 'sequencing'
const isCLI = (q: Question): q is CLIQuestion => q.type === 'cli-input'

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  'multiple-choice':    { label: 'Multiple Choice',    color: 'bg-blue-100 text-blue-700' },
  'topology-reasoning': { label: 'Topology Reasoning', color: 'bg-indigo-100 text-indigo-700' },
  'troubleshooting':    { label: 'Troubleshooting',    color: 'bg-rose-100 text-rose-700' },
  'conceptual':         { label: 'Conceptual',         color: 'bg-purple-100 text-purple-700' },
  'sequencing':         { label: 'Sequencing',         color: 'bg-fuchsia-100 text-fuchsia-700' },
  'cli-input':          { label: 'CLI Input',          color: 'bg-gray-800 text-green-400' },
}

interface QState {
  selected: string | null; seqOrder: string[]; cliInput: string
  submitted: boolean; isCorrect: boolean | null; hintLevel: number; revealed: boolean
}

function makeState(q: Question): QState {
  return { selected: null, seqOrder: isSeq(q) ? [...q.shuffledItems] : [], cliInput: '', submitted: false, isCorrect: null, hintLevel: 0, revealed: false }
}

// topology
function TopologyCard({ highlightNodes }: { highlightNodes?: string[] }) {
  const hi = new Set(highlightNodes ?? [])
  const nodeClass = (name: string) =>
    hi.has(name) ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-300 scale-105 shadow-md' : ''

  const RouterNode = ({ name, ip, area }: { name: string; ip: string; area: string }) => (
    <div className={`flex flex-col items-center px-3 py-2 rounded-xl border-2 transition-all duration-300 min-w-[110px]
      ${hi.has(name) ? nodeClass(name) : 'border-blue-300 bg-blue-50'}`}>
      <span className="text-lg">🌐</span>
      <span className="text-xs font-bold text-gray-800">{name}</span>
      <span className="text-xs font-mono text-blue-600">{ip}</span>
      <span className="text-xs text-gray-400">{area}</span>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-blue-500" />
          <span className="font-semibold text-gray-800 text-sm">Network Topology</span>
        </div>
        <span className="text-xs text-gray-400">OSPF Area 0</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <RouterNode name="Router A" ip="10.1.1.1" area="Area 0" />
        <div className="flex flex-col items-center gap-0.5 my-0.5">
          <div className="w-px h-3 bg-blue-300" />
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5">OSPF Link</span>
          <div className="w-px h-3 bg-blue-300" />
        </div>
        <RouterNode name="Router B" ip="10.1.1.2 / 10.2.2.1" area="Area 0" />
        <div className="flex flex-col items-center gap-0.5 my-0.5">
          <div className="w-px h-3 bg-blue-300" />
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5">OSPF Link</span>
          <div className="w-px h-3 bg-blue-300" />
        </div>
        <RouterNode name="Router C" ip="10.2.2.2" area="Area 0" />
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">Linear topology — all in OSPF Area 0</p>
      </div>
    </div>
  )
}

// ospf ref
function OSPFReferencePanel() {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-4 text-left">
        <span className="text-sm font-semibold text-gray-800">OSPF Quick Reference</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">Adjacency States</p>
            {[
              { state: 'Down',     color: 'bg-red-50 text-red-700',     desc: 'No OSPF communication' },
              { state: 'Init',     color: 'bg-orange-50 text-orange-700', desc: 'Hello received, not yet 2-way' },
              { state: '2-Way',    color: 'bg-yellow-50 text-yellow-700', desc: 'Mutual hellos exchanged' },
              { state: 'FULL',     color: 'bg-green-50 text-green-700',  desc: 'LSDBs synchronized ✓' },
            ].map(s => (
              <div key={s.state} className={`rounded-lg px-3 py-1.5 mb-1 ${s.color} border border-current border-opacity-20`}>
                <span className="text-xs font-bold">{s.state}</span>
                <span className="text-xs opacity-80 ml-2">— {s.desc}</span>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">Cost Formula</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs font-mono text-blue-800">
              Cost = 100,000,000 / Bandwidth (bps)
            </div>
            <p className="text-xs text-gray-400 mt-1">Default reference bandwidth = 100 Mbps</p>
          </div>
        </div>
      )}
    </div>
  )
}

function ScenarioCard() {
  const [open, setOpen] = useState(true)
  return (
    <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl border border-blue-100 shadow-card overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-4 text-left">
        <div className="flex items-center gap-2"><span className="text-lg">🔍</span><span className="font-semibold text-blue-800">Mission Brief</span></div>
        {open ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-blue-500" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-sm text-blue-900">{LAB12_SCENARIO.context}</p>
          <div>
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1.5">Reports:</p>
            <ul className="space-y-1">{LAB12_SCENARIO.reports.map(r => (
              <li key={r} className="text-sm text-blue-800 flex items-start gap-2"><span className="text-red-400 mt-0.5">!</span>{r}</li>
            ))}</ul>
          </div>
          <div className="bg-white/70 rounded-xl p-3 border border-blue-100">
            <p className="text-sm text-blue-900 font-medium">{LAB12_SCENARIO.challenge}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function LabHeaderCard({ progress }: { progress: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Lab 12</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs font-medium text-gray-500 flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" />{LAB12_META.difficulty}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{LAB12_META.title}</h1>
          <div className="flex flex-wrap gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-sm text-gray-600"><Clock className="w-4 h-4 text-gray-400" />{LAB12_META.estimatedTime}</span>
            <span className="flex items-center gap-1.5 text-sm text-gray-600"><BookOpen className="w-4 h-4 text-blue-400" />{QUESTIONS.length} Questions</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0 max-w-xs">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Skills Tested</p>
          <ul className="space-y-1">{LAB12_META.skillsTested.map(s => (
            <li key={s} className="text-xs text-gray-600 flex items-start gap-1.5"><span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />{s}</li>
          ))}</ul>
        </div>
      </div>
      <div className="mt-5">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5"><span>Progress</span><span>{Math.round(progress)}%</span></div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}

function TypeBadge({ type }: { type: string }) {
  const info = TYPE_LABELS[type] ?? { label: type, color: 'bg-gray-100 text-gray-600' }
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${info.color}`}>{info.label}</span>
}

function MCOptions({ question, state, onSelect }: { question: MCQuestion; state: QState; onSelect: (k: string) => void }) {
  return (
    <div className="space-y-2.5">
      {question.options.map(opt => {
        const sel = state.selected === opt.key
        const correct = opt.key === question.correctAnswer
        let cls = 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
        if (state.submitted || state.revealed) {
          cls = correct ? 'border-green-400 bg-green-50 cursor-default' : sel ? 'border-red-300 bg-red-50 cursor-default' : 'border-gray-200 bg-gray-50 opacity-60 cursor-default'
        } else if (sel) cls = 'border-blue-400 bg-blue-50 ring-2 ring-blue-200 cursor-pointer'
        return (
          <button key={opt.key} onClick={() => !state.submitted && !state.revealed && onSelect(opt.key)} disabled={state.submitted || state.revealed}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${cls}`}>
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
              state.submitted || state.revealed ? correct ? 'bg-green-500 text-white' : sel ? 'bg-red-400 text-white' : 'bg-gray-200 text-gray-500' : sel ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{opt.key}</span>
            <span className="text-sm text-gray-800 font-medium flex-1">{opt.text}</span>
            {(state.submitted || state.revealed) && (correct ? <Check className="w-5 h-5 text-green-500 shrink-0" /> : sel ? <X className="w-5 h-5 text-red-400 shrink-0" /> : null)}
          </button>
        )
      })}
    </div>
  )
}

function SeqOptions({ question, state, onMove }: { question: SeqQuestion; state: QState; onMove: (f: number, t: number) => void }) {
  const COLORS = ['bg-blue-100 text-blue-700 border-blue-200', 'bg-sky-100 text-sky-700 border-sky-200', 'bg-indigo-100 text-indigo-700 border-indigo-200', 'bg-cyan-100 text-cyan-700 border-cyan-200']
  return (
    <div className="space-y-2">
      {state.seqOrder.map((item, idx) => {
        const correct = question.correctOrder[idx] === item
        const done = state.submitted || state.revealed
        return (
          <div key={item} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${done ? correct ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${done ? correct ? 'bg-green-500 text-white' : 'bg-red-400 text-white' : 'bg-gray-100 text-gray-600'}`}>{idx + 1}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border flex-1 ${COLORS[idx % COLORS.length]}`}>{item}</span>
            {done && !correct && <span className="text-xs text-gray-500 italic">→ {question.correctOrder[idx]}</span>}
            {!done && (
              <div className="flex flex-col gap-0.5 ml-auto shrink-0">
                <button onClick={() => idx > 0 && onMove(idx, idx - 1)} disabled={idx === 0} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5 text-gray-500" /></button>
                <button onClick={() => idx < state.seqOrder.length - 1 && onMove(idx, idx + 1)} disabled={idx === state.seqOrder.length - 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5 text-gray-500" /></button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function CLIInput({ question, state, onChange }: { question: CLIQuestion; state: QState; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { if (!state.submitted && !state.revealed) ref.current?.focus() }, [state.submitted, state.revealed])
  const ok = state.isCorrect
  const border = state.submitted || state.revealed ? ok ? 'border-green-500' : 'border-red-500' : 'border-gray-600'
  return (
    <div className={`rounded-xl overflow-hidden border-2 transition-colors ${border}`}>
      <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /><span className="w-3 h-3 rounded-full bg-yellow-400" /><span className="w-3 h-3 rounded-full bg-green-500" /></div>
        <Terminal className="w-3.5 h-3.5 text-gray-400 ml-2" />
        <span className="text-xs text-gray-400 font-mono">cli input</span>
        {(state.submitted || state.revealed) && <div className="ml-auto">{ok ? <span className="text-xs font-semibold text-green-400 flex items-center gap-1"><Check className="w-3 h-3" /> Correct</span> : <span className="text-xs font-semibold text-red-400 flex items-center gap-1"><X className="w-3 h-3" /> Incorrect</span>}</div>}
      </div>
      <div className="bg-gray-900 p-4">
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="text-green-400 shrink-0 select-none">{question.terminalPrompt}</span>
          {state.submitted || state.revealed
            ? <span className={`flex-1 ${ok ? 'text-green-300' : 'text-red-300'}`}>{state.cliInput || <span className="italic text-gray-500">no input</span>}</span>
            : <input ref={ref} type="text" value={state.cliInput} onChange={e => onChange(e.target.value)} placeholder="type your command..." className="flex-1 bg-transparent text-green-300 placeholder-gray-600 outline-none caret-green-400" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />}
        </div>
        {(state.submitted || state.revealed) && !ok && (
          <div className="mt-3 pt-3 border-t border-gray-700 flex items-center gap-2 font-mono text-sm">
            <CornerDownRight className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-400">expected:</span>
            <span className="text-yellow-300">{question.expectedAnswer}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function HintPanel({ hints, hintLevel, onNext }: { hints: string[]; hintLevel: number; onNext: () => void }) {
  if (!hintLevel) return null
  return (
    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-2">
      <div className="flex items-center gap-2 mb-1"><Lightbulb className="w-4 h-4 text-amber-500" /><span className="text-sm font-semibold text-amber-700">Hint {hintLevel} of {hints.length}</span></div>
      {hints.slice(0, hintLevel).map((h, i) => <div key={i} className={`text-sm text-amber-800 flex gap-2 ${i < hintLevel - 1 ? 'opacity-60' : ''}`}><span className="text-amber-400 shrink-0">→</span>{h}</div>)}
      {hintLevel < hints.length && <button onClick={onNext} className="text-xs font-semibold text-amber-600 hover:text-amber-700 underline underline-offset-2">Show next hint →</button>}
    </div>
  )
}

function Feedback({ isCorrect, explanation, revealed }: { isCorrect: boolean; explanation: string; revealed: boolean }) {
  if (isCorrect) return (
    <div className="rounded-xl bg-green-50 border border-green-200 p-4 celebrate-bounce">
      <div className="flex items-center gap-2 mb-2"><span className="text-xl">🎉</span><span className="font-semibold text-green-700">Nice work!</span></div>
      <p className="text-sm text-green-800 leading-relaxed">{explanation}</p>
    </div>
  )
  return (
    <div className={`rounded-xl border p-4 ${revealed ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-center gap-2 mb-2"><span className="text-xl">{revealed ? '📖' : '💡'}</span><span className={`font-semibold ${revealed ? 'text-blue-700' : 'text-red-700'}`}>{revealed ? 'Here is the answer' : 'Not quite — try again or reveal'}</span></div>
      <p className={`text-sm leading-relaxed ${revealed ? 'text-blue-800' : 'text-red-800'}`}>{explanation}</p>
    </div>
  )
}

function CompletionModal({ score, total, onRetry }: { score: number; total: number; onRetry: () => void }) {
  const pct = Math.round((score / total) * 100)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden celebrate-bounce">
        <div className="bg-gradient-to-br from-blue-500 to-sky-600 p-6 text-center">
          <div className="text-5xl mb-2">🏆</div>
          <h2 className="text-2xl font-bold text-white">Lab Complete!</h2>
          <p className="text-blue-100 text-sm mt-1">{LAB12_META.title}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-100">
              <p className="text-3xl font-bold text-blue-600">{score}/{total}</p>
              <p className="text-xs text-blue-500 font-medium mt-0.5">Correct</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
              <p className="text-3xl font-bold text-green-600">{pct}%</p>
              <p className="text-xs text-green-500 font-medium mt-0.5">Accuracy</p>
            </div>
          </div>
          <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-2"><Trophy className="w-4 h-4 text-green-600" /><span className="text-sm font-semibold text-green-700">Concept Mastered</span></div>
            <p className="text-sm font-bold text-green-800">{LAB12_COMPLETION.conceptMastered}</p>
            <ul className="mt-2 space-y-1">{LAB12_COMPLETION.masteredPoints.map(p => (
              <li key={p} className="text-xs text-green-700 flex items-start gap-1.5"><span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />{p}</li>
            ))}</ul>
          </div>
          {pct < 80 && (
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4 text-amber-600" /><span className="text-sm font-semibold text-amber-700">Review If Needed</span></div>
              <ul className="space-y-1">{LAB12_COMPLETION.reviewIfNeeded.map(l => (
                <li key={l.id} className="text-xs text-amber-800 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />Lesson {l.id}: {l.title}</li>
              ))}</ul>
            </div>
          )}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Next Suggested Lab</p>
            <p className="text-sm font-semibold text-gray-800">{LAB12_COMPLETION.nextLab.title}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onRetry} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all"><RotateCcw className="w-4 h-4" />Retry Lab</button>
            <Link href="/labs" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all">Back to Labs</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Lab12Page() {
  const total = QUESTIONS.length
  const [currentIdx, setCurrentIdx] = useState(0)
  const [qState, setQState] = useState<QState>(makeState(QUESTIONS[0]))
  const [score, setScore] = useState(0)
  const [correctSet, setCorrectSet] = useState<Set<number>>(new Set())
  const [showCompletion, setShowCompletion] = useState(false)

  const currentQ = QUESTIONS[currentIdx]
  const progress = (currentIdx / total) * 100

  const resetTo = useCallback((idx: number) => { setCurrentIdx(idx); setQState(makeState(QUESTIONS[idx])) }, [])

  const checkAnswer = useCallback(() => {
    const q = currentQ
    let correct = false
    if (isMC(q)) correct = qState.selected === q.correctAnswer
    else if (isSeq(q)) correct = JSON.stringify(qState.seqOrder) === JSON.stringify(q.correctOrder)
    else if (isCLI(q)) correct = q.acceptedAnswers.some(a => a.toLowerCase() === qState.cliInput.trim().toLowerCase())
    setQState(s => ({ ...s, submitted: true, isCorrect: correct }))
    if (correct && !correctSet.has(q.id)) { setCorrectSet(p => new Set(Array.from(p).concat(q.id))); setScore(s => s + 1) }
  }, [currentQ, qState, correctSet])

  const handleRetry = useCallback(() =>
    setQState(s => ({ ...s, submitted: false, isCorrect: null, selected: null, cliInput: '', ...(isSeq(currentQ) ? { seqOrder: [...(currentQ as SeqQuestion).shuffledItems] } : {}) }))
  , [currentQ])

  const handleReveal = useCallback(() =>
    setQState(s => ({ ...s, submitted: true, revealed: true, isCorrect: false, ...(isSeq(currentQ) ? { seqOrder: [...(currentQ as SeqQuestion).correctOrder] } : {}) }))
  , [currentQ])

  const handleContinue = useCallback(() => {
    if (currentIdx + 1 >= total) {
      setLabCompletion('lab12', score, total)
      setShowCompletion(true)
    } else {
      resetTo(currentIdx + 1)
    }
  }, [currentIdx, total, resetTo, score])

  const handleLabRetry = useCallback(() => { setScore(0); setCorrectSet(new Set()); setShowCompletion(false); resetTo(0) }, [resetTo])

  const canCheck = isMC(currentQ) ? qState.selected !== null : isSeq(currentQ) ? true : qState.cliInput.trim().length > 0
  const rawHi = TOPO_HIGHLIGHTS[currentQ.id]
  const topoHi = rawHi && (qState.isCorrect || qState.revealed) ? rawHi : []

  return (
    <div className="min-h-screen bg-gray-50">
      {showCompletion && <CompletionModal score={score} total={total} onRetry={handleLabRetry} />}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/labs" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"><ChevronLeft className="w-4 h-4" />Labs</Link>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Question {currentIdx + 1} of {total}</span>
            <div className="hidden sm:flex items-center gap-1">
              {QUESTIONS.map((q, i) => <div key={q.id} className={`w-2 h-2 rounded-full transition-all ${correctSet.has(q.id) ? 'bg-green-400' : i === currentIdx ? 'bg-blue-500 scale-125' : i < currentIdx ? 'bg-gray-300' : 'bg-gray-200'}`} />)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <LabHeaderCard progress={progress} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <ScenarioCard />
            <TopologyCard highlightNodes={topoHi.length ? topoHi : undefined} />
            <OSPFReferencePanel />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 section-enter">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <TypeBadge type={currentQ.type} />
                  {currentQ.type === 'topology-reasoning' && <span className="text-xs text-indigo-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Refer to topology</span>}
                  {currentQ.type === 'cli-input' && <span className="text-xs text-green-600 flex items-center gap-1"><Terminal className="w-3 h-3" />Type your command</span>}
                </div>
                <span className="text-sm font-semibold text-gray-400 shrink-0">Q{currentIdx + 1}/{total}</span>
              </div>
              {isMC(currentQ) && currentQ.terminalOutput && (
                <div className="mb-4 rounded-xl overflow-hidden border border-gray-700">
                  <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
                    <div className="flex gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /><span className="w-3 h-3 rounded-full bg-yellow-400" /><span className="w-3 h-3 rounded-full bg-green-500" /></div>
                    <span className="text-xs text-gray-400 font-mono ml-2">output</span>
                  </div>
                  <pre className="bg-gray-950 text-cyan-300 p-4 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre">{currentQ.terminalOutput}</pre>
                </div>
              )}
              <p className="text-lg font-semibold text-gray-900 leading-snug mb-5 whitespace-pre-line">{currentQ.prompt}</p>
              {isMC(currentQ)  && <MCOptions question={currentQ} state={qState} onSelect={k => setQState(s => ({ ...s, selected: k }))} />}
              {isSeq(currentQ) && <SeqOptions question={currentQ} state={qState} onMove={(f, t) => setQState(s => { const o = [...s.seqOrder]; [o[f], o[t]] = [o[t], o[f]]; return { ...s, seqOrder: o } })} />}
              {isCLI(currentQ) && <CLIInput question={currentQ} state={qState} onChange={v => setQState(s => ({ ...s, cliInput: v }))} />}
            </div>

            {qState.hintLevel > 0 && <HintPanel hints={currentQ.hints} hintLevel={qState.hintLevel} onNext={() => setQState(s => ({ ...s, hintLevel: Math.min(s.hintLevel + 1, currentQ.hints.length) }))} />}
            {qState.submitted && qState.isCorrect !== null && <Feedback isCorrect={qState.isCorrect} explanation={currentQ.explanation} revealed={qState.revealed} />}

            <div className="flex flex-wrap gap-3">
              {!qState.submitted && qState.hintLevel < currentQ.hints.length && (
                <button onClick={() => setQState(s => ({ ...s, hintLevel: s.hintLevel + 1 }))} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-amber-200 bg-amber-50 text-amber-700 font-semibold text-sm hover:bg-amber-100 transition-all">
                  <Lightbulb className="w-4 h-4" />{qState.hintLevel === 0 ? 'Hint' : 'Next hint'}
                </button>
              )}
              {!qState.submitted && !qState.revealed && (
                <button onClick={handleReveal} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"><Eye className="w-4 h-4" />Reveal Answer</button>
              )}
              {!qState.submitted && !qState.revealed && (
                <button onClick={checkAnswer} disabled={!canCheck} className={`ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${canCheck ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>Check Answer</button>
              )}
              {qState.submitted && qState.isCorrect === false && !qState.revealed && (
                <>
                  <button onClick={handleRetry} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"><RotateCcw className="w-4 h-4" />Try Again</button>
                  <button onClick={handleReveal} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"><Eye className="w-4 h-4" />Reveal Answer</button>
                </>
              )}
              {qState.submitted && (qState.isCorrect === true || qState.revealed) && (
                <button onClick={handleContinue} className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all">
                  {currentIdx + 1 >= total ? 'Finish Lab' : 'Continue'}<ChevronLeft className="w-4 h-4 rotate-180" />
                </button>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600">Progress</span>
                <span className="text-sm font-bold text-blue-600">{score} correct</span>
              </div>
              <div className="flex gap-1">
                {QUESTIONS.map((q, i) => <div key={q.id} title={`Q${i + 1}`} className={`flex-1 h-2.5 rounded-full transition-all ${correctSet.has(q.id) ? 'bg-green-400' : i === currentIdx ? 'bg-blue-400' : i < currentIdx ? 'bg-gray-300' : 'bg-gray-100'}`} />)}
              </div>
              <div className="flex justify-between mt-1.5"><span className="text-xs text-gray-400">Q1</span><span className="text-xs text-gray-400">Q{total}</span></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Lessons Reinforced</p>
          <div className="flex flex-wrap gap-2">
            {LAB12_META.lessonsReinforced.map(l => (
              <span key={l.id} className="text-xs font-medium text-gray-600 bg-gray-100 rounded-lg px-3 py-1.5">Lesson {l.id}: {l.title}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
