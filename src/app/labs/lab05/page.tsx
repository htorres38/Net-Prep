'use client'

import { setLabCompletion, getLabCompletion } from '@/lib/progress'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, Lightbulb, Eye, RotateCcw, Trophy,
  Check, X, Star, Clock, BookOpen,
  Zap, ChevronDown, ChevronUp, Terminal,
  AlertCircle, CornerDownRight, Table2, Shield, Hash,
} from 'lucide-react'
import {
  QUESTIONS, SUBNET_TABLE, PRIVATE_RANGES, SPECIAL_ADDRESSES, TOPO_NODES, TOPO_HIGHLIGHTS,
  LAB05_META, LAB05_SCENARIO, LAB05_COMPLETION,
  type Question, type MCQuestion, type BinaryQuestion, type CLIQuestion,
} from '@/data/lab05Data'

// types
const isMC     = (q: Question): q is MCQuestion     => q.type !== 'binary-conversion' && q.type !== 'cli-input'
const isBinary = (q: Question): q is BinaryQuestion => q.type === 'binary-conversion'
const isCLI    = (q: Question): q is CLIQuestion    => q.type === 'cli-input'

// constants
const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  'multiple-choice':    { label: 'Multiple Choice',    color: 'bg-blue-100 text-blue-700' },
  'topology-reasoning': { label: 'Topology Reasoning', color: 'bg-indigo-100 text-indigo-700' },
  'troubleshooting':    { label: 'Troubleshooting',    color: 'bg-rose-100 text-rose-700' },
  'scenario-analysis':  { label: 'Scenario Analysis',  color: 'bg-violet-100 text-violet-700' },
  'matching':           { label: 'Matching',           color: 'bg-teal-100 text-teal-700' },
  'binary-conversion':  { label: 'Binary Conversion',  color: 'bg-emerald-900 text-emerald-300' },
  'cli-input':          { label: 'CLI Input',          color: 'bg-gray-800 text-green-400' },
}

const PLACE_VALUES = [128, 64, 32, 16, 8, 4, 2, 1]

// state
interface QState {
  selected: string | null
  cliInput: string
  submitted: boolean
  isCorrect: boolean | null
  hintLevel: number
  revealed: boolean
}

function makeState(): QState {
  return {
    selected: null,
    cliInput: '',
    submitted: false,
    isCorrect: null,
    hintLevel: 0,
    revealed: false,
  }
}

// topology
function TopologyCard({ highlightNodes }: { highlightNodes?: string[] }) {
  const hi = new Set(highlightNodes ?? [])
  const nodeClass = (name: string) =>
    hi.has(name)
      ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-300 scale-105 shadow-md'
      : 'border-green-200 bg-green-50'

  const Node = ({ name, emoji, ip, label }: { name: string; emoji: string; ip?: string; label?: string }) => (
    <div className={`flex flex-col items-center px-2.5 py-2 rounded-xl border-2 transition-all duration-300 min-w-[80px] ${nodeClass(name)}`}>
      <span className="text-lg">{emoji}</span>
      <span className="text-xs font-bold text-gray-800">{name}</span>
      {ip   && <span className="text-xs font-mono text-gray-600">{ip}</span>}
      {label && <span className="text-xs text-gray-400">{label}</span>}
    </div>
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-green-600" />
          <span className="font-semibold text-gray-800 text-sm">Network Topology</span>
        </div>
        <span className="text-xs text-gray-400">192.168.1.0/24</span>
      </div>

      {/* V-shape layout */}
      <div className="flex flex-col items-center gap-0">
        {/* Top row: PC-A and PC-B */}
        <div className="flex justify-center gap-8 w-full">
          <div className="flex flex-col items-center">
            <Node name="PC-A" emoji="💻" ip="192.168.1.10" label="/24" />
          </div>
          <div className="flex flex-col items-center">
            <Node name="PC-B" emoji="🖥️" ip="192.168.1.20" label="/24" />
          </div>
        </div>

        {/* Converging lines */}
        <div className="relative w-full flex justify-center" style={{ height: '28px' }}>
          <div className="absolute" style={{ top: 0, left: '50%', transform: 'translateX(-50%)', width: '40%', height: '1px' }} />
          {/* Left arm */}
          <svg width="100%" height="28" className="absolute inset-0" style={{ overflow: 'visible' }}>
            <line x1="32%" y1="0" x2="50%" y2="100%" stroke="#d1d5db" strokeWidth="1.5" />
            <line x1="68%" y1="0" x2="50%" y2="100%" stroke="#d1d5db" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Switch */}
        <Node name="Switch" emoji="🔀" />
        <div className="w-px h-5 bg-gray-300" />

        {/* Router */}
        <Node name="Router" emoji="🌐" ip="192.168.1.1" label="Default GW" />
        <div className="w-px h-5 bg-gray-300" />

        {/* Internet */}
        <Node name="Internet" emoji="☁️" />
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-1.5 text-center">
        {[
          { label: 'Local',   color: 'bg-green-50 text-green-700',  icon: '🏠' },
          { label: 'Remote',  color: 'bg-blue-50 text-blue-700',    icon: '🌍' },
        ].map(t => (
          <div key={t.label} className={`rounded-lg px-2 py-1.5 ${t.color}`}>
            <span className="text-xs font-semibold">{t.icon} {t.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// subnet ref
function SubnetReferencePanel() {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-4 text-left">
        <div className="flex items-center gap-2">
          <Table2 className="w-4 h-4 text-green-600" />
          <span className="font-semibold text-gray-800 text-sm">Subnet Reference</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-4">
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-gray-500">CIDR</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-500">Subnet Mask</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-500">Hosts</th>
                </tr>
              </thead>
              <tbody>
                {SUBNET_TABLE.map((row, i) => (
                  <tr key={row.cidr} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 font-mono font-bold text-green-700">{row.cidr}</td>
                    <td className="px-3 py-2 font-mono text-gray-700">{row.mask}</td>
                    <td className="px-3 py-2 font-mono text-gray-500 text-right">{row.hosts.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Private ranges */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Private Ranges
            </p>
            <div className="space-y-1.5">
              {PRIVATE_RANGES.map(r => (
                <div key={r.cidr} className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
                  <p className="text-xs font-bold text-blue-700">{r.label}</p>
                  <p className="text-xs font-mono text-blue-600">{r.range}</p>
                  <p className="text-xs text-blue-500">{r.cidr}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Special addresses */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Special Addresses</p>
            <div className="space-y-1.5">
              {SPECIAL_ADDRESSES.map(addr => (
                <div key={addr.address} className={`rounded-lg border px-3 py-2 ${addr.color}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs">{addr.address}</span>
                    <span className="text-xs font-semibold">{addr.name}</span>
                  </div>
                  <p className="text-xs mt-0.5 opacity-80">{addr.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// binary viz
function BinaryVisualizer({ binaryValue, revealed }: { binaryValue: string; revealed: boolean }) {
  const bits = binaryValue.split('')
  return (
    <div className="rounded-xl bg-gray-900 border border-gray-700 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <Terminal className="w-3.5 h-3.5 text-gray-400 ml-2" />
        <span className="text-xs text-gray-400 font-mono">binary converter</span>
      </div>

      {/* Place value labels */}
      <div className="flex gap-1.5 justify-center mb-1.5">
        {PLACE_VALUES.map((v, i) => (
          <div key={i} className="w-10 text-center">
            <span className="text-xs text-gray-500 font-mono">{v}</span>
          </div>
        ))}
      </div>

      {/* Bit boxes */}
      <div className="flex gap-1.5 justify-center mb-2">
        {bits.map((bit, i) => (
          <div
            key={i}
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold font-mono border-2 transition-all ${
              bit === '1'
                ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-900/40'
                : 'bg-gray-800 border-gray-700 text-gray-500'
            }`}
          >
            {bit}
          </div>
        ))}
      </div>

      {/* Active place values */}
      <div className="flex gap-1.5 justify-center mb-3">
        {bits.map((bit, i) => (
          <div key={i} className="w-10 text-center">
            <span className={`text-xs font-mono ${bit === '1' ? 'text-emerald-400' : 'text-gray-700'}`}>
              {bit === '1' ? PLACE_VALUES[i] : '—'}
            </span>
          </div>
        ))}
      </div>

      {/* Sum line */}
      {revealed && (
        <div className="border-t border-gray-700 pt-3 text-center">
          <span className="text-xs text-gray-400 font-mono mr-2">
            {bits.map((b, i) => b === '1' ? PLACE_VALUES[i] : null).filter(Boolean).join(' + ')} =
          </span>
          <span className="text-lg font-bold text-emerald-400 font-mono">
            {bits.reduce((sum, bit, i) => sum + (bit === '1' ? PLACE_VALUES[i] : 0), 0)}
          </span>
        </div>
      )}
    </div>
  )
}

// shared ui

function ScenarioCard() {
  const [open, setOpen] = useState(true)
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 shadow-card overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-4 text-left">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔍</span>
          <span className="font-semibold text-green-800">Mission Brief</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-green-500" /> : <ChevronDown className="w-4 h-4 text-green-500" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-sm text-green-900">{LAB05_SCENARIO.context}</p>
          <div>
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1.5">Issues reported:</p>
            <ul className="space-y-1">{LAB05_SCENARIO.reports.map(r => (
              <li key={r} className="text-sm text-green-800 flex items-start gap-2">
                <span className="text-red-400 mt-0.5">!</span>{r}
              </li>
            ))}</ul>
          </div>
          <div className="bg-white/70 rounded-xl p-3 border border-green-100">
            <p className="text-sm text-green-900 font-medium">{LAB05_SCENARIO.challenge}</p>
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
            <span className="text-xs font-semibold uppercase tracking-wider text-green-600">Lab 05</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" />{LAB05_META.difficulty}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{LAB05_META.title}</h1>
          <div className="flex flex-wrap gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-sm text-gray-600"><Clock className="w-4 h-4 text-gray-400" />{LAB05_META.estimatedTime}</span>
            <span className="flex items-center gap-1.5 text-sm text-gray-600"><BookOpen className="w-4 h-4 text-green-500" />{QUESTIONS.length} Questions</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0 max-w-xs">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Skills Tested</p>
          <ul className="space-y-1">{LAB05_META.skillsTested.map(s => (
            <li key={s} className="text-xs text-gray-600 flex items-start gap-1.5">
              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />{s}
            </li>
          ))}</ul>
        </div>
      </div>
      <div className="mt-5">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Progress</span><span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}

function TypeBadge({ type }: { type: string }) {
  const info = TYPE_LABELS[type] ?? { label: type, color: 'bg-gray-100 text-gray-600' }
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${info.color}`}>{info.label}</span>
}

function MCOptions({ question, state, onSelect }: { question: MCQuestion | BinaryQuestion; state: QState; onSelect: (k: string) => void }) {
  return (
    <div className="space-y-2.5">
      {question.options.map(opt => {
        const sel = state.selected === opt.key
        const correct = opt.key === question.correctAnswer
        let cls = 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50 cursor-pointer'
        if (state.submitted || state.revealed) {
          cls = correct ? 'border-green-400 bg-green-50 cursor-default'
            : sel ? 'border-red-300 bg-red-50 cursor-default'
            : 'border-gray-200 bg-gray-50 opacity-60 cursor-default'
        } else if (sel) cls = 'border-green-400 bg-green-50 ring-2 ring-green-200 cursor-pointer'
        return (
          <button key={opt.key} onClick={() => !state.submitted && !state.revealed && onSelect(opt.key)}
            disabled={state.submitted || state.revealed}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${cls}`}>
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
              state.submitted || state.revealed
                ? correct ? 'bg-green-500 text-white' : sel ? 'bg-red-400 text-white' : 'bg-gray-200 text-gray-500'
                : sel ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{opt.key}</span>
            <span className="text-sm text-gray-800 font-medium flex-1">{opt.text}</span>
            {(state.submitted || state.revealed) && (correct ? <Check className="w-5 h-5 text-green-500 shrink-0" /> : sel ? <X className="w-5 h-5 text-red-400 shrink-0" /> : null)}
          </button>
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
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-center">
          <div className="text-5xl mb-2">🏆</div>
          <h2 className="text-2xl font-bold text-white">Lab Complete!</h2>
          <p className="text-green-100 text-sm mt-1">{LAB05_META.title}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
              <p className="text-3xl font-bold text-green-600">{score}/{total}</p>
              <p className="text-xs text-green-500 font-medium mt-0.5">Correct</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
              <p className="text-3xl font-bold text-green-600">{pct}%</p>
              <p className="text-xs text-green-500 font-medium mt-0.5">Accuracy</p>
            </div>
          </div>
          <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-2"><Trophy className="w-4 h-4 text-green-600" /><span className="text-sm font-semibold text-green-700">Concept Mastered</span></div>
            <p className="text-sm font-bold text-green-800">{LAB05_COMPLETION.conceptMastered}</p>
            <ul className="mt-2 space-y-1">{LAB05_COMPLETION.masteredPoints.map(p => (
              <li key={p} className="text-xs text-green-700 flex items-start gap-1.5"><span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />{p}</li>
            ))}</ul>
          </div>
          {pct < 80 && (
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4 text-amber-600" /><span className="text-sm font-semibold text-amber-700">Review If Needed</span></div>
              <ul className="space-y-1">{LAB05_COMPLETION.reviewIfNeeded.map(l => (
                <li key={l.id} className="text-xs text-amber-800 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />Lesson {l.id}: {l.title}</li>
              ))}</ul>
            </div>
          )}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Next Suggested Lab</p>
            <p className="text-sm font-semibold text-gray-800">{LAB05_COMPLETION.nextLab.title}</p>
            <span className="text-xs text-gray-400">Coming soon</span>
          </div>
          <div className="flex gap-3">
            <button onClick={onRetry} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all"><RotateCcw className="w-4 h-4" />Retry Lab</button>
            <Link href="/labs" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-all">Back to Labs</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// page
export default function Lab05Page() {
  const total = QUESTIONS.length
  const [currentIdx, setCurrentIdx] = useState(0)
  const [qState, setQState] = useState<QState>(makeState())
  const [score, setScore] = useState(0)
  const [correctSet, setCorrectSet] = useState<Set<number>>(new Set())
  const [showCompletion, setShowCompletion] = useState(false)

  const currentQ = QUESTIONS[currentIdx]
  const progress = (currentIdx / total) * 100

  const resetTo = useCallback((idx: number) => {
    setCurrentIdx(idx)
    setQState(makeState())
  }, [])

  const checkAnswer = useCallback(() => {
    const q = currentQ
    let correct = false
    if (isCLI(q))    correct = q.acceptedAnswers.some(a => a.toLowerCase() === qState.cliInput.trim().toLowerCase())
    else if (isMC(q) || isBinary(q)) correct = qState.selected === q.correctAnswer

    setQState(s => ({ ...s, submitted: true, isCorrect: correct }))
    if (correct && !correctSet.has(q.id)) {
      setCorrectSet(p => new Set(Array.from(p).concat(q.id)))
      setScore(s => s + 1)
    }
  }, [currentQ, qState, correctSet])

  const handleRetry = useCallback(() =>
    setQState(s => ({ ...s, submitted: false, isCorrect: null, selected: null, cliInput: '' }))
  , [])

  const handleReveal = useCallback(() =>
    setQState(s => ({ ...s, submitted: true, revealed: true, isCorrect: false }))
  , [])

  const handleContinue = useCallback(() => {
    if (currentIdx + 1 >= total) {
      setLabCompletion('lab05', score, total)
      setShowCompletion(true)
    } else {
      resetTo(currentIdx + 1)
    }
  }, [currentIdx, total, resetTo, score])

  const handleLabRetry = useCallback(() => {
    setScore(0); setCorrectSet(new Set()); setShowCompletion(false); resetTo(0)
  }, [resetTo])

  const canCheck = isCLI(currentQ) ? qState.cliInput.trim().length > 0 : qState.selected !== null

  const rawHi = TOPO_HIGHLIGHTS[currentQ.id]
  const topoHi = rawHi && (qState.isCorrect || qState.revealed) ? rawHi : []

  const isTopoQ = currentQ.type === 'topology-reasoning'
  const isBinQ  = currentQ.type === 'binary-conversion'

  return (
    <div className="min-h-screen bg-gray-50">
      {showCompletion && <CompletionModal score={score} total={total} onRetry={handleLabRetry} />}

      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/labs" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"><ChevronLeft className="w-4 h-4" />Labs</Link>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Question {currentIdx + 1} of {total}</span>
            <div className="hidden sm:flex items-center gap-1">
              {QUESTIONS.map((q, i) => (
                <div key={q.id} className={`w-2 h-2 rounded-full transition-all ${correctSet.has(q.id) ? 'bg-green-400' : i === currentIdx ? 'bg-green-500 scale-125' : i < currentIdx ? 'bg-gray-300' : 'bg-gray-200'}`} />
              ))}
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
            <SubnetReferencePanel />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 section-enter">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <TypeBadge type={currentQ.type} />
                  {isTopoQ && <span className="text-xs text-indigo-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Refer to topology</span>}
                  {isBinQ  && <span className="text-xs text-emerald-600 flex items-center gap-1"><Hash className="w-3 h-3" />Read each bit&apos;s place value</span>}
                  {isCLI(currentQ) && <span className="text-xs text-green-600 flex items-center gap-1"><Terminal className="w-3 h-3" />Type your command</span>}
                </div>
                <span className="text-sm font-semibold text-gray-400 shrink-0">Q{currentIdx + 1}/{total}</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 leading-snug mb-5">{currentQ.prompt}</p>

              {isBinary(currentQ) && (
                <BinaryVisualizer binaryValue={currentQ.binaryValue} revealed={qState.submitted || qState.revealed} />
              )}

              {(isMC(currentQ) || isBinary(currentQ)) && (
                <MCOptions question={currentQ} state={qState} onSelect={k => setQState(s => ({ ...s, selected: k }))} />
              )}
              {isCLI(currentQ) && (
                <CLIInput question={currentQ} state={qState} onChange={v => setQState(s => ({ ...s, cliInput: v }))} />
              )}
            </div>

            {qState.hintLevel > 0 && (
              <HintPanel
                hints={currentQ.hints}
                hintLevel={qState.hintLevel}
                onNext={() => setQState(s => ({ ...s, hintLevel: Math.min(s.hintLevel + 1, currentQ.hints.length) }))}
              />
            )}
            {qState.submitted && qState.isCorrect !== null && (
              <Feedback isCorrect={qState.isCorrect} explanation={currentQ.explanation} revealed={qState.revealed} />
            )}

            <div className="flex flex-wrap gap-3">
              {!qState.submitted && qState.hintLevel < currentQ.hints.length && (
                <button onClick={() => setQState(s => ({ ...s, hintLevel: s.hintLevel + 1 }))} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-amber-200 bg-amber-50 text-amber-700 font-semibold text-sm hover:bg-amber-100 transition-all">
                  <Lightbulb className="w-4 h-4" />{qState.hintLevel === 0 ? 'Hint' : 'Next hint'}
                </button>
              )}
              {!qState.submitted && !qState.revealed && (
                <button onClick={handleReveal} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all">
                  <Eye className="w-4 h-4" />Reveal Answer
                </button>
              )}
              {!qState.submitted && !qState.revealed && (
                <button onClick={checkAnswer} disabled={!canCheck} className={`ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${canCheck ? 'bg-green-600 hover:bg-green-700 text-white shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                  Check Answer
                </button>
              )}
              {qState.submitted && qState.isCorrect === false && !qState.revealed && (
                <>
                  <button onClick={handleRetry} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"><RotateCcw className="w-4 h-4" />Try Again</button>
                  <button onClick={handleReveal} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"><Eye className="w-4 h-4" />Reveal Answer</button>
                </>
              )}
              {qState.submitted && (qState.isCorrect === true || qState.revealed) && (
                <button onClick={handleContinue} className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm shadow-md transition-all">
                  {currentIdx + 1 >= total ? 'Finish Lab' : 'Continue'}<ChevronLeft className="w-4 h-4 rotate-180" />
                </button>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600">Progress</span>
                <span className="text-sm font-bold text-green-600">{score} correct</span>
              </div>
              <div className="flex gap-1">
                {QUESTIONS.map((q, i) => (
                  <div key={q.id} title={`Q${i + 1}`} className={`flex-1 h-2.5 rounded-full transition-all ${correctSet.has(q.id) ? 'bg-green-400' : i === currentIdx ? 'bg-green-400 opacity-60' : i < currentIdx ? 'bg-gray-300' : 'bg-gray-100'}`} />
                ))}
              </div>
              <div className="flex justify-between mt-1.5"><span className="text-xs text-gray-400">Q1</span><span className="text-xs text-gray-400">Q{total}</span></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Lessons Reinforced</p>
          <div className="flex flex-wrap gap-2">
            {LAB05_META.lessonsReinforced.map(l => (
              <span key={l.id} className="text-xs font-medium text-gray-600 bg-gray-100 rounded-lg px-3 py-1.5">Lesson {l.id}: {l.title}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
