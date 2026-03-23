import { column, Schema, Table } from '@powersync/web'

const lesson_progress = new Table({
  user_id:      column.text,
  lesson_id:    column.text,
  completed_at: column.text,
})

const lab_progress = new Table({
  user_id:         column.text,
  lab_id:          column.text,
  completed_at:    column.text,
  score:           column.integer,
  total_questions: column.integer,
})

const notes = new Table({
  user_id:    column.text,
  lesson_id:  column.text,
  content:    column.text,
  updated_at: column.text,
})

const study_streaks = new Table({
  user_id:         column.text,
  current_streak:  column.integer,
  longest_streak:  column.integer,
  last_study_date: column.text,
  updated_at:      column.text,
})

const final_exam_results = new Table({
  user_id:         column.text,
  score:           column.integer,
  total_questions: column.integer,
  passed:          column.integer,
  completed_at:    column.text,
})

export const AppSchema = new Schema({
  lesson_progress,
  lab_progress,
  notes,
  study_streaks,
  final_exam_results,
})

export type Database = (typeof AppSchema)['types']
