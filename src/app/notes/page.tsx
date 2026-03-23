'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, FileText, Trash2, Edit3, BookOpen, Calendar } from 'lucide-react'
import { getAllLessons } from '../../data/ccna-curriculum'
import { syncNote, deleteNoteFromDb } from '@/lib/db'
import { useQuery } from '@powersync/react'

interface SavedNote {
  lessonId: string
  lessonTitle: string
  notes: string
  lastUpdated: string
}

export default function NotesPage() {
  const router = useRouter()
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([])
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [isClient, setIsClient] = useState(false)

  const allLessons = getAllLessons()

  // PowerSync reactive query — auto-updates when data syncs from backend
  const { data: psNotes = [] } = useQuery<{ lesson_id: string; content: string; updated_at: string }>(
    'SELECT lesson_id, content, updated_at FROM notes WHERE content != \'\' ORDER BY updated_at DESC'
  )

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Use PowerSync data when available, otherwise fall back to Dexie
  useEffect(() => {
    if (psNotes.length > 0) {
      const notes: SavedNote[] = psNotes.flatMap(n => {
        const lesson = allLessons.find(l => l.id === n.lesson_id)
        if (!lesson) return []
        return [{ lessonId: n.lesson_id, lessonTitle: lesson.title, notes: n.content, lastUpdated: n.updated_at ?? '' }]
      })
      setSavedNotes(notes.sort((a, b) => a.lessonTitle.localeCompare(b.lessonTitle)))
    }
  }, [psNotes])

  useEffect(() => {
    if (isClient) {
      loadAllNotes()
    }
  }, [isClient])

  const loadAllNotes = async () => {
    try {
      const { localDB } = await import('@/lib/localdb')
      const all = await localDB.notes.toArray()
      const notes: SavedNote[] = all
        .filter(n => n.content.trim())
        .flatMap(n => {
          const lesson = allLessons.find(l => l.id === n.lessonId)
          if (!lesson) return []
          return [{ lessonId: n.lessonId, lessonTitle: lesson.title, notes: n.content, lastUpdated: n.lastUpdated }]
        })
      setSavedNotes(notes.sort((a, b) => a.lessonTitle.localeCompare(b.lessonTitle)))
    } catch {
      setSavedNotes([])
    }
  }

  const deleteNote = async (lessonId: string) => {
    if (confirm('Are you sure you want to delete these notes?')) {
      try {
        const { localDB } = await import('@/lib/localdb')
        await localDB.notes.delete(lessonId)
      } catch { /* ignore */ }
      deleteNoteFromDb(lessonId).catch(() => {})
      loadAllNotes()
    }
  }

  const startEditing = (note: SavedNote) => {
    setEditingNoteId(note.lessonId)
    setEditText(note.notes)
  }

  const saveEdit = async (lessonId: string) => {
    try {
      const { localDB } = await import('@/lib/localdb')
      const lastUpdated = new Date().toLocaleDateString()
      if (editText.trim()) {
        await localDB.notes.put({ lessonId, content: editText, lastUpdated })
      } else {
        await localDB.notes.delete(lessonId)
      }
    } catch { /* ignore */ }
    syncNote(lessonId, editText).catch(() => {})
    setEditingNoteId(null)
    loadAllNotes()
  }

  const cancelEdit = () => {
    setEditingNoteId(null)
    setEditText('')
  }

  return (
    <>
      {!isClient ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notes...</p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  My Study Notes
                </h1>
                <p className="text-sm text-gray-600">{savedNotes.length} saved note{savedNotes.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {savedNotes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No notes saved yet</h2>
            <p className="text-gray-600 mb-6">Start taking notes in lessons to see them here.</p>
            <button
              onClick={() => router.push('/curriculum')}
              className="btn-primary"
            >
              Browse Lessons
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {savedNotes.map((note) => (
              <div key={note.lessonId} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      {note.lessonTitle}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span suppressHydrationWarning>Last updated: {note.lastUpdated}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/lessons/${note.lessonId}`)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Open Lesson
                    </button>
                    <button
                      onClick={() => startEditing(note)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="Edit note"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.lessonId)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {editingNoteId === note.lessonId ? (
                  <div className="space-y-3">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Edit your notes..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(note.lessonId)}
                        className="btn-primary text-sm"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="btn-secondary text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="whitespace-pre-wrap text-gray-700">
                      {note.notes || 'No notes content'}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
      )}
    </>
  )
}