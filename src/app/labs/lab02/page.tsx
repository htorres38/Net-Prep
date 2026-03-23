'use client'

import { setLabCompletion, getLabCompletion } from '@/lib/progress'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  Lightbulb,
  Eye,
  RotateCcw,
  Trophy,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Star,
  Clock,
  BookOpen,
  Zap,
  ChevronDown,
  ChevronUp,
  Terminal,
  Network,
  Layers,
  AlertCircle,
  CornerDownRight,
} from 'lucide-react'
import {
  QUESTIONS,
  DEVICES,
  TOPOLOGY_NODES,
  PDU_LAYERS,
  LAB02_META,
  LAB02_SCENARIO,
  LAB02_COMPLETION,
  type Question,
  type MCQuestion,
  type SeqQuestion,
  type CLIQuestion,
} from '@/data/lab02Data'

// types

function isMC(q: Question): q is MCQuestion {
  return q.type !== 'sequencing' && q.type !== 'cli-input'
}
function isSeq(q: Question): q is SeqQuestion {
  return q.type === 'sequencing'
}
function isCLI(q: Question): q is CLIQuestion {
  return q.type === 'cli-input'
}

// constants

const ZONE_STYLES = {
  'LAN-A':  { badge: 'bg-blue-100 text-blue-700 border-blue-200',   ring: 'border-blue-200',   bg: 'bg-blue-50',   label: 'LAN A' },
  'Gateway':{ badge: 'bg-orange-100 text-orange-700 border-orange-200', ring: 'border-orange-300', bg: 'bg-orange-50', label: 'Gateway' },
  'WAN':    { badge: 'bg-purple-100 text-purple-700 border-purple-200', ring: 'border-purple-200', bg: 'bg-purple-50', label: 'WAN' },
  'LAN-B':  { badge: 'bg-indigo-100 text-indigo-700 border-indigo-200', ring: 'border-indigo-200', bg: 'bg-indigo-50', label: 'LAN B' },
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  'multiple-choice':      { label: 'Multiple Choice',      color: 'bg-blue-100 text-blue-700' },
  'topology-reasoning':   { label: 'Topology Reasoning',   color: 'bg-indigo-100 text-indigo-700' },
  'sequencing':           { label: 'Sequencing',           color: 'bg-violet-100 text-violet-700' },
  'output-interpretation':{ label: 'Output Interpretation',color: 'bg-cyan-100 text-cyan-700' },
  'troubleshooting':      { label: 'Troubleshooting',      color: 'bg-rose-100 text-rose-700' },
  'matching':             { label: 'Concept Mapping',      color: 'bg-teal-100 text-teal-700' },
  'cli-input':            { label: 'CLI Input',            color: 'bg-gray-800 text-green-400' },
}

const TOPO_HIGHLIGHTS: Record<number, string[]> = {
  8: ['Router A', 'Router B'],
}

// state

interface QState {
  selected: string | null
  seqOrder: string[]
  cliInput: string
  submitted: boolean
  isCorrect: boolean | null
  hintLevel: number
  revealed: boolean
  attempts: number
}

// components

function LabHeaderCard({ progress }: { progress: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-600">Lab 02</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" />
              {LAB02_META.difficulty}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            {LAB02_META.title}
          </h1>
          <div className="flex flex-wrap gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              {LAB02_META.estimatedTime}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-600">
              <BookOpen className="w-4 h-4 text-primary-400" />
              {QUESTIONS.length} Questions
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0 max-w-xs">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Skills Tested</p>
          <ul className="space-y-1">
            {LAB02_META.skillsTested.map((s) => (
              <li key={s} className="text-xs text-gray-600 flex items-start gap-1.5">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-5">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function ScenarioCard() {
  const [open, setOpen] = useState(true)
  return (
    <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl border border-primary-100 shadow-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🔬</span>
          <span className="font-semibold text-primary-800">Mission Brief</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-primary-500" /> : <ChevronDown className="w-4 h-4 text-primary-500" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-sm text-primary-900 leading-relaxed">{LAB02_SCENARIO.context}</p>
          <div>
            <p className="text-xs font-semibold text-primary-700 uppercase tracking-wider mb-2">They want to confirm you understand:</p>
            <ul className="space-y-1.5">
              {LAB02_SCENARIO.goals.map((g) => (
                <li key={g} className="text-sm text-primary-800 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/70 rounded-xl p-3 border border-primary-100">
            <p className="text-sm text-primary-900 font-medium">{LAB02_SCENARIO.challenge}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function TopologyCard({ highlightNodes }: { highlightNodes?: string[] }) {
  const nodeDevice = (name: string) => DEVICES.find((d) => d.name === name)
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Network className="w-4 h-4 text-primary-500" />
        <span className="font-semibold text-gray-800 text-sm">Network Topology</span>
      </div>
      {/* Zone legend */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {(['LAN-A', 'Gateway', 'WAN', 'LAN-B'] as const).map((zone) => (
          <span key={zone} className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ZONE_STYLES[zone].badge}`}>
            {ZONE_STYLES[zone].label}
          </span>
        ))}
      </div>
      <div className="flex flex-col items-center gap-0">
        {TOPOLOGY_NODES.map((name, i) => {
          const device = nodeDevice(name)
          const zone = device?.zone ?? 'LAN-A'
          const styles = ZONE_STYLES[zone]
          const isHighlighted = highlightNodes?.includes(name) ?? false

          return (
            <div key={`${name}-${i}`} className="flex flex-col items-center w-full">
              {i > 0 && (
                <div className="flex flex-col items-center">
                  <div className="w-px h-4 bg-gray-300" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <div className="w-px h-1 bg-gray-300" />
                </div>
              )}
              <div
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-300 ${
                  isHighlighted
                    ? 'border-yellow-400 bg-yellow-50 shadow-md scale-105 ring-2 ring-yellow-300'
                    : `${styles.ring} ${styles.bg}`
                }`}
              >
                <span className="text-xl shrink-0">{device?.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{name}</p>
                  {device && (
                    <p className="text-xs text-gray-500 truncate">{device.details[0]}</p>
                  )}
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${styles.badge}`}>
                  {styles.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DevicePanel() {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-semibold text-gray-800 text-sm">Device Reference</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2">
          {DEVICES.map((d, idx) => {
            const styles = ZONE_STYLES[d.zone]
            return (
              <div key={`${d.name}-${idx}`} className={`rounded-xl border p-3 ${styles.ring} ${styles.bg}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{d.emoji}</span>
                  <span className="font-semibold text-sm text-gray-800">{d.name}</span>
                  <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full border ${styles.badge}`}>
                    {styles.label}
                  </span>
                </div>
                <ul className="space-y-1 pl-8">
                  {d.details.map((det) => (
                    <li key={det} className="text-xs text-gray-600 flex items-start gap-1.5">
                      <span className="mt-1 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                      {det}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** Compact OSI/TCP-IP + PDU reference table — shown for Q7 context */
function LayerReferencePanel() {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary-500" />
          <span className="font-semibold text-gray-800 text-sm">Layer Reference</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-2 font-semibold text-gray-500">#</th>
                  <th className="text-left py-2 pr-2 font-semibold text-gray-500">OSI</th>
                  <th className="text-left py-2 pr-2 font-semibold text-gray-500">TCP/IP</th>
                  <th className="text-left py-2 font-semibold text-gray-500">PDU</th>
                </tr>
              </thead>
              <tbody>
                {PDU_LAYERS.map((row) => (
                  <tr key={row.layer} className="border-b border-gray-50">
                    <td className="py-1.5 pr-2 font-mono text-gray-400">{row.layer}</td>
                    <td className="py-1.5 pr-2 text-gray-700">{row.osi}</td>
                    <td className="py-1.5 pr-2 text-gray-600">{row.tcpip}</td>
                    <td className="py-1.5">
                      <span className={`px-1.5 py-0.5 rounded-md border text-xs font-semibold ${row.color}`}>
                        {row.pdu}
                      </span>
                    </td>
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

// questions

function QuestionTypeBadge({ type }: { type: string }) {
  const info = TYPE_LABELS[type] ?? { label: type, color: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${info.color}`}>
      {info.label}
    </span>
  )
}

function TerminalBlock({ output }: { output: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-700 shadow-inner mb-4">
      <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          <Terminal className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-400 font-mono">terminal</span>
        </div>
      </div>
      <div className="bg-gray-900 p-4 overflow-x-auto">
        <pre className="text-sm text-green-400 font-mono whitespace-pre leading-relaxed">{output}</pre>
      </div>
    </div>
  )
}

function MCOptions({
  question,
  state,
  onSelect,
}: {
  question: MCQuestion
  state: QState
  onSelect: (key: string) => void
}) {
  return (
    <div className="space-y-2.5">
      {question.options.map((opt) => {
        const isSelected = state.selected === opt.key
        const isCorrect = opt.key === question.correctAnswer
        let style = 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50 cursor-pointer'

        if (state.submitted || state.revealed) {
          if (isCorrect) style = 'border-green-400 bg-green-50 cursor-default'
          else if (isSelected) style = 'border-red-300 bg-red-50 cursor-default'
          else style = 'border-gray-200 bg-gray-50 opacity-60 cursor-default'
        } else if (isSelected) {
          style = 'border-primary-400 bg-primary-50 cursor-pointer ring-2 ring-primary-200'
        }

        return (
          <button
            key={opt.key}
            onClick={() => !state.submitted && !state.revealed && onSelect(opt.key)}
            disabled={state.submitted || state.revealed}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-150 text-left ${style}`}
          >
            <span
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                state.submitted || state.revealed
                  ? isCorrect ? 'bg-green-500 text-white'
                    : isSelected ? 'bg-red-400 text-white'
                    : 'bg-gray-200 text-gray-500'
                  : isSelected ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {opt.key}
            </span>
            <span className="text-sm text-gray-800 font-medium flex-1">{opt.text}</span>
            {(state.submitted || state.revealed) && (
              <span className="shrink-0">
                {isCorrect ? <Check className="w-5 h-5 text-green-500" /> : isSelected ? <X className="w-5 h-5 text-red-400" /> : null}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function SeqOptions({
  question,
  state,
  onMove,
}: {
  question: SeqQuestion
  state: QState
  onMove: (from: number, to: number) => void
}) {
  const correct = question.correctOrder
  return (
    <div className="space-y-2">
      {state.seqOrder.map((item, idx) => {
        const isCorrectPos = (state.submitted || state.revealed) && correct[idx] === item
        return (
          <div
            key={item}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${
              state.submitted || state.revealed
                ? isCorrectPos ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <span
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                state.submitted || state.revealed
                  ? isCorrectPos ? 'bg-green-500 text-white' : 'bg-red-400 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {idx + 1}
            </span>
            {/* PDU color badge for this item */}
            {(() => {
              const pdu = PDU_LAYERS.find((p) => p.pdu === item)
              return pdu ? (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${pdu.color}`}>
                  {item}
                </span>
              ) : (
                <span className="text-sm font-medium text-gray-800">{item}</span>
              )
            })()}
            {(state.submitted || state.revealed) && !isCorrectPos && (
              <span className="text-xs text-gray-500 italic ml-auto pr-2">→ {correct[idx]}</span>
            )}
            {!state.submitted && !state.revealed && (
              <div className="flex flex-col gap-0.5 ml-auto shrink-0">
                <button
                  onClick={() => idx > 0 && onMove(idx, idx - 1)}
                  disabled={idx === 0}
                  className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label={`Move ${item} up`}
                >
                  <ArrowUp className="w-3.5 h-3.5 text-gray-500" />
                </button>
                <button
                  onClick={() => idx < state.seqOrder.length - 1 && onMove(idx, idx + 1)}
                  disabled={idx === state.seqOrder.length - 1}
                  className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label={`Move ${item} down`}
                >
                  <ArrowDown className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            )}
          </div>
        )
      })}
      {(state.submitted || state.revealed) && !state.isCorrect && (
        <div className="mt-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 mb-2">Correct order:</p>
          <ol className="space-y-1">
            {correct.map((item, i) => {
              const pdu = PDU_LAYERS.find((p) => p.pdu === item)
              return (
                <li key={item} className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="text-gray-400 w-4">{i + 1}.</span>
                  {pdu ? (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${pdu.color}`}>{item}</span>
                  ) : item}
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </div>
  )
}

/** Terminal-style CLI input for cli-input questions */
function CLIInput({
  question,
  state,
  onChange,
}: {
  question: CLIQuestion
  state: QState
  onChange: (val: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!state.submitted && !state.revealed) {
      inputRef.current?.focus()
    }
  }, [state.submitted, state.revealed])

  const isCorrect = state.isCorrect
  const borderColor =
    state.submitted || state.revealed
      ? isCorrect ? 'border-green-500' : 'border-red-500'
      : 'border-gray-600 focus-within:border-green-500'

  return (
    <div className="space-y-3">
      {/* Terminal box */}
      <div className={`rounded-xl overflow-hidden border-2 transition-colors duration-200 ${borderColor}`}>
        {/* Terminal title bar */}
        <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <Terminal className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400 font-mono">cli input</span>
          </div>
          {(state.submitted || state.revealed) && (
            <div className="ml-auto">
              {isCorrect ? (
                <span className="text-xs font-semibold text-green-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Correct
                </span>
              ) : (
                <span className="text-xs font-semibold text-red-400 flex items-center gap-1">
                  <X className="w-3 h-3" /> Incorrect
                </span>
              )}
            </div>
          )}
        </div>

        {/* Terminal body */}
        <div className="bg-gray-900 p-4">
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="text-green-400 shrink-0 select-none">{question.terminalPrompt}</span>
            {state.submitted || state.revealed ? (
              <span className={`flex-1 ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                {state.cliInput || <span className="italic text-gray-500">no input</span>}
              </span>
            ) : (
              <input
                ref={inputRef}
                type="text"
                value={state.cliInput}
                onChange={(e) => onChange(e.target.value)}
                placeholder="type your command here..."
                className="flex-1 bg-transparent text-green-300 placeholder-gray-600 outline-none border-none caret-green-400"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            )}
          </div>
          {/* Expected answer line (after submit if wrong, or after reveal) */}
          {(state.submitted || state.revealed) && !isCorrect && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="flex items-center gap-2 font-mono text-sm">
                <CornerDownRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span className="text-xs text-gray-400 mr-2">expected:</span>
                <span className="text-yellow-300">{question.expectedAnswer}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Accepted answers note */}
      {!state.submitted && !state.revealed && question.acceptedAnswers.length > 1 && (
        <p className="text-xs text-gray-400 italic">
          Accepted: {question.acceptedAnswers.join(' or ')}
        </p>
      )}
    </div>
  )
}

function HintPanel({
  hints,
  hintLevel,
  onRevealHint,
}: {
  hints: string[]
  hintLevel: number
  onRevealHint: () => void
}) {
  if (hintLevel === 0) return null
  return (
    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-semibold text-amber-700">
          Hint {hintLevel} of {hints.length}
        </span>
      </div>
      {hints.slice(0, hintLevel).map((hint, i) => (
        <div key={i} className={`text-sm text-amber-800 flex items-start gap-2 ${i < hintLevel - 1 ? 'opacity-60' : ''}`}>
          <span className="mt-0.5 shrink-0 text-amber-400">→</span>
          {hint}
        </div>
      ))}
      {hintLevel < hints.length && (
        <button
          onClick={onRevealHint}
          className="mt-1 text-xs font-semibold text-amber-600 hover:text-amber-700 underline underline-offset-2"
        >
          Show next hint →
        </button>
      )}
    </div>
  )
}

function FeedbackPanel({
  isCorrect,
  explanation,
  revealed,
}: {
  isCorrect: boolean
  explanation: string
  revealed: boolean
}) {
  if (isCorrect) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-4 celebrate-bounce">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🎉</span>
          <span className="font-semibold text-green-700">Nice work!</span>
        </div>
        <p className="text-sm text-green-800 leading-relaxed">{explanation}</p>
      </div>
    )
  }
  return (
    <div className={`rounded-xl border p-4 ${revealed ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{revealed ? '📖' : '💡'}</span>
        <span className={`font-semibold ${revealed ? 'text-blue-700' : 'text-red-700'}`}>
          {revealed ? 'Here is the answer' : 'Not quite — try again or reveal'}
        </span>
      </div>
      <p className={`text-sm leading-relaxed ${revealed ? 'text-blue-800' : 'text-red-800'}`}>
        {explanation}
      </p>
    </div>
  )
}

// completion

function CompletionModal({ score, total, onRetry }: { score: number; total: number; onRetry: () => void }) {
  const pct = Math.round((score / total) * 100)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden celebrate-bounce">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 text-center">
          <div className="text-5xl mb-2">🏆</div>
          <h2 className="text-2xl font-bold text-white">Lab Complete!</h2>
          <p className="text-primary-100 text-sm mt-1">{LAB02_META.title}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary-50 rounded-2xl p-4 text-center border border-primary-100">
              <p className="text-3xl font-bold text-primary-600">{score}/{total}</p>
              <p className="text-xs text-primary-500 font-medium mt-0.5">Correct</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
              <p className="text-3xl font-bold text-green-600">{pct}%</p>
              <p className="text-xs text-green-500 font-medium mt-0.5">Accuracy</p>
            </div>
          </div>
          <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">Concept Mastered</span>
            </div>
            <p className="text-sm font-bold text-green-800">{LAB02_COMPLETION.conceptMastered}</p>
            <p className="text-xs text-green-700 mt-1 leading-relaxed">{LAB02_COMPLETION.summary}</p>
            <ul className="mt-2 space-y-1">
              {LAB02_COMPLETION.masteredPoints.map((p) => (
                <li key={p} className="text-xs text-green-700 flex items-start gap-1.5">
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          {pct < 80 && (
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-700">Review If Needed</span>
              </div>
              <ul className="space-y-1">
                {LAB02_COMPLETION.reviewIfNeeded.map((l) => (
                  <li key={l.id} className="text-xs text-amber-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    Lesson {l.id}: {l.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Next Suggested Lab</p>
            <p className="text-sm font-semibold text-gray-800">{LAB02_COMPLETION.nextLab.title}</p>
            <span className="text-xs text-gray-400 mt-0.5 block">Coming soon</span>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={onRetry}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Retry Lab
            </button>
            <Link
              href="/labs"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-all"
            >
              Back to Labs
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// page

function makeInitialState(q: Question): QState {
  return {
    selected: null,
    seqOrder: isSeq(q) ? [...q.shuffledItems] : [],
    cliInput: '',
    submitted: false,
    isCorrect: null,
    hintLevel: 0,
    revealed: false,
    attempts: 0,
  }
}

export default function Lab02Page() {
  const total = QUESTIONS.length

  const [currentIdx, setCurrentIdx] = useState(0)
  const [qState, setQState] = useState<QState>(makeInitialState(QUESTIONS[0]))
  const [score, setScore] = useState(0)
  const [correctSet, setCorrectSet] = useState<Set<number>>(new Set())
  const [showCompletion, setShowCompletion] = useState(false)

  const currentQ = QUESTIONS[currentIdx]
  const progress = (currentIdx / total) * 100

  // helpers

  const resetToQuestion = useCallback((idx: number) => {
    setCurrentIdx(idx)
    setQState(makeInitialState(QUESTIONS[idx]))
  }, [])

  const checkAnswer = useCallback(() => {
    const q = currentQ
    let correct = false

    if (isMC(q)) {
      correct = qState.selected === q.correctAnswer
    } else if (isSeq(q)) {
      correct = JSON.stringify(qState.seqOrder) === JSON.stringify(q.correctOrder)
    } else if (isCLI(q)) {
      const normalized = qState.cliInput.trim().toLowerCase()
      correct = q.acceptedAnswers.some((a) => a.toLowerCase() === normalized)
    }

    setQState((s) => ({
      ...s,
      submitted: true,
      isCorrect: correct,
      attempts: s.attempts + 1,
    }))

    if (correct && !correctSet.has(q.id)) {
      setCorrectSet((prev) => new Set(Array.from(prev).concat(q.id)))
      setScore((s) => s + 1)
    }
  }, [currentQ, qState, correctSet])

  const handleRetry = useCallback(() => {
    setQState((s) => ({
      ...s,
      submitted: false,
      isCorrect: null,
      selected: null,
      cliInput: '',
      ...(isSeq(currentQ) ? { seqOrder: [...currentQ.shuffledItems] } : {}),
    }))
  }, [currentQ])

  const handleReveal = useCallback(() => {
    setQState((s) => ({
      ...s,
      submitted: true,
      revealed: true,
      isCorrect: false,
      ...(isSeq(currentQ) ? { seqOrder: [...currentQ.correctOrder] } : {}),
      ...(isCLI(currentQ) ? { cliInput: '' } : {}),
    }))
  }, [currentQ])

  const handleContinue = useCallback(() => {
    if (currentIdx + 1 >= total) {
      setLabCompletion('lab02', score, total)
      setShowCompletion(true)
    } else {
      resetToQuestion(currentIdx + 1)
    }
  }, [currentIdx, total, resetToQuestion])

  const handleLabRetry = useCallback(() => {
    setScore(0)
    setCorrectSet(new Set())
    setShowCompletion(false)
    resetToQuestion(0)
  }, [resetToQuestion])

  // state

  const canCheck =
    isMC(currentQ)    ? qState.selected !== null
    : isSeq(currentQ) ? true
    :                   qState.cliInput.trim().length > 0

  const topoHighlights: string[] =
    TOPO_HIGHLIGHTS[currentQ.id] &&
    (qState.submitted || qState.revealed) &&
    qState.isCorrect
      ? TOPO_HIGHLIGHTS[currentQ.id]
      : TOPO_HIGHLIGHTS[currentQ.id] && qState.revealed
      ? TOPO_HIGHLIGHTS[currentQ.id]
      : []

  const showLayerRef = [6, 7].includes(currentQ.id)

  // render

  return (
    <div className="min-h-screen bg-gray-50">
      {showCompletion && (
        <CompletionModal score={score} total={total} onRetry={handleLabRetry} />
      )}

      {/* Sticky nav */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/labs"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Labs
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">
              Question {currentIdx + 1} of {total}
            </span>
            <div className="hidden sm:flex items-center gap-1">
              {QUESTIONS.map((q, i) => (
                <div
                  key={q.id}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    correctSet.has(q.id)    ? 'bg-green-400'
                    : i === currentIdx      ? 'bg-primary-500 scale-125'
                    : i < currentIdx        ? 'bg-gray-300'
                    :                         'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <LabHeaderCard progress={progress} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reference panel (left) */}
          <div className="lg:col-span-1 space-y-4">
            <ScenarioCard />
            <TopologyCard highlightNodes={topoHighlights.length ? topoHighlights : undefined} />
            <DevicePanel />
            <LayerReferencePanel />
          </div>

          {/* Question area (right) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Question card */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 section-enter">
              {/* Header row */}
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <QuestionTypeBadge type={currentQ.type} />
                  {currentQ.type === 'topology-reasoning' && (
                    <span className="text-xs text-indigo-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Refer to topology
                    </span>
                  )}
                  {currentQ.type === 'cli-input' && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <Terminal className="w-3 h-3" />
                      Type your command
                    </span>
                  )}
                  {showLayerRef && (
                    <span className="text-xs text-teal-600 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      See layer reference
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-400 shrink-0">
                  Q{currentIdx + 1}/{total}
                </span>
              </div>

              {/* Prompt */}
              <p className="text-lg font-semibold text-gray-900 leading-snug mb-5">
                {currentQ.prompt}
              </p>

              {/* Terminal output (for output-interpretation) */}
              {isMC(currentQ) && currentQ.terminalOutput && (
                <TerminalBlock output={currentQ.terminalOutput} />
              )}

              {/* Input area */}
              {isMC(currentQ) ? (
                <MCOptions
                  question={currentQ}
                  state={qState}
                  onSelect={(key) => setQState((s) => ({ ...s, selected: key }))}
                />
              ) : isSeq(currentQ) ? (
                <SeqOptions
                  question={currentQ}
                  state={qState}
                  onMove={(from, to) => {
                    setQState((s) => {
                      const next = [...s.seqOrder]
                      const tmp = next[from]; next[from] = next[to]; next[to] = tmp
                      return { ...s, seqOrder: next }
                    })
                  }}
                />
              ) : (
                <CLIInput
                  question={currentQ as CLIQuestion}
                  state={qState}
                  onChange={(val) => setQState((s) => ({ ...s, cliInput: val }))}
                />
              )}
            </div>

            {/* Hints */}
            {qState.hintLevel > 0 && (
              <HintPanel
                hints={currentQ.hints}
                hintLevel={qState.hintLevel}
                onRevealHint={() =>
                  setQState((s) => ({ ...s, hintLevel: Math.min(s.hintLevel + 1, currentQ.hints.length) }))
                }
              />
            )}

            {/* Feedback */}
            {qState.submitted && qState.isCorrect !== null && (
              <FeedbackPanel
                isCorrect={qState.isCorrect}
                explanation={currentQ.explanation}
                revealed={qState.revealed}
              />
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {/* Hint */}
              {!qState.submitted && qState.hintLevel < currentQ.hints.length && (
                <button
                  onClick={() => setQState((s) => ({ ...s, hintLevel: s.hintLevel + 1 }))}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-amber-200 bg-amber-50 text-amber-700 font-semibold text-sm hover:border-amber-300 hover:bg-amber-100 transition-all"
                >
                  <Lightbulb className="w-4 h-4" />
                  {qState.hintLevel === 0 ? 'Hint' : 'Next hint'}
                </button>
              )}

              {/* Reveal */}
              {!qState.submitted && !qState.revealed && (
                <button
                  onClick={handleReveal}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  Reveal Answer
                </button>
              )}

              {/* Check */}
              {!qState.submitted && !qState.revealed && (
                <button
                  onClick={checkAnswer}
                  disabled={!canCheck}
                  className={`ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    canCheck
                      ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Check Answer
                </button>
              )}

              {/* Try again + reveal (after wrong) */}
              {qState.submitted && qState.isCorrect === false && !qState.revealed && (
                <>
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </button>
                  <button
                    onClick={handleReveal}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    Reveal Answer
                  </button>
                </>
              )}

              {/* Continue */}
              {qState.submitted && (qState.isCorrect === true || qState.revealed) && (
                <button
                  onClick={handleContinue}
                  className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  {currentIdx + 1 >= total ? 'Finish Lab' : 'Continue'}
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                </button>
              )}
            </div>

            {/* Progress bar track */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600">Progress</span>
                <span className="text-sm font-bold text-primary-600">{score} correct</span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {QUESTIONS.map((q, i) => (
                  <div
                    key={q.id}
                    title={`Q${i + 1} — ${TYPE_LABELS[q.type]?.label ?? q.type}`}
                    className={`flex-1 min-w-[16px] h-2.5 rounded-full transition-all duration-300 ${
                      correctSet.has(q.id) ? 'bg-green-400'
                      : i === currentIdx   ? 'bg-primary-400'
                      : i < currentIdx     ? 'bg-gray-300'
                      :                      'bg-gray-100'
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-gray-400">Q1</span>
                <span className="text-xs text-gray-400">Q{total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons footer */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Lessons Reinforced
          </p>
          <div className="flex flex-wrap gap-2">
            {LAB02_META.lessonsReinforced.map((l) => (
              <span key={l.id} className="text-xs font-medium text-gray-600 bg-gray-100 rounded-lg px-3 py-1.5">
                Lesson {l.id}: {l.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
