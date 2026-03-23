'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, Brain, Target, Clock, Layers, FileText, ChevronRight, Zap, GraduationCap, CheckCircle, FlaskConical, ListChecks } from 'lucide-react'
import { CCNA_CURRICULUM, getAllLessons, getTotalDuration } from '../data/ccna-curriculum'
import { getOverallProgress, getStudyStreak, getFinalExamCompletion, initProgress } from '@/lib/progress'
import { useAuth } from '@/contexts/AuthContext'

const LAB_IDS = Array.from({ length: 20 }, (_, i) => `lab${String(i + 1).padStart(2, '0')}`)

export default function Home() {
  const { user, isGuest, isLoading } = useAuth()

  const allLessons   = getAllLessons()
  const totalHours   = Math.round(getTotalDuration() / 60)
  const totalModules = CCNA_CURRICULUM.length

  const [progress, setProgress]           = useState({ completedLessons: 0, totalLessons: 0, completedLabs: 0, totalLabs: 0, pct: 0 })
  const [streak, setStreak]               = useState(0)
  const [examCompleted, setExamCompleted] = useState(false)

  useEffect(() => {
    if (isLoading || (!user && !isGuest)) return
    async function load() {
      await initProgress()
      const lessonIds = allLessons.map(l => l.id)
      setProgress(getOverallProgress(lessonIds, LAB_IDS))
      setStreak(getStudyStreak())
      setExamCompleted(getFinalExamCompletion())
    }
    load()
  }, [isLoading, user, isGuest]) // eslint-disable-line react-hooks/exhaustive-deps

  // landing

  if (!isLoading && !user && !isGuest) {
    return (
      <div className="min-h-screen bg-gray-50">

        {/* hero */}
        <header className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
          {/* blobs */}
          <div className="absolute -top-16 -left-16 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-40 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5 ring-4 ring-white/10 shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">PrepNet</h1>
            <p className="text-xl text-blue-100 mb-4">Everything you need to pass the CCNA — in one place.</p>
            <p className="text-blue-300 text-sm mb-8">Free to use. No credit card. Continue as a guest anytime.</p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/login?mode=signup"
                className="px-6 py-3 rounded-xl text-sm font-semibold bg-white text-blue-700 hover:bg-blue-50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shadow-md"
              >
                Create Free Account
              </Link>
              <Link
                href="/login?mode=signin"
                className="px-6 py-3 rounded-xl text-sm font-semibold text-white border border-white/30 hover:bg-white/10 hover:border-white/50 active:scale-[0.98] transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </header>

        {/* badges */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {[
              { label: 'CCNA 200-301 Aligned' },
              { label: '100% Free' },
              { label: 'No Credit Card Required' },
              { label: 'Guest Mode Available' },
              { label: 'Progress Tracking' },
            ].map(({ label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <CheckCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-14">

          {/* stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: BookOpen, value: `${allLessons.length}+`, label: 'Lessons',          bg: 'bg-blue-50',   color: 'text-blue-600',   bold: 'text-blue-900' },
              { icon: Layers,   value: `${totalModules}`,       label: 'Modules',          bg: 'bg-green-50',  color: 'text-green-600',  bold: 'text-green-900' },
              { icon: Clock,    value: `${totalHours}+`,        label: 'Hours of Content', bg: 'bg-purple-50', color: 'text-purple-600', bold: 'text-purple-900' },
              { icon: Zap,      value: '20',                    label: 'Practice Labs',    bg: 'bg-orange-50', color: 'text-orange-600', bold: 'text-orange-900' },
            ].map(({ icon: Icon, value, label, bg, color, bold }) => (
              <div key={label} className={`${bg} rounded-xl p-5 text-center hover:scale-[1.04] hover:shadow-sm transition-all duration-200 cursor-default`}>
                <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
                <div className={`text-2xl font-bold ${bold}`}>{value}</div>
                <div className={`text-xs font-medium ${color} mt-0.5`}>{label}</div>
              </div>
            ))}
          </div>

          {/* features */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">What&apos;s inside PrepNet</h2>
            <p className="text-gray-500 text-center mb-8 text-sm">Click any feature to create your free account.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: BookOpen,
                  bg: 'bg-blue-100', color: 'text-blue-600', border: 'hover:border-blue-300',
                  title: 'Full CCNA Curriculum',
                  desc: `${allLessons.length}+ bite-sized lessons covering core CCNA 200-301 concepts — from networking fundamentals to routing, switching, and security.`,
                },
                {
                  icon: Brain,
                  bg: 'bg-green-100', color: 'text-green-600', border: 'hover:border-green-300',
                  title: 'Hands-on Practice Labs',
                  desc: '20 interactive network simulation labs with step-by-step CLI exercises. Build real configuration skills, not just theory.',
                },
                {
                  icon: Target,
                  bg: 'bg-purple-100', color: 'text-purple-600', border: 'hover:border-purple-300',
                  title: 'Knowledge Checks & AI Help',
                  desc: 'Quiz questions after every lesson to lock in what you learned. Wrong answers get a clear AI-generated explanation.',
                },
                {
                  icon: GraduationCap,
                  bg: 'bg-indigo-100', color: 'text-indigo-600', border: 'hover:border-indigo-300',
                  title: 'Final Practice Exam',
                  desc: '66 questions spanning core CCNA exam topics — timed, no hints, scored at the end. A great way to gauge your readiness.',
                },
              ].map(({ icon: Icon, bg, color, border, title, desc }) => (
                <Link
                  key={title}
                  href="/login?mode=signup"
                  className={`bg-white rounded-xl border border-gray-200 ${border} shadow-sm p-6 flex gap-4 items-start group transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}
                >
                  <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 flex-shrink-0 transition-all duration-200" />
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* how it works */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">How it works</h2>
            <p className="text-gray-500 text-center mb-10 text-sm">Three steps from zero to exam-ready.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  step: '1',
                  icon: BookOpen,
                  bg: 'bg-blue-600',
                  title: 'Study the curriculum',
                  desc: 'Work through bite-sized lessons across core CCNA concepts. Each lesson ends with a knowledge check and AI explanations for anything you miss.',
                },
                {
                  step: '2',
                  icon: FlaskConical,
                  bg: 'bg-green-600',
                  title: 'Practice in the labs',
                  desc: 'Reinforce every concept with 20 hands-on CLI labs — routing, switching, subnetting, security, and more. Step-by-step with hints.',
                },
                {
                  step: '3',
                  icon: ListChecks,
                  bg: 'bg-indigo-600',
                  title: 'Take the practice exam',
                  desc: '66 questions across all exam domains. No hints during the exam — full breakdown with explanations at the end.',
                },
              ].map(({ step, icon: Icon, bg, title, desc }) => (
                <div key={step} className="bg-white rounded-xl border shadow-sm p-6 text-center flex flex-col items-center group hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                  <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-4 shadow-sm transition-transform duration-200 group-hover:scale-110`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Step {step}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* topics */}
          <div className="bg-white rounded-xl border shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">Core topics covered</h2>
            <p className="text-gray-500 text-center text-sm mb-7">PrepNet is a study companion designed to help you build confidence across the key areas of the CCNA 200-301 exam.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                'Network Fundamentals', 'IP Addressing & Subnetting', 'IPv6',
                'VLANs & Trunking', 'Spanning Tree Protocol', 'EtherChannel',
                'IP Routing', 'OSPF', 'Static & Default Routes',
                'DHCP & DNS', 'NAT & PAT', 'NTP & Syslog',
                'ACLs', 'Security Fundamentals', 'Port Security',
                'Wireless LANs', 'WAN Concepts', 'Network Automation',
                'REST APIs & JSON', 'Cloud Fundamentals',
              ].map(topic => (
                <span
                  key={topic}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors duration-150 cursor-default"
                >
                  {topic}
                </span>
              ))}
            </div>
            <div className="mt-7 text-center">
              <Link
                href="/login?mode=signup"
                className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
              >
                Start studying all of these
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
            </div>
          </div>

        </main>
      </div>
    )
  }

  // dashboard

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 text-center">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">PrepNet</h1>
          <p className="text-lg text-gray-500">Your CCNA exam study companion — structured, clear, and built for focus.</p>
        </div>
      </header>

      <main id="main-content" className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: BookOpen, value: `${allLessons.length}+`, label: 'Lessons',          bg: 'bg-blue-50',   color: 'text-blue-600',   bold: 'text-blue-900' },
            { icon: Layers,   value: `${totalModules}`,       label: 'Modules',          bg: 'bg-green-50',  color: 'text-green-600',  bold: 'text-green-900' },
            { icon: Clock,    value: `${totalHours}+`,        label: 'Hours of Content', bg: 'bg-purple-50', color: 'text-purple-600', bold: 'text-purple-900' },
            { icon: Zap,      value: '20',                    label: 'Practice Labs',    bg: 'bg-orange-50', color: 'text-orange-600', bold: 'text-orange-900' },
          ].map(({ icon: Icon, value, label, bg, color, bold }) => (
            <div key={label} className={`${bg} rounded-xl p-5 text-center`}>
              <Icon className={`w-7 h-7 ${color} mx-auto mb-2`} />
              <div className={`text-2xl font-bold ${bold}`}>{value}</div>
              <div className={`text-xs font-medium ${color} mt-0.5`}>{label}</div>
            </div>
          ))}
        </div>

        {/* progress */}
        {(progress.completedLessons > 0 || progress.completedLabs > 0) && (
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-900">Your Progress</h2>
              {streak > 0 && (
                <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                  🔥 {streak} day streak
                </span>
              )}
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progress.pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{progress.completedLessons} of {progress.totalLessons} lessons complete</span>
              {progress.completedLabs > 0 && (
                <span>{progress.completedLabs} of {progress.totalLabs} labs complete</span>
              )}
              <span className="font-semibold text-blue-600">{progress.pct}%</span>
            </div>
          </div>
        )}

        {/* cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border shadow-sm p-5 flex flex-col">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1.5">Study Curriculum</h3>
            <p className="text-sm text-gray-500 mb-5 flex-1">Complete CCNA 200-301 curriculum with structured, bite-sized lessons.</p>
            <Link href="/curriculum" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors">
              Start Learning <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-5 flex flex-col">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1.5">Practice Labs</h3>
            <p className="text-sm text-gray-500 mb-5 flex-1">Hands-on network simulation labs with step-by-step CLI practice.</p>
            <Link href="/labs" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors">
              Open Labs <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-5 flex flex-col">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1.5">My Notes</h3>
            <p className="text-sm text-gray-500 mb-5 flex-1">All your saved study notes from every lesson in one place.</p>
            <Link href="/notes" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors">
              View Notes <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-5 flex flex-col">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1.5">Focus Tools</h3>
            <p className="text-sm text-gray-500 mb-3 flex-1">
              Built into every lesson — activate the Focus button inside any lesson to start a Pomodoro timer you can drag anywhere.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/lessons/what-is-networking"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors"
              >
                Try It in Lesson 1 <ChevronRight className="w-4 h-4" />
              </Link>
              <p className="text-xs text-gray-400 text-center">Look for the Focus button at the top of any lesson</p>
            </div>
          </div>
        </div>

        {/* exam banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Final Practice Exam</h3>
              <p className="text-sm text-indigo-200">
                {examCompleted ? '✓ Completed — 66 questions across all CCNA topics.' : '66 questions spanning core CCNA topics — a study companion to help gauge your readiness.'}
              </p>
            </div>
          </div>
          <Link href="/exam" className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-white text-indigo-700 hover:bg-indigo-50 transition-colors">
            {examCompleted ? 'Retake Exam' : 'Take Exam'} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* highlights */}
        <div className="bg-white rounded-xl border shadow-sm p-7">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Built for Effective Studying</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { icon: Clock,  bg: 'bg-blue-100',   color: 'text-blue-600',   title: 'Focus Timer',        desc: 'Pomodoro technique with 15, 25, and 45 minute focus sessions.' },
              { icon: Target, bg: 'bg-green-100',  color: 'text-green-600',  title: 'Bite-sized Lessons', desc: 'Each section is short and focused — no information overload.' },
              { icon: Brain,  bg: 'bg-purple-100', color: 'text-purple-600', title: 'Knowledge Checks',   desc: 'Quiz questions after every lesson to reinforce understanding.' },
              { icon: Zap,    bg: 'bg-orange-100', color: 'text-orange-600', title: 'Hands-on Labs',      desc: 'Interactive CLI labs reinforce every concept with real practice.' },
            ].map(({ icon: Icon, bg, color, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-0.5">{title}</h4>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
