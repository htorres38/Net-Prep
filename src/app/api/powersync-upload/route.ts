import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

function getNeonClient() {
  const url = (process.env.NEON_DATABASE_URL ?? '').replace(/[?&]channel_binding=[^&]*/g, '').replace(/\?$/, '')
  return neon(url)
}

export async function POST(req: NextRequest) {
  if (!process.env.NEON_DATABASE_URL) {
    return NextResponse.json({ error: 'NEON_DATABASE_URL not set' }, { status: 500 })
  }

  const sql = getNeonClient()
  const { ops } = await req.json()

  try {
    for (const op of ops) {
      const { table, id, opData, op: opType } = op
      const d = opData ?? {}

      // Ensure user row exists before any FK-constrained write
      if (d.user_id) {
        await sql`INSERT INTO users (id) VALUES (${d.user_id}) ON CONFLICT (id) DO NOTHING`
      }

      if (opType === 'PUT' || opType === 'PATCH') {
        switch (table) {
          case 'lesson_progress':
            await sql`
              INSERT INTO lesson_progress (id, user_id, lesson_id, completed_at)
              VALUES (${id}, ${d.user_id}, ${d.lesson_id}, ${d.completed_at ?? new Date().toISOString()})
              ON CONFLICT (user_id, lesson_id) DO NOTHING`
            break
          case 'lab_progress':
            await sql`
              INSERT INTO lab_progress (id, user_id, lab_id, score, total_questions, completed_at)
              VALUES (${id}, ${d.user_id}, ${d.lab_id}, ${d.score}, ${d.total_questions}, ${d.completed_at ?? new Date().toISOString()})
              ON CONFLICT (user_id, lab_id) DO UPDATE SET
                score = EXCLUDED.score,
                total_questions = EXCLUDED.total_questions`
            break
          case 'notes':
            await sql`
              INSERT INTO notes (id, user_id, lesson_id, content, updated_at)
              VALUES (${id}, ${d.user_id}, ${d.lesson_id}, ${d.content}, ${d.updated_at ?? new Date().toISOString()})
              ON CONFLICT (user_id, lesson_id) DO UPDATE SET
                content = EXCLUDED.content,
                updated_at = EXCLUDED.updated_at`
            break
          case 'final_exam_results':
            await sql`
              INSERT INTO final_exam_results (id, user_id, score, total_questions, passed, completed_at)
              VALUES (${id}, ${d.user_id}, ${d.score}, ${d.total_questions}, ${d.passed}, ${d.completed_at ?? new Date().toISOString()})
              ON CONFLICT (user_id) DO UPDATE SET
                score = EXCLUDED.score,
                total_questions = EXCLUDED.total_questions,
                passed = EXCLUDED.passed`
            break
        }
      } else if (opType === 'DELETE') {
        switch (table) {
          case 'lesson_progress':
            await sql`DELETE FROM lesson_progress WHERE id = ${id}`
            break
          case 'lab_progress':
            await sql`DELETE FROM lab_progress WHERE id = ${id}`
            break
          case 'notes':
            await sql`DELETE FROM notes WHERE id = ${id}`
            break
          case 'final_exam_results':
            await sql`DELETE FROM final_exam_results WHERE id = ${id}`
            break
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[powersync-upload]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
