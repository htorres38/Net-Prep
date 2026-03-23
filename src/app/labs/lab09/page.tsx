'use client'

import { setLabCompletion, getLabCompletion } from '@/lib/progress'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, Lightbulb, Eye, RotateCcw, Trophy,
  Check, X, Star, Clock, BookOpen,
  Zap, ChevronDown, ChevronUp, Terminal,
  AlertCircle, CornerDownRight,
} from 'lucide-react'
import {
  QUESTIONS, VLANS, PORT_MAP, TOPO_HIGHLIGHTS,
  LAB09_META, LAB09_SCENARIO, LAB09_COMPLETION,
  type Question, type MCQuestion, type CLIQuestion,
} from '@/data/lab09Data'

// types
const isMC  = (q: Question): q is MCQuestion  => q.type !== 'cli-input'
const isCLI = (q: Question): q is CLIQuestion => q.type === 'cli-input'

// constants
const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  'multiple-choice':       { label: 'Multiple Choice',       color: 'bg-blue-100 text-blue-700' },
  'output-interpretation': { label: 'Output Interpretation', color: 'bg-cyan-100 text-cyan-700' },
  'troubleshooting':       { label: 'Troubleshooting',       color: 'bg-rose-100 text-rose-700' },
  'scenario-analysis':     { label: 'Scenario Analysis',     color: 'bg-violet-100 text-violet-700' },
  'topology-reasoning':    { label: 'Topology Reasoning',    color: 'bg-indigo-100 text-indigo-700' },
  'cli-input':             { label: 'CLI Input',             color: 'bg-gray-800 text-green-400' },
}

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
  return { selected: null, cliInput: '', submitted: false, isCorrect: null, hintLevel: 0, revealed: false }
}

// topology
function TopologyCard({ highlightNodes }: { highlightNodes?: string[] }) {
  const hi = new Set(highlightNodes ?? [])

  const nodeClass = (name: string, base: string) =>
    hi.has(name)
      ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-300 scale-105 shadow-md'
      : base

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-base">🔀</span>
          <span className="font-semibold text-gray-800 text-sm">Network Topology</span>
        </div>
        <span className="text-xs text-gray-400">Dual-Switch VLAN</span>
      </div>

      {/* Top row: PC-A and PC-B */}
      <div className="flex justify-around mb-1">
        {/* PC-A (VLAN 10) */}
        <div className="flex flex-col items-center gap-0.5">
          <div className={`flex flex-col items-center px-2.5 py-2 rounded-xl border-2 transition-all duration-300 min-w-[62px] ${nodeClass('PC-A', 'bg-blue-50 border-blue-300')}`}>
            <span className="text-base">💻</span>
            <span className="text-xs font-bold text-gray-800">PC-A</span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-100 rounded px-1 mt-0.5">VLAN 10</span>
          </div>
        </div>
        {/* PC-B (VLAN 20) */}
        <div className="flex flex-col items-center gap-0.5">
          <div className={`flex flex-col items-center px-2.5 py-2 rounded-xl border-2 transition-all duration-300 min-w-[62px] ${nodeClass('PC-B', 'bg-orange-50 border-orange-300')}`}>
            <span className="text-base">🖥️</span>
            <span className="text-xs font-bold text-gray-800">PC-B</span>
            <span className="text-xs font-semibold text-orange-600 bg-orange-100 rounded px-1 mt-0.5">VLAN 20</span>
          </div>
        </div>
      </div>

      {/* Port labels above S1 */}
      <div className="flex justify-around mb-0">
        <span className="text-xs text-gray-400 text-center w-[62px]">Fa0/3</span>
        <span className="text-xs text-gray-400 text-center w-[62px]">Fa0/5</span>
      </div>

      {/* Lines down to S1 */}
      <div className="flex justify-around">
        <div className="w-px h-5 bg-gray-300" />
        <div className="w-px h-5 bg-gray-300" />
      </div>

      {/* S1 */}
      <div className="flex justify-center mb-0">
        <div className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all duration-300 min-w-[100px] ${nodeClass('S1', 'bg-violet-50 border-violet-300')}`}>
          <span className="text-base">🔀</span>
          <span className="text-xs font-bold text-gray-800">Switch S1</span>
        </div>
      </div>

      {/* Trunk link label */}
      <div className="flex flex-col items-center my-0.5">
        <div className="w-px h-2 bg-violet-400" />
        <span className="text-xs text-violet-600 font-semibold bg-violet-50 px-2 py-0.5 rounded border border-violet-200">Trunk G0/1</span>
        <div className="w-px h-2 border-l-2 border-dashed border-violet-400" />
      </div>

      {/* S2 */}
      <div className="flex justify-center mb-0">
        <div className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all duration-300 min-w-[100px] ${nodeClass('S2', 'bg-violet-50 border-violet-300')}`}>
          <span className="text-base">🔀</span>
          <span className="text-xs font-bold text-gray-800">Switch S2</span>
        </div>
      </div>

      {/* Lines down to PC-C and PC-D */}
      <div className="flex justify-around">
        <div className="w-px h-5 bg-gray-300" />
        <div className="w-px h-5 bg-gray-300" />
      </div>

      {/* Port labels below S2 */}
      <div className="flex justify-around mb-0">
        <span className="text-xs text-gray-400 text-center w-[62px]">Fa0/3</span>
        <span className="text-xs text-gray-400 text-center w-[62px]">Fa0/4</span>
      </div>

      {/* Bottom row: PC-C and PC-D */}
      <div className="flex justify-around mt-1">
        {/* PC-C (VLAN 10) */}
        <div className={`flex flex-col items-center px-2.5 py-2 rounded-xl border-2 transition-all duration-300 min-w-[62px] ${nodeClass('PC-C', 'bg-blue-50 border-blue-300')}`}>
          <span className="text-base">💻</span>
          <span className="text-xs font-bold text-gray-800">PC-C</span>
          <span className="text-xs font-semibold text-blue-600 bg-blue-100 rounded px-1 mt-0.5">VLAN 10</span>
        </div>
        {/* PC-D (VLAN 20) */}
        <div className={`flex flex-col items-center px-2.5 py-2 rounded-xl border-2 transition-all duration-300 min-w-[62px] ${nodeClass('PC-D', 'bg-orange-50 border-orange-300')}`}>
          <span className="text-base">🖥️</span>
          <span className="text-xs font-bold text-gray-800">PC-D</span>
          <span className="text-xs font-semibold text-orange-600 bg-orange-100 rounded px-1 mt-0.5">VLAN 20</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-3 gap-1.5 text-center">
        <div className="rounded-lg px-2 py-1.5 bg-blue-50 text-blue-700"><span className="text-xs font-semibold">VLAN 10</span></div>
        <div className="rounded-lg px-2 py-1.5 bg-orange-50 text-orange-700"><span className="text-xs font-semibold">VLAN 20</span></div>
        <div className="rounded-lg px-2 py-1.5 bg-violet-50 text-violet-700"><span className="text-xs font-semibold">Trunk</span></div>
      </div>
    </div>
  )
}

// vlan ref
function VlanReferencePanel() {
  const [open, setOpen] = useState(true)
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-4 text-left">
        <div className="flex items-center gap-2">
          <span className="text-base">🗂️</span>
          <span className="font-semibold text-gray-800 text-sm">VLAN Configuration</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          {/* VLAN table */}
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-gray-500">VLAN ID</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-500">Name</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-500">Devices</th>
                </tr>
              </thead>
              <tbody>
                {VLANS.map(v => (
                  <tr key={v.id} className={v.color === 'blue' ? 'bg-blue-50' : 'bg-orange-50'}>
                    <td className={`px-3 py-2 font-bold ${v.color === 'blue' ? 'text-blue-700' : 'text-orange-700'}`}>{v.id}</td>
                    <td className={`px-3 py-2 font-semibold ${v.color === 'blue' ? 'text-blue-800' : 'text-orange-800'}`}>{v.name}</td>
                    <td className={`px-3 py-2 ${v.color === 'blue' ? 'text-blue-700' : 'text-orange-700'}`}>{v.devices.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Port mapping table */}
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-gray-500">Switch</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-500">Port</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-500">Mode</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-500">VLAN</th>
                </tr>
              </thead>
              <tbody>
                {PORT_MAP.map((row, i) => (
                  <tr key={i} className={row.mode === 'trunk' ? 'bg-purple-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 font-bold text-gray-800">{row.switch}</td>
                    <td className="px-3 py-2 font-mono text-gray-700">{row.port}</td>
                    <td className={`px-3 py-2 font-semibold ${row.mode === 'trunk' ? 'text-purple-700' : 'text-gray-600'}`}>{row.mode}</td>
                    <td className={`px-3 py-2 ${row.mode === 'trunk' ? 'text-purple-700' : 'text-gray-600'}`}>{row.vlan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// scenario
function ScenarioCard() {
  const [open, setOpen] = useState(true)
  return (
    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-100 shadow-card overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-4 text-left">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔍</span>
          <span className="font-semibold text-violet-900">Mission Brief</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-violet-500" /> : <ChevronDown className="w-4 h-4 text-violet-500" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-sm text-violet-900">{LAB09_SCENARIO.context}</p>
          <div>
            <p className="text-xs font-semibold text-violet-700 uppercase tracking-wider mb-1.5">Users report:</p>
            <ul className="space-y-1">
              {LAB09_SCENARIO.reports.map(r => (
                <li key={r} className="text-sm text-violet-800 flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">!</span>{r}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/70 rounded-xl p-3 border border-violet-100">
            <p className="text-sm text-violet-900 font-medium">{LAB09_SCENARIO.challenge}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// header
function LabHeaderCard({ progress }: { progress: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-600">Lab 09</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" />{LAB09_META.difficulty}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{LAB09_META.title}</h1>
          <div className="flex flex-wrap gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-sm text-gray-600"><Clock className="w-4 h-4 text-gray-400" />{LAB09_META.estimatedTime}</span>
            <span className="flex items-center gap-1.5 text-sm text-gray-600"><BookOpen className="w-4 h-4 text-violet-400" />{QUESTIONS.length} Questions</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0 max-w-xs">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Skills Tested</p>
          <ul className="space-y-1">
            {LAB09_META.skillsTested.map(s => (
              <li key={s} className="text-xs text-gray-600 flex items-start gap-1.5">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />{s}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-5">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Progress</span><span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}

// shared ui
function TypeBadge({ type }: { type: string }) {
  const info = TYPE_LABELS[type] ?? { label: type, color: 'bg-gray-100 text-gray-600' }
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${info.color}`}>{info.label}</span>
}

function TerminalBlock({ output }: { output: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-700 mb-4">
      <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <Terminal className="w-3.5 h-3.5 text-gray-400 ml-2" />
        <span className="text-xs text-gray-400 font-mono">terminal</span>
      </div>
      <div className="bg-gray-900 p-4 overflow-x-auto">
        <pre className="text-sm text-green-400 font-mono whitespace-pre leading-relaxed">{output}</pre>
      </div>
    </div>
  )
}

function MCOptions({ question, state, onSelect }: { question: MCQuestion; state: QState; onSelect: (k: string) => void }) {
  return (
    <div className="space-y-2.5">
      {question.options.map(opt => {
        const sel = state.selected === opt.key
        const correct = opt.key === question.correctAnswer
        let cls = 'border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50 cursor-pointer'
        if (state.submitted || state.revealed) {
          cls = correct
            ? 'border-green-400 bg-green-50 cursor-default'
            : sel
            ? 'border-red-300 bg-red-50 cursor-default'
            : 'border-gray-200 bg-gray-50 opacity-60 cursor-default'
        } else if (sel) {
          cls = 'border-violet-400 bg-violet-50 ring-2 ring-violet-200 cursor-pointer'
        }
        return (
          <button
            key={opt.key}
            onClick={() => !state.submitted && !state.revealed && onSelect(opt.key)}
            disabled={state.submitted || state.revealed}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${cls}`}
          >
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
              state.submitted || state.revealed
                ? correct ? 'bg-green-500 text-white' : sel ? 'bg-red-400 text-white' : 'bg-gray-200 text-gray-500'
                : sel ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}>{opt.key}</span>
            <span className="text-sm text-gray-800 font-medium flex-1">{opt.text}</span>
            {(state.submitted || state.revealed) && (
              correct ? <Check className="w-5 h-5 text-green-500 shrink-0" />
              : sel ? <X className="w-5 h-5 text-red-400 shrink-0" /> : null
            )}
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
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <Terminal className="w-3.5 h-3.5 text-gray-400 ml-2" />
        <span className="text-xs text-gray-400 font-mono">cli input</span>
        {(state.submitted || state.revealed) && (
          <div className="ml-auto">
            {ok
              ? <span className="text-xs font-semibold text-green-400 flex items-center gap-1"><Check className="w-3 h-3" />Correct</span>
              : <span className="text-xs font-semibold text-red-400 flex items-center gap-1"><X className="w-3 h-3" />Incorrect</span>
            }
          </div>
        )}
      </div>
      <div className="bg-gray-900 p-4">
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="text-green-400 shrink-0 select-none">{question.terminalPrompt}</span>
          {state.submitted || state.revealed
            ? <span className={`flex-1 ${ok ? 'text-green-300' : 'text-red-300'}`}>{state.cliInput || <span className="italic text-gray-500">no input</span>}</span>
            : <input ref={ref} type="text" value={state.cliInput} onChange={e => onChange(e.target.value)} placeholder="type your command..." className="flex-1 bg-transparent text-green-300 placeholder-gray-600 outline-none caret-green-400" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />
          }
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
      <div className="flex items-center gap-2 mb-1">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-semibold text-amber-700">Hint {hintLevel} of {hints.length}</span>
      </div>
      {hints.slice(0, hintLevel).map((h, i) => (
        <div key={i} className={`text-sm text-amber-800 flex gap-2 ${i < hintLevel - 1 ? 'opacity-60' : ''}`}>
          <span className="text-amber-400 shrink-0">→</span>{h}
        </div>
      ))}
      {hintLevel < hints.length && (
        <button onClick={onNext} className="text-xs font-semibold text-amber-600 hover:text-amber-700 underline underline-offset-2">Show next hint →</button>
      )}
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
    <div className={`rounded-xl border p-4 ${revealed ? 'bg-violet-50 border-violet-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{revealed ? '📖' : '💡'}</span>
        <span className={`font-semibold ${revealed ? 'text-violet-700' : 'text-red-700'}`}>{revealed ? 'Here is the answer' : 'Not quite — try again or reveal'}</span>
      </div>
      <p className={`text-sm leading-relaxed ${revealed ? 'text-violet-800' : 'text-red-800'}`}>{explanation}</p>
    </div>
  )
}

function CompletionModal({ score, total, onRetry }: { score: number; total: number; onRetry: () => void }) {
  const pct = Math.round((score / total) * 100)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden celebrate-bounce">
        <div className="bg-gradient-to-br from-violet-500 to-violet-600 p-6 text-center">
          <div className="text-5xl mb-2">🏆</div>
          <h2 className="text-2xl font-bold text-white">Lab Complete!</h2>
          <p className="text-violet-100 text-sm mt-1">{LAB09_META.title}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-violet-50 rounded-2xl p-4 text-center border border-violet-100">
              <p className="text-3xl font-bold text-violet-600">{score}/{total}</p>
              <p className="text-xs text-violet-500 font-medium mt-0.5">Correct</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
              <p className="text-3xl font-bold text-green-600">{pct}%</p>
              <p className="text-xs text-green-500 font-medium mt-0.5">Accuracy</p>
            </div>
          </div>
          <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-2"><Trophy className="w-4 h-4 text-green-600" /><span className="text-sm font-semibold text-green-700">Concept Mastered</span></div>
            <p className="text-sm font-bold text-green-800">{LAB09_COMPLETION.conceptMastered}</p>
            <ul className="mt-2 space-y-1">
              {LAB09_COMPLETION.masteredPoints.map(p => (
                <li key={p} className="text-xs text-green-700 flex items-start gap-1.5">
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />{p}
                </li>
              ))}
            </ul>
          </div>
          {pct < 80 && (
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4 text-amber-600" /><span className="text-sm font-semibold text-amber-700">Review If Needed</span></div>
              <ul className="space-y-1">
                {LAB09_COMPLETION.reviewIfNeeded.map(l => (
                  <li key={l.id} className="text-xs text-amber-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />Lesson {l.id}: {l.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Next Suggested Lab</p>
            <p className="text-sm font-semibold text-gray-800">{LAB09_COMPLETION.nextLab.title}</p>
            <span className="text-xs text-gray-400">Coming soon</span>
          </div>
          <div className="flex gap-3">
            <button onClick={onRetry} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all">
              <RotateCcw className="w-4 h-4" />Retry Lab
            </button>
            <Link href="/labs" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-all">
              Back to Labs
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// page
export default function Lab09Page() {
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
    if (isCLI(q)) correct = q.acceptedAnswers.some(a => a.toLowerCase() === qState.cliInput.trim().toLowerCase())
    else if (isMC(q)) correct = qState.selected === q.correctAnswer

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
      setLabCompletion('lab09', score, total)
      setShowCompletion(true)
    } else {
      resetTo(currentIdx + 1)
    }
  }, [currentIdx, total, resetTo, score])

  const handleLabRetry = useCallback(() => {
    setScore(0); setCorrectSet(new Set()); setShowCompletion(false); resetTo(0)
  }, [resetTo])

  const canCheck = isMC(currentQ) ? qState.selected !== null
    : qState.cliInput.trim().length > 0

  const rawHi = TOPO_HIGHLIGHTS[currentQ.id]
  const topoHi = rawHi && (qState.isCorrect || qState.revealed) ? rawHi : []

  return (
    <div className="min-h-screen bg-gray-50">
      {showCompletion && <CompletionModal score={score} total={total} onRetry={handleLabRetry} />}

      {/* Sticky navbar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/labs" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ChevronLeft className="w-4 h-4" />Labs
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Question {currentIdx + 1} of {total}</span>
            <div className="hidden sm:flex items-center gap-1">
              {QUESTIONS.map((q, i) => (
                <div key={q.id} className={`w-2 h-2 rounded-full transition-all ${correctSet.has(q.id) ? 'bg-green-400' : i === currentIdx ? 'bg-violet-500 scale-125' : i < currentIdx ? 'bg-gray-300' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <LabHeaderCard progress={progress} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <ScenarioCard />
            <TopologyCard highlightNodes={topoHi.length ? topoHi : undefined} />
            <VlanReferencePanel />
          </div>

          {/* Right main column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Question card */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 section-enter">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <TypeBadge type={currentQ.type} />
                  {currentQ.type === 'topology-reasoning' && (
                    <span className="text-xs text-indigo-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Refer to VLAN topology</span>
                  )}
                  {currentQ.type === 'output-interpretation' && (
                    <span className="text-xs text-cyan-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Analyze the terminal output</span>
                  )}
                  {currentQ.type === 'cli-input' && (
                    <span className="text-xs text-green-600 flex items-center gap-1"><Terminal className="w-3 h-3" />Type the Cisco switch command</span>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-400 shrink-0">Q{currentIdx + 1}/{total}</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 leading-snug mb-5">{currentQ.prompt}</p>

              {isMC(currentQ) && currentQ.terminalOutput && <TerminalBlock output={currentQ.terminalOutput} />}
              {isMC(currentQ) && <MCOptions question={currentQ} state={qState} onSelect={k => setQState(s => ({ ...s, selected: k }))} />}
              {isCLI(currentQ) && <CLIInput question={currentQ} state={qState} onChange={v => setQState(s => ({ ...s, cliInput: v }))} />}
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

            {/* Action buttons */}
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
                <button onClick={checkAnswer} disabled={!canCheck} className={`ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${canCheck ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                  Check Answer
                </button>
              )}
              {qState.submitted && qState.isCorrect === false && !qState.revealed && (
                <>
                  <button onClick={handleRetry} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all">
                    <RotateCcw className="w-4 h-4" />Try Again
                  </button>
                  <button onClick={handleReveal} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all">
                    <Eye className="w-4 h-4" />Reveal Answer
                  </button>
                </>
              )}
              {qState.submitted && (qState.isCorrect === true || qState.revealed) && (
                <button onClick={handleContinue} className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm shadow-md transition-all">
                  {currentIdx + 1 >= total ? 'Finish Lab' : 'Continue'}<ChevronLeft className="w-4 h-4 rotate-180" />
                </button>
              )}
            </div>

            {/* Progress tracker */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600">Progress</span>
                <span className="text-sm font-bold text-violet-600">{score} correct</span>
              </div>
              <div className="flex gap-1">
                {QUESTIONS.map((q, i) => (
                  <div key={q.id} title={`Q${i + 1}`} className={`flex-1 h-2.5 rounded-full transition-all ${correctSet.has(q.id) ? 'bg-green-400' : i === currentIdx ? 'bg-violet-400' : i < currentIdx ? 'bg-gray-300' : 'bg-gray-100'}`} />
                ))}
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-gray-400">Q1</span>
                <span className="text-xs text-gray-400">Q{total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons reinforced */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Lessons Reinforced</p>
          <div className="flex flex-wrap gap-2">
            {LAB09_META.lessonsReinforced.map(l => (
              <span key={l.id} className="text-xs font-medium text-gray-600 bg-gray-100 rounded-lg px-3 py-1.5">Lesson {l.id}: {l.title}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
