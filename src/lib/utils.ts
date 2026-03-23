import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// durations
export const FOCUS_DURATIONS = {
  short: 15 * 60 * 1000,
  medium: 25 * 60 * 1000,
  long: 45 * 60 * 1000,
} as const

export const BREAK_DURATIONS = {
  short: 5 * 60 * 1000,
  medium: 15 * 60 * 1000,
  long: 30 * 60 * 1000,
} as const

export function formatTime(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / 60000)
  const seconds = Math.floor((milliseconds % 60000) / 1000)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function calculateProgress(completed: number, total: number): number {
  return Math.min(100, (completed / total) * 100)
}

export const GENTLE_TRANSITION = 'transition-all duration-300 ease-out'
export const FOCUS_RING = 'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'

// colors
export const TOPIC_COLORS = {
  'network-fundamentals': 'blue',
  'network-access': 'green',
  'ip-connectivity': 'purple',
  'ip-services': 'orange',
  'security-fundamentals': 'red',
  'automation': 'indigo',
} as const

export type TopicColor = keyof typeof TOPIC_COLORS

export const DIFFICULTY_LEVELS = {
  beginner: { label: 'Beginner', color: 'green' },
  intermediate: { label: 'Intermediate', color: 'yellow' },
  advanced: { label: 'Advanced', color: 'red' },
} as const

export type DifficultyLevel = keyof typeof DIFFICULTY_LEVELS

// color helpers
const _bgLight: Record<string, string> = {
  blue: 'bg-blue-50',     green: 'bg-green-50',   purple: 'bg-purple-50',
  orange: 'bg-orange-50', red: 'bg-red-50',        indigo: 'bg-indigo-50',
}
const _bgMed: Record<string, string> = {
  blue: 'bg-blue-100',     green: 'bg-green-100',   purple: 'bg-purple-100',
  orange: 'bg-orange-100', red: 'bg-red-100',        indigo: 'bg-indigo-100',
}
const _bg: Record<string, string> = {
  blue: 'bg-blue-600',     green: 'bg-green-600',   purple: 'bg-purple-600',
  orange: 'bg-orange-600', red: 'bg-red-600',        indigo: 'bg-indigo-600',
}
const _text: Record<string, string> = {
  blue: 'text-blue-600',     green: 'text-green-600',   purple: 'text-purple-600',
  orange: 'text-orange-600', red: 'text-red-600',        indigo: 'text-indigo-600',
}
const _textDark: Record<string, string> = {
  blue: 'text-blue-700',     green: 'text-green-700',   purple: 'text-purple-700',
  orange: 'text-orange-700', red: 'text-red-700',        indigo: 'text-indigo-700',
}
const _border: Record<string, string> = {
  blue: 'border-blue-500',     green: 'border-green-500',   purple: 'border-purple-500',
  orange: 'border-orange-500', red: 'border-red-500',        indigo: 'border-indigo-500',
}
const _borderLight: Record<string, string> = {
  blue: 'border-blue-200',     green: 'border-green-200',   purple: 'border-purple-200',
  orange: 'border-orange-200', red: 'border-red-200',        indigo: 'border-indigo-200',
}
const _dot: Record<string, string> = {
  blue: 'bg-blue-500',     green: 'bg-green-500',   purple: 'bg-purple-500',
  orange: 'bg-orange-500', red: 'bg-red-500',        indigo: 'bg-indigo-500',
}

export const topicBgLight   = (c: string) => _bgLight[c]   ?? 'bg-gray-50'
export const topicBgMed     = (c: string) => _bgMed[c]     ?? 'bg-gray-100'
export const topicBg        = (c: string) => _bg[c]        ?? 'bg-gray-600'
export const topicText      = (c: string) => _text[c]      ?? 'text-gray-600'
export const topicTextDark  = (c: string) => _textDark[c]  ?? 'text-gray-700'
export const topicBorder    = (c: string) => _border[c]    ?? 'border-gray-500'
export const topicDot       = (c: string) => _dot[c]       ?? 'bg-gray-500'

export const topicBadge = (c: string) =>
  `${_bgMed[c] ?? 'bg-gray-100'} ${_textDark[c] ?? 'text-gray-700'}`

export const topicBtn = (c: string) => {
  const map: Record<string, string> = {
    blue:   'bg-blue-600 hover:bg-blue-700 text-white',
    green:  'bg-green-600 hover:bg-green-700 text-white',
    purple: 'bg-purple-600 hover:bg-purple-700 text-white',
    orange: 'bg-orange-600 hover:bg-orange-700 text-white',
    red:    'bg-red-600 hover:bg-red-700 text-white',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  }
  return map[c] ?? 'bg-gray-600 hover:bg-gray-700 text-white'
}

export const topicAccent = (c: string) =>
  `${_border[c] ?? 'border-gray-500'} ${_bgLight[c] ?? 'bg-gray-50'}`

export const topicCard = (c: string) =>
  `${_borderLight[c] ?? 'border-gray-200'} ${_bgLight[c] ?? 'bg-gray-50'}`
