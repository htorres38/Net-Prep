'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { resetUserIdCache } from '@/lib/db'
import { clearLocalProgress } from '@/lib/progress'

// types

interface AuthContextValue {
  user:             User | null
  isGuest:          boolean
  isLoading:        boolean
  signIn:           (email: string, password: string) => Promise<{ error: string | null }>
  signUp:           (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: string | null; needsConfirmation: boolean }>
  signOut:          () => Promise<void>
  continueAsGuest:  () => void
  resetPassword:    (email: string) => Promise<{ error: string | null }>
  updatePassword:   (newPassword: string) => Promise<{ error: string | null }>
  updateName:       (firstName: string, lastName: string) => Promise<{ error: string | null }>
  verifyOtp:        (email: string, token: string) => Promise<{ error: string | null }>
  deleteAccount:    () => Promise<{ error: string | null }>
}

// context

const AuthContext = createContext<AuthContextValue | null>(null)

const GUEST_KEY = 'prepnet_guest'

// provider

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<User | null>(null)
  const [isGuest,   setIsGuest]   = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          setIsLoading(false)
          return
        }
      } catch { /* ignore */ }

      if (typeof window !== 'undefined') {
        const guestFlag = localStorage.getItem(GUEST_KEY)
        if (guestFlag === 'true') setIsGuest(true)
      }
      setIsLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setIsGuest(false)
        resetUserIdCache()
      }
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // actions

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    if (typeof window !== 'undefined') localStorage.removeItem(GUEST_KEY)
    setIsGuest(false)
    resetUserIdCache()
    router.push('/')
    return { error: null }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string): Promise<{ error: string | null; needsConfirmation: boolean }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { first_name: firstName, last_name: lastName },
      },
    })
    if (error) return { error: error.message, needsConfirmation: false }
    if (data.user && data.user.identities?.length === 0) {
      return { error: 'An account with this email already exists. Please sign in instead.', needsConfirmation: false }
    }
    if (!data.session) return { error: null, needsConfirmation: true }
    if (typeof window !== 'undefined') localStorage.removeItem(GUEST_KEY)
    setIsGuest(false)
    resetUserIdCache()
    router.push('/')
    return { error: null, needsConfirmation: false }
  }

  const signOut = async () => {
    await supabase.auth.signOut().catch(() => {})
    if (typeof window !== 'undefined') localStorage.removeItem(GUEST_KEY)
    setUser(null)
    setIsGuest(false)
    resetUserIdCache()
    router.push('/login')
  }

  const continueAsGuest = () => {
    if (typeof window !== 'undefined') localStorage.setItem(GUEST_KEY, 'true')
    setIsGuest(true)
    router.push('/')
  }

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error: error ? error.message : null }
  }

  const updatePassword = async (newPassword: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return { error: error ? error.message : null }
  }

  const updateName = async (firstName: string, lastName: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.updateUser({ data: { first_name: firstName, last_name: lastName } })
    if (error) return { error: error.message }
    if (data.user) setUser(data.user)
    return { error: null }
  }

  const verifyOtp = async (email: string, token: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' })
    if (error) return { error: error.message }
    if (typeof window !== 'undefined') localStorage.removeItem(GUEST_KEY)
    setIsGuest(false)
    resetUserIdCache()
    router.push('/')
    return { error: null }
  }

  const deleteAccount = async (): Promise<{ error: string | null }> => {
    const { error } = await supabase.rpc('delete_own_account')
    if (error) return { error: error.message }
    if (typeof window !== 'undefined') localStorage.removeItem(GUEST_KEY)
    setUser(null)
    setIsGuest(false)
    resetUserIdCache()
    await clearLocalProgress()
    router.push('/login')
    return { error: null }
  }

  // value

  return (
    <AuthContext.Provider value={{ user, isGuest, isLoading, signIn, signUp, signOut, continueAsGuest, resetPassword, updatePassword, updateName, verifyOtp, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

// hook

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
