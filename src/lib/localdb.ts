import Dexie, { type Table } from 'dexie'

// table shapes

export interface LessonRecord {
  lessonId:    string
  completedAt: string
}

export interface LabRecord {
  labId:          string
  score?:         number
  totalQuestions?: number
  completedAt:    string
}

export interface FinalExamRecord {
  id:             1
  score:          number
  totalQuestions: number
  passed:         boolean
  completedAt:    string
}

export interface NoteRecord {
  lessonId:    string
  content:     string
  lastUpdated: string
}

export interface StreakRecord {
  id:            1
  currentStreak: number
  longestStreak: number
  lastStudyDate: string
}

export interface LabStepRecord {
  labId:          string
  completedSteps: string[]
}

export interface MetaRecord {
  key:   string
  value: string
}

// db

class CCNADB extends Dexie {
  lessons!:   Table<LessonRecord,   string>
  labs!:      Table<LabRecord,      string>
  finalExam!: Table<FinalExamRecord, number>
  notes!:     Table<NoteRecord,     string>
  streaks!:   Table<StreakRecord,   number>
  labSteps!:  Table<LabStepRecord,  string>
  meta!:      Table<MetaRecord,     string>

  constructor() {
    super('ccna-study-db')
    this.version(1).stores({
      lessons:   'lessonId',
      labs:      'labId',
      finalExam: 'id',
      notes:     'lessonId',
      streaks:   'id',
      labSteps:  'labId',
      meta:      'key',
    })
  }
}

export const localDB = new CCNADB()
