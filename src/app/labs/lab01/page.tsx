'use client'

import { useState, useCallback, useEffect } from 'react'
import { setLabCompletion, getLabCompletion, initProgress } from '@/lib/progress'
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
  AlertCircle,
} from 'lucide-react'
import {
  QUESTIONS,
  DEVICES,
  TOPOLOGY_NODES,
  LAB01_META,
  LAB01_SCENARIO,
  LAB01_COMPLETION,
  type Question,
  type MCQuestion,
  type SeqQuestion,
} from '@/data/lab01Data'
import AiExplanation from '@/components/AiExplanation'

// helpers

function isMC(q: Question): q is MCQuestion {
  return q.type !== 'sequencing'
}

function isSeq(q: Question): q is SeqQuestion {
  return q.type === 'sequencing'
}

const ZONE_STYLES = {
  LAN: {
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    ring: 'border-blue-200',
    bg: 'bg-blue-50',
  },
  Gateway: {
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    ring: 'border-orange-300',
    bg: 'bg-orange-50',
  },
  WAN: {
    badge: 'bg-purple-100 text-purple-700 border-purple-200',
    ring: 'border-purple-200',
    bg: 'bg-purple-50',
  },
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  'multiple-choice': { label: 'Multiple Choice', color: 'bg-blue-100 text-blue-700' },
  'topology-reasoning': { label: 'Topology Reasoning', color: 'bg-indigo-100 text-indigo-700' },
  'sequencing': { label: 'Sequencing', color: 'bg-violet-100 text-violet-700' },
  'output-interpretation': { label: 'Output Interpretation', color: 'bg-cyan-100 text-cyan-700' },
  'troubleshooting': { label: 'Troubleshooting', color: 'bg-rose-100 text-rose-700' },
}

// components

function LabHeaderCard({ progress }: { progress: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left: title + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-600">
              Lab 01
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" />
              {LAB01_META.difficulty}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            {LAB01_META.title}
          </h1>

          <div className="flex flex-wrap gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              {LAB01_META.estimatedTime}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-600">
              <BookOpen className="w-4 h-4 text-primary-400" />
              {QUESTIONS.length} Questions
            </span>
          </div>
        </div>

        {/* Right: skills + lessons */}
        <div className="flex flex-col gap-2 shrink-0 max-w-xs">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Skills Tested
          </p>
          <ul className="space-y-1">
            {LAB01_META.skillsTested.map((s) => (
              <li key={s} className="text-xs text-gray-600 flex items-start gap-1.5">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Progress bar */}
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
          <span className="text-lg">🎯</span>
          <span className="font-semibold text-primary-800">Mission Brief</span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-primary-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-primary-500" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-sm text-primary-900 leading-relaxed">
            {LAB01_SCENARIO.context}
          </p>
          <div>
            <p className="text-xs font-semibold text-primary-700 uppercase tracking-wider mb-2">
              They want to confirm you understand:
            </p>
            <ul className="space-y-1.5">
              {LAB01_SCENARIO.goals.map((g) => (
                <li key={g} className="text-sm text-primary-800 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/70 rounded-xl p-3 border border-primary-100">
            <p className="text-sm text-primary-900 font-medium">
              {LAB01_SCENARIO.challenge}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function TopologyCard({ highlightNode }: { highlightNode?: string }) {
  const nodeDevice = (name: string) => DEVICES.find((d) => d.name === name)
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Network className="w-4 h-4 text-primary-500" />
        <span className="font-semibold text-gray-800 text-sm">Network Topology</span>
      </div>

      {/* Zone labels */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['LAN', 'Gateway', 'WAN'] as const).map((zone) => (
          <span
            key={zone}
            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ZONE_STYLES[zone].badge}`}
          >
            {zone}
          </span>
        ))}
      </div>

      {/* Vertical topology chain */}
      <div className="flex flex-col items-center gap-0">
        {TOPOLOGY_NODES.map((name, i) => {
          const device = nodeDevice(name)
          const isHighlighted = highlightNode === name
          const zone = device?.zone ?? 'LAN'
          const styles = ZONE_STYLES[zone]

          return (
            <div key={name} className="flex flex-col items-center w-full">
              {/* Connection line (skip for first) */}
              {i > 0 && (
                <div className="flex flex-col items-center">
                  <div className="w-px h-4 bg-gray-300" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <div className="w-px h-1 bg-gray-300" />
                </div>
              )}
              {/* Node box */}
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
                    <p className="text-xs text-gray-500 truncate">
                      {device.details[0]}
                    </p>
                  )}
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${styles.badge}`}
                >
                  {zone}
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
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2">
          {DEVICES.map((d) => {
            const styles = ZONE_STYLES[d.zone]
            return (
              <div
                key={d.name}
                className={`rounded-xl border p-3 ${styles.ring} ${styles.bg}`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{d.emoji}</span>
                  <span className="font-semibold text-sm text-gray-800">{d.name}</span>
                  <span
                    className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full border ${styles.badge}`}
                  >
                    {d.zone}
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

// questions

interface QuestionState {
  selected: string | null
  seqOrder: string[]
  submitted: boolean
  isCorrect: boolean | null
  hintLevel: number
  revealed: boolean
  attempts: number
}

function MCOptions({
  question,
  state,
  onSelect,
}: {
  question: MCQuestion
  state: QuestionState
  onSelect: (key: string) => void
}) {
  return (
    <div className="space-y-2.5">
      {question.options.map((opt) => {
        const isSelected = state.selected === opt.key
        const isCorrect = opt.key === question.correctAnswer
        let optStyle =
          'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50 cursor-pointer'

        if (state.submitted || state.revealed) {
          if (isCorrect) {
            optStyle = 'border-green-400 bg-green-50 cursor-default'
          } else if (isSelected && !isCorrect) {
            optStyle = 'border-red-300 bg-red-50 cursor-default'
          } else {
            optStyle = 'border-gray-200 bg-gray-50 opacity-60 cursor-default'
          }
        } else if (isSelected) {
          optStyle = 'border-primary-400 bg-primary-50 cursor-pointer ring-2 ring-primary-200'
        }

        return (
          <button
            key={opt.key}
            onClick={() => !state.submitted && !state.revealed && onSelect(opt.key)}
            disabled={state.submitted || state.revealed}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-150 text-left ${optStyle}`}
          >
            {/* Key badge */}
            <span
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                state.submitted || state.revealed
                  ? isCorrect
                    ? 'bg-green-500 text-white'
                    : isSelected
                    ? 'bg-red-400 text-white'
                    : 'bg-gray-200 text-gray-500'
                  : isSelected
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {opt.key}
            </span>
            <span className="text-sm text-gray-800 font-medium flex-1">{opt.text}</span>
            {/* Result icon */}
            {(state.submitted || state.revealed) && (
              <span className="shrink-0">
                {isCorrect ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : isSelected ? (
                  <X className="w-5 h-5 text-red-400" />
                ) : null}
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
  state: QuestionState
  onMove: (from: number, to: number) => void
}) {
  const correct = question.correctOrder

  return (
    <div className="space-y-2">
      {state.seqOrder.map((item, idx) => {
        const isCorrectPosition =
          (state.submitted || state.revealed) && correct[idx] === item

        return (
          <div
            key={item}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${
              state.submitted || state.revealed
                ? isCorrectPosition
                  ? 'border-green-400 bg-green-50'
                  : 'border-red-300 bg-red-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            {/* Position number */}
            <span
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                state.submitted || state.revealed
                  ? isCorrectPosition
                    ? 'bg-green-500 text-white'
                    : 'bg-red-400 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {idx + 1}
            </span>

            {/* Device name */}
            <span className="flex-1 text-sm font-medium text-gray-800">{item}</span>

            {/* Correct label (after reveal) */}
            {(state.submitted || state.revealed) && !isCorrectPosition && (
              <span className="text-xs text-gray-500 italic">
                → {correct[idx]}
              </span>
            )}

            {/* Up/Down controls */}
            {!state.submitted && !state.revealed && (
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => idx > 0 && onMove(idx, idx - 1)}
                  disabled={idx === 0}
                  className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label={`Move ${item} up`}
                >
                  <ArrowUp className="w-3.5 h-3.5 text-gray-500" />
                </button>
                <button
                  onClick={() => idx < state.seqOrder.length - 1 && onMove(idx, idx + 1)}
                  disabled={idx === state.seqOrder.length - 1}
                  className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label={`Move ${item} down`}
                >
                  <ArrowDown className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            )}
          </div>
        )
      })}

      {/* Correct order guide (after submit, if wrong) */}
      {(state.submitted || state.revealed) &&
        state.isCorrect === false && (
          <div className="mt-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-2">Correct order:</p>
            <ol className="space-y-1">
              {correct.map((item, i) => (
                <li key={item} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-gray-400 w-4">{i + 1}.</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        )}
    </div>
  )
}

function TerminalBlock({ output }: { output: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-700 shadow-inner mb-4">
      {/* Terminal header */}
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
      {/* Terminal body */}
      <div className="bg-gray-900 p-4 overflow-x-auto">
        <pre className="text-sm text-green-400 font-mono whitespace-pre leading-relaxed">
          {output}
        </pre>
      </div>
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
        <div
          key={i}
          className={`text-sm text-amber-800 flex items-start gap-2 ${
            i < hintLevel - 1 ? 'opacity-60' : ''
          }`}
        >
          <span className="mt-0.5 shrink-0 text-amber-400">→</span>
          {hint}
        </div>
      ))}
      {hintLevel < hints.length && (
        <button
          onClick={onRevealHint}
          className="mt-1 text-xs font-semibold text-amber-600 hover:text-amber-700 underline underline-offset-2 transition-colors"
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

function QuestionTypeBadge({ type }: { type: string }) {
  const info = TYPE_LABELS[type] ?? { label: type, color: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${info.color}`}>
      {info.label}
    </span>
  )
}

// completion

function CompletionModal({
  score,
  total,
  onRetry,
}: {
  score: number
  total: number
  onRetry: () => void
}) {
  const pct = Math.round((score / total) * 100)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden celebrate-bounce">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 text-center">
          <div className="text-5xl mb-2">🏆</div>
          <h2 className="text-2xl font-bold text-white">Lab Complete!</h2>
          <p className="text-primary-100 text-sm mt-1">Network Foundations and Device Roles</p>
        </div>

        {/* Stats */}
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

          {/* Concept mastered */}
          <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">Concept Mastered</span>
            </div>
            <p className="text-sm font-bold text-green-800">
              {LAB01_COMPLETION.conceptMastered}
            </p>
            <p className="text-xs text-green-700 mt-1 leading-relaxed">
              {LAB01_COMPLETION.summary}
            </p>
            <ul className="mt-2 space-y-1">
              {LAB01_COMPLETION.masteredPoints.map((p) => (
                <li key={p} className="text-xs text-green-700 flex items-start gap-1.5">
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Review if needed */}
          {pct < 80 && (
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-700">Review If Needed</span>
              </div>
              <ul className="space-y-1">
                {LAB01_COMPLETION.reviewIfNeeded.map((l) => (
                  <li key={l.id} className="text-xs text-amber-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    Lesson {l.id}: {l.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next lab */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Next Suggested Lab
            </p>
            <p className="text-sm font-semibold text-gray-800">
              {LAB01_COMPLETION.nextLab.title}
            </p>
            <span className="text-xs text-gray-400 mt-0.5 block">Coming soon</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onRetry}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Lab
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

export default function Lab01Page() {
  const total = QUESTIONS.length

  // nav
  const [currentIdx, setCurrentIdx] = useState(0)

  // state
  const [selected, setSelected] = useState<string | null>(null)
  const [seqOrder, setSeqOrder] = useState<string[]>(
    (QUESTIONS[0] as SeqQuestion).shuffledItems
      ? [...(QUESTIONS[0] as SeqQuestion).shuffledItems]
      : []
  )
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [hintLevel, setHintLevel] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [attempts, setAttempts] = useState(0)

  // lab state
  const [score, setScore] = useState(0)
  const [correctSet, setCorrectSet] = useState<Set<number>>(new Set())
  const [showCompletion, setShowCompletion] = useState(false)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)

  useEffect(() => {
    initProgress().then(() => setAlreadyCompleted(getLabCompletion('lab01')))
  }, [])

  const currentQ = QUESTIONS[currentIdx]
  const progress = (currentIdx / total) * 100

  const resetQuestion = useCallback((idx: number) => {
    setCurrentIdx(idx)
    setSelected(null)
    setSubmitted(false)
    setIsCorrect(null)
    setHintLevel(0)
    setRevealed(false)
    setAttempts(0)
    const q = QUESTIONS[idx]
    if (isSeq(q)) {
      setSeqOrder([...q.shuffledItems])
    } else {
      setSeqOrder([])
    }
  }, [])

  // check
  const handleCheck = useCallback(() => {
    const q = currentQ
    let correct = false

    if (isMC(q)) {
      correct = selected === q.correctAnswer
    } else if (isSeq(q)) {
      correct =
        JSON.stringify(seqOrder) === JSON.stringify(q.correctOrder)
    }

    setIsCorrect(correct)
    setSubmitted(true)
    setAttempts((a) => a + 1)

    if (correct && !correctSet.has(q.id)) {
      setCorrectSet((s) => new Set(Array.from(s).concat(q.id)))
      setScore((s) => s + 1)
    }
  }, [currentQ, selected, seqOrder, correctSet])

  // retry
  const handleRetry = useCallback(() => {
    setSubmitted(false)
    setIsCorrect(null)
    setSelected(null)
    const q = currentQ
    if (isSeq(q)) setSeqOrder([...q.shuffledItems])
  }, [currentQ])

  // reveal
  const handleReveal = useCallback(() => {
    setRevealed(true)
    setSubmitted(true)
    setIsCorrect(false)
    const q = currentQ
    if (isSeq(q)) setSeqOrder([...q.correctOrder])
  }, [currentQ])

  // next
  const handleContinue = useCallback(() => {
    if (currentIdx + 1 >= total) {
      setLabCompletion('lab01', score, total)
      setAlreadyCompleted(true)
      setShowCompletion(true)
    } else {
      resetQuestion(currentIdx + 1)
    }
  }, [currentIdx, total, resetQuestion, score])

  // sequence
  const handleSeqMove = useCallback((from: number, to: number) => {
    setSeqOrder((order) => {
      const next = [...order]
      const temp = next[from]
      next[from] = next[to]
      next[to] = temp
      return next
    })
  }, [])

  // retry lab
  const handleLabRetry = useCallback(() => {
    setScore(0)
    setCorrectSet(new Set())
    setShowCompletion(false)
    resetQuestion(0)
  }, [resetQuestion])

  // can check
  const canCheck = isMC(currentQ)
    ? selected !== null
    : true // sequencing always checkable

  const topoHighlight =
    currentQ.type === 'topology-reasoning' && (isCorrect || revealed)
      ? 'Router'
      : undefined

  const qState: QuestionState = {
    selected,
    seqOrder,
    submitted,
    isCorrect,
    hintLevel,
    revealed,
    attempts,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Completion Modal */}
      {showCompletion && (
        <CompletionModal
          score={score}
          total={total}
          onRetry={handleLabRetry}
        />
      )}

      {/* Top Nav */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/labs"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Labs
          </Link>
          {alreadyCompleted && (
            <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
              <Check className="w-3.5 h-3.5" /> Completed
            </span>
          )}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">
              Question {currentIdx + 1} of {total}
            </span>
            {/* Mini progress dots */}
            <div className="hidden sm:flex items-center gap-1">
              {QUESTIONS.map((q, i) => (
                <div
                  key={q.id}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    correctSet.has(q.id)
                      ? 'bg-green-400'
                      : i === currentIdx
                      ? 'bg-primary-500 scale-125'
                      : i < currentIdx
                      ? 'bg-gray-300'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Lab Header */}
        <LabHeaderCard progress={progress} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Reference Panel */}
          <div className="lg:col-span-1 space-y-4">
            <ScenarioCard />
            <TopologyCard highlightNode={topoHighlight} />
            <DevicePanel />
          </div>

          {/* Right: Question Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 section-enter">
              {/* Question header */}
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <QuestionTypeBadge type={currentQ.type} />
                  {currentQ.type === 'topology-reasoning' && (
                    <span className="text-xs text-indigo-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Refer to topology
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

              {/* Terminal output (output-interpretation) */}
              {isMC(currentQ) && currentQ.terminalOutput && (
                <TerminalBlock output={currentQ.terminalOutput} />
              )}

              {/* Options */}
              {isMC(currentQ) ? (
                <MCOptions question={currentQ} state={qState} onSelect={setSelected} />
              ) : (
                <SeqOptions
                  question={currentQ as SeqQuestion}
                  state={qState}
                  onMove={handleSeqMove}
                />
              )}
            </div>

            {/* Hints */}
            {hintLevel > 0 && (
              <HintPanel
                hints={currentQ.hints}
                hintLevel={hintLevel}
                onRevealHint={() => setHintLevel((h) => Math.min(h + 1, currentQ.hints.length))}
              />
            )}

            {/* Feedback */}
            {submitted && isCorrect !== null && (
              <FeedbackPanel
                isCorrect={isCorrect}
                explanation={currentQ.explanation}
                revealed={revealed}
              />
            )}

            {/* AI Explanation — only for MC wrong answers */}
            {submitted && !isCorrect && isMC(currentQ) && selected !== null && (
              <AiExplanation
                questionId={`lab01-q${currentQ.id}`}
                question={currentQ.prompt}
                options={currentQ.options.map((o) => o.text)}
                userAnswer={currentQ.options.find((o) => o.key === selected)?.text ?? selected}
                correctAnswer={currentQ.options.find((o) => o.key === currentQ.correctAnswer)?.text ?? currentQ.correctAnswer}
                existingExplanation={currentQ.explanation}
                context="lab"
              />
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {/* Hint button */}
              {!submitted && hintLevel < currentQ.hints.length && (
                <button
                  onClick={() => setHintLevel((h) => h + 1)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-amber-200 bg-amber-50 text-amber-700 font-semibold text-sm hover:border-amber-300 hover:bg-amber-100 transition-all"
                >
                  <Lightbulb className="w-4 h-4" />
                  {hintLevel === 0 ? 'Hint' : 'Next hint'}
                </button>
              )}

              {/* Reveal answer button */}
              {!submitted && !revealed && (
                <button
                  onClick={handleReveal}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  Reveal Answer
                </button>
              )}

              {/* Check / Retry / Continue */}
              {!submitted && !revealed && (
                <button
                  onClick={handleCheck}
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

              {submitted && isCorrect === false && !revealed && (
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

              {submitted && (isCorrect === true || revealed) && (
                <button
                  onClick={handleContinue}
                  className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  {currentIdx + 1 >= total ? 'Finish Lab' : 'Continue'}
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                </button>
              )}
            </div>

            {/* Bottom question progress */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600">Progress</span>
                <span className="text-sm font-bold text-primary-600">
                  {score} correct
                </span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {QUESTIONS.map((q, i) => (
                  <div
                    key={q.id}
                    title={`Q${i + 1}`}
                    className={`flex-1 min-w-[20px] h-2.5 rounded-full transition-all duration-300 ${
                      correctSet.has(q.id)
                        ? 'bg-green-400'
                        : i === currentIdx
                        ? 'bg-primary-400'
                        : i < currentIdx
                        ? 'bg-gray-300'
                        : 'bg-gray-100'
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

        {/* Lessons reinforced footer */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Lessons Reinforced
          </p>
          <div className="flex flex-wrap gap-2">
            {LAB01_META.lessonsReinforced.map((l) => (
              <span
                key={l.id}
                className="text-xs font-medium text-gray-600 bg-gray-100 rounded-lg px-3 py-1.5"
              >
                Lesson {l.id}: {l.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
