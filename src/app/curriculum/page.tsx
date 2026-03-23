'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, Clock, ChevronLeft, FileText, PlayCircle, GraduationCap, ChevronRight, CheckCircle } from 'lucide-react'
import { CCNA_CURRICULUM, getAllLessons, getTotalDuration } from '../../data/ccna-curriculum'
import { TOPIC_COLORS, cn, topicDot, topicBtn, topicText } from '@/lib/utils'
import { getLessonCompletion, getFinalExamCompletion, initProgress } from '@/lib/progress'

export default function CurriculumPage() {
  const router = useRouter()
  const allLessons = getAllLessons()
  const totalDuration = getTotalDuration()

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [examCompleted, setExamCompleted] = useState(false)

  useEffect(() => {
    async function load() {
      await initProgress()
      const ids = new Set<string>()
      for (const lesson of allLessons) {
        if (getLessonCompletion(lesson.id)) ids.add(lesson.id)
      }
      setCompletedIds(ids)
      setExamCompleted(getFinalExamCompletion())
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const completedCount = completedIds.size
  const totalCount = allLessons.length
  const overallPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="bg-white border-b shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Back to home"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">CCNA Curriculum</h1>
                <p className="text-xs text-gray-500">200-301 Exam Preparation</p>
              </div>
            </div>

            <Link
              href="/notes"
              className="flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">My Notes</span>
            </Link>
          </div>
        </div>
      </header>

      {/* stats */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{completedCount} / {totalCount}</div>
              <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-0.5">
                <BookOpen className="w-3 h-3" /> Lessons Done
              </div>
            </div>
            <div className="text-center border-x border-gray-100">
              <div className="text-xl font-bold text-gray-900">{Math.round(totalDuration / 60)}h</div>
              <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" /> Study Time
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{overallPct}%</div>
              <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-0.5">
                <CheckCircle className="w-3 h-3" /> Complete
              </div>
            </div>
          </div>

          {/* progress bar */}
          {completedCount > 0 && (
            <div className="mt-3">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
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
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-10">
          {CCNA_CURRICULUM.map(module => {
            const color = TOPIC_COLORS[module.color] ?? 'blue'
            const moduleIds = module.lessons.map(l => l.id)
            const moduleCompleted = moduleIds.filter(id => completedIds.has(id)).length
            const modProgress = {
              completed: moduleCompleted,
              total: moduleIds.length,
              pct: moduleIds.length > 0 ? Math.round((moduleCompleted / moduleIds.length) * 100) : 0,
            }

            return (
              <section key={module.id}>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className={cn('w-3 h-3 rounded-full flex-shrink-0', topicDot(color))} />
                      <h2 className="text-xl font-bold text-gray-900">{module.title}</h2>
                      <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">
                        {module.examWeight}% of exam
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 ml-5.5 pl-0.5">{module.description}</p>
                  </div>
                  <div className="text-right text-xs text-gray-400 flex-shrink-0 ml-4">
                    <div>{modProgress.completed}/{module.lessons.length} lessons</div>
                    <div>{Math.round(module.totalDuration / 60)}h</div>
                    {modProgress.completed > 0 && (
                      <div className="mt-1 h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden ml-auto">
                        <div
                          className="h-full bg-green-400 rounded-full transition-all duration-500"
                          style={{ width: `${modProgress.pct}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {module.lessons.map(lesson => {
                    const isCompleted = completedIds.has(lesson.id)
                    return (
                      <div
                        key={lesson.id}
                        className={cn(
                          'bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 p-5',
                          isCompleted && 'border-green-200'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate mb-0.5">{lesson.title}</h3>
                            <span className={cn('text-xs font-medium', topicText(color))}>
                              {module.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {isCompleted && (
                              <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3" /> Done
                              </span>
                            )}
                            {lesson.videoUrl && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs font-medium">
                                <PlayCircle className="w-3 h-3" />
                                Video
                              </span>
                            )}
                            <span className={cn(
                              'px-2 py-0.5 text-xs font-semibold rounded-full',
                              lesson.difficulty === 'beginner'     ? 'bg-green-100 text-green-700' :
                              lesson.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700' :
                                                                     'bg-red-100 text-red-700'
                            )}>
                              {lesson.difficulty}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{lesson.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />{lesson.duration} min
                            </span>
                          </div>

                          <Link
                            href={`/lessons/${lesson.id}`}
                            className={cn('px-4 py-2 rounded-lg text-sm font-semibold transition-colors', topicBtn(color))}
                          >
                            {isCompleted ? 'Review' : 'Start Lesson'}
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
