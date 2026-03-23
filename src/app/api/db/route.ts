import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

const sql = neon(process.env.NEON_DATABASE_URL!)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action } = body

  try {
    switch (action) {
      case 'upsert_user':
        await sql`INSERT INTO users (id) VALUES (${body.userId}) ON CONFLICT (id) DO NOTHING`
        break
      case 'lesson_complete':
        await sql`INSERT INTO lesson_progress (id, user_id, lesson_id) VALUES (gen_random_uuid(), ${body.userId}, ${body.lessonId}) ON CONFLICT (user_id, lesson_id) DO NOTHING`
        break
      case 'lab_complete':
        await sql`INSERT INTO lab_progress (id, user_id, lab_id, score, total_questions) VALUES (gen_random_uuid(), ${body.userId}, ${body.labId}, ${body.score}, ${body.total}) ON CONFLICT (user_id, lab_id) DO UPDATE SET score = EXCLUDED.score, total_questions = EXCLUDED.total_questions`
        break
      case 'exam_complete':
        await sql`INSERT INTO final_exam_results (id, user_id, score, total_questions, passed) VALUES (gen_random_uuid(), ${body.userId}, ${body.score}, ${body.total}, ${body.passed}) ON CONFLICT (user_id) DO UPDATE SET score = EXCLUDED.score, total_questions = EXCLUDED.total_questions, passed = EXCLUDED.passed`
        break
      case 'note_upsert':
        await sql`INSERT INTO notes (id, user_id, lesson_id, content) VALUES (gen_random_uuid(), ${body.userId}, ${body.lessonId}, ${body.content}) ON CONFLICT (user_id, lesson_id) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()`
        break
      case 'note_delete':
        await sql`DELETE FROM notes WHERE user_id = ${body.userId} AND lesson_id = ${body.lessonId}`
        break
      case 'streak_upsert':
        await sql`INSERT INTO study_streaks (user_id, current_streak, longest_streak, last_study_date) VALUES (${body.userId}, ${body.current}, ${body.longest}, ${body.lastDate}) ON CONFLICT (user_id) DO UPDATE SET current_streak = EXCLUDED.current_streak, longest_streak = EXCLUDED.longest_streak, last_study_date = EXCLUDED.last_study_date, updated_at = NOW()`
        break
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[db api]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET() {
  try {
    await sql`SELECT 1`
    return NextResponse.json({ ok: true, url: process.env.NEON_DATABASE_URL ? 'set' : 'MISSING' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, error: msg, url: process.env.NEON_DATABASE_URL ? 'set' : 'MISSING' }, { status: 500 })
  }
}
