'use client'

import { Suspense, useState, useEffect, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BookOpen, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

type Mode = 'signin' | 'signup' | 'forgot'

function LoginPageInner() {
  const { user, isGuest, isLoading, signIn, signUp, continueAsGuest, resetPassword, verifyOtp } = useAuth()
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [mode,         setMode]         = useState<Mode>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  )
  const [firstName,    setFirstName]    = useState('')
  const [lastName,     setLastName]     = useState('')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [submitting,   setSubmitting]   = useState(false)
  const [resetSent,         setResetSent]         = useState(false)
  const [confirmationSent,  setConfirmationSent]  = useState(false)
  const [otp,               setOtp]               = useState('')
  const [otpError,          setOtpError]          = useState<string | null>(null)
  const [otpSubmitting,     setOtpSubmitting]     = useState(false)

  useEffect(() => {
    if (!isLoading && (user || isGuest)) {
      router.replace('/')
    }
  }, [isLoading, user, isGuest, router])

  if (isLoading || user || isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    )
  }

  // confirmation

  const handleOtp = async (e: FormEvent) => {
    e.preventDefault()
    setOtpError(null)
    if (otp.trim().length < 6) { setOtpError('Enter the code from your email.'); return }
    setOtpSubmitting(true)
    const { error } = await verifyOtp(email.trim(), otp.trim())
    setOtpSubmitting(false)
    if (error) setOtpError(error)
  }

  if (confirmationSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-md">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">PrepNet</h1>
        </div>
        <div className="w-full max-w-sm bg-white rounded-2xl border shadow-sm p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Check your email</h2>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            We sent a confirmation code to <span className="font-semibold text-gray-700">{email}</span>. Enter it below to confirm your account.
          </p>
          <form onSubmit={handleOtp} noValidate className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter code"
              className="w-full px-3.5 py-3 rounded-lg border border-gray-300 text-2xl font-mono text-center tracking-widest text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              autoFocus
            />
            {otpError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                {otpError}
              </p>
            )}
            <button
              type="submit"
              disabled={otpSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition-colors"
            >
              {otpSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Confirm account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
          <button
            onClick={() => { setConfirmationSent(false); setOtp(''); setOtpError(null); switchMode('signin') }}
            className="w-full text-sm font-semibold text-gray-500 hover:text-gray-700 mt-3"
          >
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  // submit

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) { setError('Email is required.'); return }

    if (mode === 'forgot') {
      setSubmitting(true)
      const { error: authError } = await resetPassword(email.trim())
      setSubmitting(false)
      if (authError) { setError(authError); return }
      setResetSent(true)
      return
    }

    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setSubmitting(true)

    if (mode === 'signup') {
      if (!firstName.trim()) { setError('First name is required.'); return }
      if (!lastName.trim())  { setError('Last name is required.'); return }
      const { error: authError, needsConfirmation } = await signUp(email.trim(), password, firstName.trim(), lastName.trim())
      setSubmitting(false)
      if (authError) { setError(authError); return }
      if (needsConfirmation) { setConfirmationSent(true); return }
      return
    }

    const { error: authError } = await signIn(email.trim(), password)
    if (authError) {
      setError(authError)
      setSubmitting(false)
    }
  }

  // mode toggle

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setPassword('')
    setFirstName('')
    setLastName('')
    setResetSent(false)
  }

  // render

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">

      {/* brand */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-md">
          <BookOpen className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">PrepNet</h1>
        <p className="text-gray-500 text-sm mt-1.5">CCNA exam prep — labs, lessons, and practice in one place</p>
      </div>

      {/* card */}
      <div className="w-full max-w-sm bg-white rounded-2xl border shadow-sm p-8">

        {/* mode toggle */}
        {mode !== 'forgot' && (
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            {(['signin', 'signup'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${
                  mode === m
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>
        )}

        {/* forgot heading */}
        {mode === 'forgot' && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Reset your password</h2>
            <p className="text-sm text-gray-500 mt-1">
              Enter your email and we'll send you a reset link.
            </p>
          </div>
        )}

        {/* reset confirmation */}
        {resetSent ? (
          <div className="space-y-4">
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3.5 py-2.5">
              Check your email for a password reset link.
            </p>
            <button
              onClick={() => switchMode('signin')}
              className="w-full text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            {/* form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* name */}
              {mode === 'signup' && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label htmlFor="firstName" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      First name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="lastName" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
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
              )}

              {/* error */}
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
                    {mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {mode === 'forgot' && (
              <button
                onClick={() => switchMode('signin')}
                className="w-full text-sm font-semibold text-gray-500 hover:text-gray-700 mt-3"
              >
                Back to sign in
              </button>
            )}
          </>
        )}

        {/* guest */}
        {mode !== 'forgot' && !resetSent && (
          <>
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              onClick={continueAsGuest}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Continue as Guest
            </button>
            <p className="text-xs text-gray-400 text-center mt-2.5">
              Guest progress is saved locally on this device
            </p>
          </>
        )}
      </div>

      {/* footer */}
      <p className="text-xs text-gray-400 mt-6 text-center max-w-xs">
        PrepNet is an independent study tool. Not affiliated with Cisco or the CCNA certification program.
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    }>
      <LoginPageInner />
    </Suspense>
  )
}
