'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Eye, EyeOff, ArrowLeft, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function AccountPage() {
  const { user, isLoading, updatePassword, updateName, deleteAccount, signOut } = useAuth()
  const router = useRouter()

  // name
  const [editFirstName,   setEditFirstName]   = useState('')
  const [editLastName,    setEditLastName]     = useState('')
  const [nameSubmitting,  setNameSubmitting]  = useState(false)
  const [nameError,       setNameError]       = useState<string | null>(null)
  const [nameSuccess,     setNameSuccess]     = useState(false)

  // password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword,      setNewPassword]     = useState('')
  const [showCurrent,      setShowCurrent]     = useState(false)
  const [showNew,          setShowNew]         = useState(false)
  const [pwConfirming,     setPwConfirming]    = useState(false) // true = show confirmation step
  const [pwSubmitting,     setPwSubmitting]    = useState(false)
  const [pwError,          setPwError]         = useState<string | null>(null)
  const [pwSuccess,        setPwSuccess]       = useState(false)

  // delete
  const [confirmDelete,   setConfirmDelete]   = useState(false)
  const [deleteReason,    setDeleteReason]    = useState('')
  const [deleteInput,     setDeleteInput]     = useState('')
  const [deleting,        setDeleting]        = useState(false)
  const [deleteError,     setDeleteError]     = useState<string | null>(null)

  const DELETE_REASONS = [
    "I no longer need this account",
    "I've created a new account",
    "I'm done studying / passed my exam",
    "Other",
  ]

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login')
  }, [isLoading, user, router])

  useEffect(() => {
    if (user) {
      setEditFirstName((user.user_metadata?.first_name as string | undefined) ?? '')
      setEditLastName((user.user_metadata?.last_name   as string | undefined) ?? '')
    }
  }, [user])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    )
  }

  const firstName = (user.user_metadata?.first_name as string | undefined) ?? ''
  const lastName  = (user.user_metadata?.last_name  as string | undefined) ?? ''

  async function handleUpdateName(e: FormEvent) {
    e.preventDefault()
    setNameError(null)
    setNameSuccess(false)
    if (!editFirstName.trim()) { setNameError('First name is required.'); return }
    if (!editLastName.trim())  { setNameError('Last name is required.'); return }
    setNameSubmitting(true)
    const { error } = await updateName(editFirstName.trim(), editLastName.trim())
    setNameSubmitting(false)
    if (error) { setNameError(error); return }
    setNameSuccess(true)
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    setPwError(null)
    setPwSuccess(false)
    if (!currentPassword) { setPwError('Please enter your current password.'); return }
    if (newPassword.length < 6) { setPwError('New password must be at least 6 characters.'); return }
    setPwSubmitting(true)
    const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user!.email!, password: currentPassword })
    setPwSubmitting(false)
    if (verifyError) { setPwError('Current password is incorrect.'); return }
    setPwConfirming(true)
  }

  async function handleConfirmPasswordUpdate() {
    setPwError(null)
    setPwSubmitting(true)
    const { error } = await updatePassword(newPassword)
    setPwSubmitting(false)
    if (error) { setPwError(error); setPwConfirming(false); return }
    setPwSuccess(true)
    setPwConfirming(false)
    setCurrentPassword('')
    setNewPassword('')
  }

  async function handleDeleteAccount() {
    setDeleteError(null)
    setDeleting(true)
    const { error } = await deleteAccount()
    setDeleting(false)
    if (error) setDeleteError(error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 px-4 py-12">
      <div className="max-w-md mx-auto">

        {/* nav */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Account settings</h1>

        {/* profile */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.07)] p-6 mb-4">
          {/* avatar */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-sm font-bold text-white leading-none">
                {(firstName[0] ?? '?').toUpperCase()}{(lastName[0] ?? '').toUpperCase()}
              </span>
            </div>
            <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Profile</h2>
          </div>
          <form onSubmit={handleUpdateName} noValidate className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">First name</label>
                <input
                  type="text"
                  autoComplete="given-name"
                  value={editFirstName}
                  onChange={e => { setEditFirstName(e.target.value); setNameSuccess(false) }}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">Last name</label>
                <input
                  type="text"
                  autoComplete="family-name"
                  value={editLastName}
                  onChange={e => { setEditLastName(e.target.value); setNameSuccess(false) }}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">Email</label>
                <p className="text-sm font-medium text-gray-700 px-1">{user.email}</p>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">Joined</label>
                <p className="text-sm font-medium text-gray-700 px-1">
                  {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            {nameError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">{nameError}</p>
            )}
            {nameSuccess && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3.5 py-2.5">Name updated.</p>
            )}
            <button
              type="submit"
              disabled={nameSubmitting}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition-colors shadow-sm shadow-blue-200"
            >
              {nameSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save name'}
            </button>
          </form>
        </div>

        {/* password */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.07)] p-6 mb-4">
          <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">Change password</h2>

          {pwConfirming ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">Are you sure you want to update your password?</p>
              {pwError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">{pwError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmPasswordUpdate}
                  disabled={pwSubmitting}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition-colors shadow-sm shadow-blue-200"
                >
                  {pwSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, update password'}
                </button>
                <button
                  onClick={() => { setPwConfirming(false); setPwError(null) }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} noValidate className="space-y-3">
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={e => { setCurrentPassword(e.target.value); setPwSuccess(false) }}
                  placeholder="Current password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(v => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setPwSuccess(false) }}
                  placeholder="New password (min. 6 characters)"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(v => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pwError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">{pwError}</p>
              )}
              {pwSuccess && (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3.5 py-2.5">Password updated successfully.</p>
              )}
              <button
                type="submit"
                disabled={pwSubmitting}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition-colors shadow-sm shadow-blue-200"
              >
                {pwSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update password'}
              </button>
            </form>
          )}
        </div>

        {/* danger zone */}
        <div className="rounded-2xl border border-red-200 shadow-[0_2px_10px_rgba(239,68,68,0.08)] overflow-hidden">
          <div className="bg-red-50 px-6 py-3 border-b border-red-200 flex items-center gap-2">
            <span className="text-sm font-bold text-red-600 uppercase tracking-wider">Danger Zone</span>
          </div>
          <div className="bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-1">Delete account</h2>
          <p className="text-sm text-gray-500 mb-4">
            Permanently deletes your account and all progress. This cannot be undone.
          </p>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete my account
            </button>
          ) : (
            <div className="space-y-4">
              {/* step 1 */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Why are you deleting your account?</p>
                <div className="space-y-2">
                  {DELETE_REASONS.map(reason => (
                    <label key={reason} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="deleteReason"
                        value={reason}
                        checked={deleteReason === reason}
                        onChange={() => setDeleteReason(reason)}
                        className="accent-red-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* step 2 */}
              {deleteReason && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700">
                    Type <span className="font-mono font-bold">delete</span> to confirm:
                  </p>
                  <input
                    type="text"
                    value={deleteInput}
                    onChange={e => setDeleteInput(e.target.value)}
                    placeholder="delete"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-red-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
                  />
                  {deleteError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">{deleteError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteInput !== 'delete' || deleting}
                      className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white transition-colors"
                    >
                      {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm delete'}
                    </button>
                    <button
                      onClick={() => { setConfirmDelete(false); setDeleteInput(''); setDeleteReason(''); setDeleteError(null) }}
                      className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* cancel */}
              {!deleteReason && (
                <button
                  onClick={() => { setConfirmDelete(false); setDeleteReason('') }}
                  className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
          </div>
        </div>

        {/* sign out */}
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-300 text-gray-600 hover:bg-white hover:border-gray-400 hover:text-gray-800 transition-colors shadow-sm"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>

      </div>
    </div>
  )
}
