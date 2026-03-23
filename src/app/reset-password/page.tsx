'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth()
  const router = useRouter()

  const [ready,        setReady]        = useState(false)
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [submitting,   setSubmitting]   = useState(false)
  const [done,         setDone]         = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setSubmitting(true)
    const { error: authError } = await updatePassword(password)
    setSubmitting(false)

    if (authError) { setError(authError); return }
    setDone(true)
    setTimeout(() => router.replace('/'), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">

      {/* brand */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-md">
          <BookOpen className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">PrepNet</h1>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl border shadow-sm p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Set a new password</h2>

        {done ? (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3.5 py-2.5 mt-4">
            Password updated! Redirecting you…
          </p>
        ) : !ready ? (
          <p className="text-sm text-gray-500 mt-3">
            Waiting for your reset link to be verified…
          </p>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-4">
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition-colors"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Update password
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
