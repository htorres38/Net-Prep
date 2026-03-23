import { supabase } from './supabase'

function dbWarn(label: string, err: unknown): void {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[db] ${label}:`, err)
  }
}

async function dbPost(action: string, params: Record<string, unknown>): Promise<void> {
  try {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...params }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      dbWarn(action, body.error ?? res.status)
    }
  } catch (e) {
    dbWarn(action, e)
  }
}

// user id

let _resolvedUserId: string | null = null
let _userPromise: Promise<string> | null = null

export async function getUserId(): Promise<string> {
  if (_resolvedUserId) return _resolvedUserId

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user?.id) {
      _resolvedUserId = session.user.id
      await dbPost('upsert_user', { userId: _resolvedUserId })
      return _resolvedUserId
    }
  } catch { /* network unavailable or SSR */ }

  const tempId = await getTempUserId()
  _resolvedUserId = tempId
  return tempId
}

export function resetUserIdCache(): void {
  _resolvedUserId = null
  _userPromise    = null
}

// temp user

export function getTempUserId(): Promise<string> {
  if (!_userPromise) _userPromise = _resolveUserId()
  return _userPromise
}

async function _resolveUserId(): Promise<string> {
  try {
    const { localDB } = await import('./localdb')
    const stored = await localDB.meta.get('userId')
    if (stored?.value) {
      await dbPost('upsert_user', { userId: stored.value })
      return stored.value
    }
  } catch { /* SSR or storage blocked */ }

  const id = crypto.randomUUID()
  try {
    const { localDB } = await import('./localdb')
    await localDB.meta.put({ key: 'userId', value: id })
  } catch { /* ignore */ }

  await dbPost('upsert_user', { userId: id })
  return id
}

// lesson progress

export async function syncLessonComplete(lessonId: string): Promise<void> {
  const userId = await getUserId()
  await dbPost('lesson_complete', { userId, lessonId })
}

// lab progress

export async function syncLabComplete(labId: string, score?: number, total?: number): Promise<void> {
  const userId = await getUserId()
  await dbPost('lab_complete', { userId, labId, score: score ?? null, total: total ?? null })
}

// final exam

export async function syncFinalExamComplete(score: number, totalQuestions: number, passed: boolean): Promise<void> {
  const userId = await getUserId()
  await dbPost('exam_complete', { userId, score, total: totalQuestions, passed })
}

// notes

export async function syncNote(lessonId: string, content: string): Promise<void> {
  if (!content.trim()) return deleteNoteFromDb(lessonId)
  const userId = await getUserId()
  await dbPost('note_upsert', { userId, lessonId, content })
}

export async function deleteNoteFromDb(lessonId: string): Promise<void> {
  const userId = await getUserId()
  await dbPost('note_delete', { userId, lessonId })
}

// streak

export async function syncStreak(currentStreak: number): Promise<void> {
  const userId = await getUserId()
  let longestStreak = currentStreak
  try {
    const { localDB } = await import('./localdb')
    const streak = await localDB.streaks.get(1)
    if (streak) longestStreak = Math.max(streak.longestStreak, currentStreak)
  } catch { /* ignore */ }
  await dbPost('streak_upsert', {
    userId,
    current:  currentStreak,
    longest:  longestStreak,
    lastDate: new Date().toISOString().slice(0, 10),
  })
}
