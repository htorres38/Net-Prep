// cache

interface Cache {
  lessons:     Set<string>
  labs:        Map<string, { score?: number; total?: number }>
  finalExam:   boolean
  streak:      { current: number; longest: number; lastDate: string }
  initialized: boolean
}

const _cache: Cache = {
  lessons:     new Set(),
  labs:        new Map(),
  finalExam:   false,
  streak:      { current: 0, longest: 0, lastDate: '' },
  initialized: false,
}

let _initPromise: Promise<void> | null = null

// init

export async function initProgress(): Promise<void> {
  if (_cache.initialized) return
  if (_initPromise) return _initPromise
  _initPromise = _loadFromDB()
  return _initPromise
}

async function _loadFromDB(): Promise<void> {
  try {
    const { localDB } = await import('./localdb')

    const migrated = await localDB.meta.get('migrated_v1')
    if (!migrated) {
      await _migrateFromLocalStorage(localDB)
      await localDB.meta.put({ key: 'migrated_v1', value: 'true' })
    }

    const [lessons, labs, exam, streak] = await Promise.all([
      localDB.lessons.toArray(),
      localDB.labs.toArray(),
      localDB.finalExam.get(1),
      localDB.streaks.get(1),
    ])

    for (const r of lessons) _cache.lessons.add(r.lessonId)
    for (const r of labs) _cache.labs.set(r.labId, { score: r.score, total: r.totalQuestions })
    _cache.finalExam = !!exam
    if (streak) {
      _cache.streak = {
        current:  streak.currentStreak,
        longest:  streak.longestStreak,
        lastDate: streak.lastStudyDate,
      }
    }
  } catch {
    // SSR or IndexedDB unavailable
  } finally {
    _cache.initialized = true
  }
}

async function _migrateFromLocalStorage(
  localDB: Awaited<typeof import('./localdb')>['localDB'],
): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    // lessons
    const lessonPuts: { lessonId: string; completedAt: string }[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('lesson_') && key.endsWith('_completed') && localStorage.getItem(key) === 'true') {
        const lessonId = key.slice('lesson_'.length, -'_completed'.length)
        lessonPuts.push({ lessonId, completedAt: new Date().toISOString() })
      }
    }
    if (lessonPuts.length) await localDB.lessons.bulkPut(lessonPuts)

    // labs
    const labPuts: { labId: string; completedAt: string }[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('lab_') && key.endsWith('_completed') && localStorage.getItem(key) === 'true') {
        const labId = key.slice('lab_'.length, -'_completed'.length)
        labPuts.push({ labId, completedAt: new Date().toISOString() })
      }
    }
    if (labPuts.length) await localDB.labs.bulkPut(labPuts)

    // final exam
    if (localStorage.getItem('final_exam_completed') === 'true') {
      await localDB.finalExam.put({ id: 1, score: 0, totalQuestions: 66, passed: true, completedAt: new Date().toISOString() })
    }

    // streak
    const streakCount  = parseInt(localStorage.getItem('study_streak_count')   ?? '0', 10) || 0
    const streakDate   = localStorage.getItem('study_streak_last_date') ?? ''
    const longestCount = parseInt(localStorage.getItem('study_streak_longest') ?? '0', 10) || 0
    if (streakCount > 0 || streakDate) {
      await localDB.streaks.put({
        id:            1,
        currentStreak: streakCount,
        longestStreak: Math.max(longestCount, streakCount),
        lastStudyDate: streakDate,
      })
    }

    // notes
    const notePuts: { lessonId: string; content: string; lastUpdated: string }[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith('lesson-notes-')) continue
      const lessonId = key.slice('lesson-notes-'.length)
      const raw      = localStorage.getItem(key)
      if (!raw) continue
      let content     = raw
      let lastUpdated = new Date().toLocaleDateString()
      try {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object' && 'content' in parsed) {
          content     = parsed.content
          lastUpdated = parsed.lastUpdated ?? lastUpdated
        }
      } catch { /* plain string */ }
      if (content.trim()) notePuts.push({ lessonId, content, lastUpdated })
    }
    if (notePuts.length) await localDB.notes.bulkPut(notePuts)

    // lab step progress
    const labProgress = localStorage.getItem('lab-progress')
    if (labProgress) {
      const parsed = JSON.parse(labProgress) as Record<string, string[]>
      await localDB.labSteps.bulkPut(
        Object.entries(parsed).map(([labId, completedSteps]) => ({ labId, completedSteps }))
      )
    }

    // user id
    const userId = localStorage.getItem('ccna_temp_user_id')
    if (userId) await localDB.meta.put({ key: 'userId', value: userId })

  } catch { /* ignore migration errors */ }
}

if (typeof window !== 'undefined') {
  initProgress().catch(() => {})
}

// helpers

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

// lesson

export function getLessonCompletion(lessonId: string): boolean {
  return _cache.lessons.has(lessonId)
}

export function setLessonCompletion(lessonId: string): void {
  _cache.lessons.add(lessonId)
  import('./localdb').then(({ localDB }) =>
    localDB.lessons.put({ lessonId, completedAt: new Date().toISOString() })
  ).catch(() => {})
  touchStudyStreak()
  import('./db').then(({ syncLessonComplete }) => syncLessonComplete(lessonId)).catch(() => {})
}

// lab

export function getLabCompletion(labId: string): boolean {
  return _cache.labs.has(labId)
}

export function setLabCompletion(labId: string, score?: number, total?: number): void {
  _cache.labs.set(labId, { score, total })
  import('./localdb').then(({ localDB }) =>
    localDB.labs.put({ labId, score, totalQuestions: total, completedAt: new Date().toISOString() })
  ).catch(() => {})
  touchStudyStreak()
  import('./db').then(({ syncLabComplete }) => syncLabComplete(labId, score, total)).catch(() => {})
}

// exam

export function getFinalExamCompletion(): boolean {
  return _cache.finalExam
}

export function setFinalExamCompletion(score: number, total: number): void {
  const passed = Math.round((score / total) * 100) >= 70
  _cache.finalExam = true
  import('./localdb').then(({ localDB }) =>
    localDB.finalExam.put({ id: 1, score, totalQuestions: total, passed, completedAt: new Date().toISOString() })
  ).catch(() => {})
  touchStudyStreak()
  import('./db').then(({ syncFinalExamComplete }) => syncFinalExamComplete(score, total, passed)).catch(() => {})
}

// module progress

export interface ModuleProgress {
  completed: number
  total:     number
  pct:       number
}

export function getModuleProgress(lessonIds: string[]): ModuleProgress {
  const total     = lessonIds.length
  const completed = lessonIds.filter(id => getLessonCompletion(id)).length
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0
  return { completed, total, pct }
}

// overall progress

export interface OverallProgress {
  completedLessons: number
  totalLessons:     number
  completedLabs:    number
  totalLabs:        number
  pct:              number
}

export function getOverallProgress(
  lessonIds: string[],
  labIds:    string[],
): OverallProgress {
  const completedLessons = lessonIds.filter(id => getLessonCompletion(id)).length
  const completedLabs    = labIds.filter(id => getLabCompletion(id)).length
  const total            = lessonIds.length + labIds.length
  const completed        = completedLessons + completedLabs
  const pct              = total > 0 ? Math.round((completed / total) * 100) : 0
  return { completedLessons, totalLessons: lessonIds.length, completedLabs, totalLabs: labIds.length, pct }
}

// streak

export function getStudyStreak(): number {
  return _cache.streak.current
}

export function touchStudyStreak(): void {
  const today                          = todayStr()
  const { current, longest, lastDate } = _cache.streak

  if (lastDate === today) {
    import('./db').then(({ syncStreak }) => syncStreak(current)).catch(() => {})
    return
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  const newStreak  = lastDate === yesterdayStr ? current + 1 : 1
  const newLongest = Math.max(longest, newStreak)

  _cache.streak = { current: newStreak, longest: newLongest, lastDate: today }

  import('./localdb').then(({ localDB }) =>
    localDB.streaks.put({
      id:            1,
      currentStreak:  newStreak,
      longestStreak:  newLongest,
      lastStudyDate:  today,
    })
  ).catch(() => {})

  import('./db').then(({ syncStreak }) => syncStreak(newStreak)).catch(() => {})
}

// clear

export async function clearLocalProgress(): Promise<void> {
  _cache.lessons     = new Set()
  _cache.labs        = new Map()
  _cache.finalExam   = false
  _cache.streak      = { current: 0, longest: 0, lastDate: '' }
  _cache.initialized = false
  _initPromise       = null

  const { localDB } = await import('./localdb')
  await Promise.all([
    localDB.lessons.clear(),
    localDB.labs.clear(),
    localDB.finalExam.clear(),
    localDB.streaks.clear(),
    localDB.labSteps.clear(),
    localDB.notes.clear(),
  ])
}
