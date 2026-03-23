import { supabase } from './supabase'

// logging

function dbWarn(label: string, err: unknown): void {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[db] ${label}:`, err)
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
      supabase
        .from('users')
        .upsert({ id: _resolvedUserId }, { onConflict: 'id' })
        .then(() => {}, () => {})
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
  if (!_userPromise) {
    _userPromise = _resolveUserId()
  }
  return _userPromise
}

async function _resolveUserId(): Promise<string> {
  try {
    const { localDB } = await import('./localdb')
    const stored = await localDB.meta.get('userId')
    if (stored?.value) return stored.value
  } catch { /* SSR or storage blocked */ }

  const id = crypto.randomUUID()
  try {
    const { localDB } = await import('./localdb')
    await localDB.meta.put({ key: 'userId', value: id })
  } catch { /* ignore */ }

  try {
    const { error } = await supabase.from('users').insert({ id })
    if (error) {
      dbWarn('users.insert', error)
      _userPromise = null
    }
  } catch (e) {
    dbWarn('users.insert exception', e)
    _userPromise = null
  }

  return id
}

// lesson progress

export async function syncLessonComplete(lessonId: string): Promise<void> {
  try {
    const userId = await getUserId()
    const { error } = await supabase
      .from('lesson_progress')
      .upsert({ user_id: userId, lesson_id: lessonId }, { onConflict: 'user_id,lesson_id' })
    if (error) dbWarn('lesson_progress.upsert', error)
  } catch (e) { dbWarn('syncLessonComplete', e) }
}

// lab progress

export async function syncLabComplete(
  labId: string,
  score?: number,
  total?: number,
): Promise<void> {
  try {
    const userId = await getUserId()
    const { error } = await supabase
      .from('lab_progress')
      .upsert(
        {
          user_id: userId,
          lab_id: labId,
          score: score ?? null,
          total_questions: total ?? null,
        },
        { onConflict: 'user_id,lab_id' },
      )
    if (error) dbWarn('lab_progress.upsert', error)
  } catch (e) { dbWarn('syncLabComplete', e) }
}

// final exam

export async function syncFinalExamComplete(
  score: number,
  totalQuestions: number,
  passed: boolean,
): Promise<void> {
  try {
    const userId = await getUserId()
    const { error } = await supabase
      .from('final_exam_results')
      .upsert(
        { user_id: userId, score, total_questions: totalQuestions, passed },
        { onConflict: 'user_id' },
      )
    if (error) dbWarn('final_exam_results.upsert', error)
  } catch (e) { dbWarn('syncFinalExamComplete', e) }
}

// notes

export async function syncNote(lessonId: string, content: string): Promise<void> {
  if (!content.trim()) {
    return deleteNoteFromDb(lessonId)
  }
  try {
    const userId = await getUserId()
    const { error } = await supabase
      .from('notes')
      .upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          content,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,lesson_id' },
      )
    if (error) dbWarn('notes.upsert', error)
  } catch (e) { dbWarn('syncNote', e) }
}

export async function deleteNoteFromDb(lessonId: string): Promise<void> {
  try {
    const userId = await getUserId()
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
    if (error) dbWarn('notes.delete', error)
  } catch (e) { dbWarn('deleteNoteFromDb', e) }
}

// streak

export async function syncStreak(currentStreak: number): Promise<void> {
  try {
    const userId = await getUserId()

    let longestStreak = currentStreak
    try {
      const { localDB } = await import('./localdb')
      const streak = await localDB.streaks.get(1)
      if (streak) longestStreak = Math.max(streak.longestStreak, currentStreak)
    } catch { /* ignore */ }

    const { error } = await supabase
      .from('study_streaks')
      .upsert(
        {
          user_id: userId,
          current_streak: currentStreak,
          longest_streak: longestStreak,
          last_study_date: new Date().toISOString().slice(0, 10),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
    if (error) dbWarn('study_streaks.upsert', error)
  } catch (e) { dbWarn('syncStreak', e) }
}
