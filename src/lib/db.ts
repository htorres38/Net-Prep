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

// Write to PowerSync local SQLite — queues for upload when offline, syncs when online
async function psExecute(query: string, params: unknown[]): Promise<boolean> {
  try {
    const { getPowerSyncDb } = await import('./powersync/db')
    const db = getPowerSyncDb()
    if (!db) return false
    await db.execute(query, params)
    return true
  } catch {
    return false
  }
}

// Get existing row ID from PowerSync local DB (for upserts)
async function psGetId(table: string, where: string, params: unknown[]): Promise<string> {
  try {
    const { getPowerSyncDb } = await import('./powersync/db')
    const db = getPowerSyncDb()
    if (!db) return crypto.randomUUID()
    const row = await db.getOptional(`SELECT id FROM ${table} WHERE ${where}`, params) as { id: string } | null
    return row?.id ?? crypto.randomUUID()
  } catch {
    return crypto.randomUUID()
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
  const wrote = await psExecute(
    'INSERT OR IGNORE INTO lesson_progress (id, user_id, lesson_id, completed_at) VALUES (?, ?, ?, ?)',
    [crypto.randomUUID(), userId, lessonId, new Date().toISOString()]
  )
  if (!wrote) await dbPost('lesson_complete', { userId, lessonId })
}

// lab progress

export async function syncLabComplete(labId: string, score?: number, total?: number): Promise<void> {
  const userId = await getUserId()
  const id = await psGetId('lab_progress', 'user_id = ? AND lab_id = ?', [userId, labId])
  const wrote = await psExecute(
    'INSERT OR REPLACE INTO lab_progress (id, user_id, lab_id, score, total_questions, completed_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, userId, labId, score ?? null, total ?? null, new Date().toISOString()]
  )
  if (!wrote) await dbPost('lab_complete', { userId, labId, score: score ?? null, total: total ?? null })
}

// final exam

export async function syncFinalExamComplete(score: number, totalQuestions: number, passed: boolean): Promise<void> {
  const userId = await getUserId()
  const id = await psGetId('final_exam_results', 'user_id = ?', [userId])
  const wrote = await psExecute(
    'INSERT OR REPLACE INTO final_exam_results (id, user_id, score, total_questions, passed, completed_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, userId, score, totalQuestions, passed ? 1 : 0, new Date().toISOString()]
  )
  if (!wrote) await dbPost('exam_complete', { userId, score, total: totalQuestions, passed })
}

// notes

export async function syncNote(lessonId: string, content: string): Promise<void> {
  if (!content.trim()) return deleteNoteFromDb(lessonId)
  const userId = await getUserId()
  const id = await psGetId('notes', 'user_id = ? AND lesson_id = ?', [userId, lessonId])
  const wrote = await psExecute(
    'INSERT OR REPLACE INTO notes (id, user_id, lesson_id, content, updated_at) VALUES (?, ?, ?, ?, ?)',
    [id, userId, lessonId, content, new Date().toISOString()]
  )
  if (!wrote) await dbPost('note_upsert', { userId, lessonId, content })
}

export async function deleteNoteFromDb(lessonId: string): Promise<void> {
  const userId = await getUserId()
  const wrote = await psExecute(
    'DELETE FROM notes WHERE user_id = ? AND lesson_id = ?',
    [userId, lessonId]
  )
  if (!wrote) await dbPost('note_delete', { userId, lessonId })
}

// streak — streak table uses user_id as PK in Neon (no id), keep direct API

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
