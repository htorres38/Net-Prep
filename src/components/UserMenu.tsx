'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, LogIn, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function UserMenu() {
  const { user, isGuest, isLoading, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref    = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (isLoading)          return null
  if (!user && !isGuest)  return null

  const firstName = user?.user_metadata?.first_name as string | undefined
  const lastName  = user?.user_metadata?.last_name  as string | undefined
  const fullName  = firstName ? `${firstName} ${lastName ?? ''}`.trim() : null
  const initial   = firstName ? firstName[0].toUpperCase() : (user?.email?.[0]?.toUpperCase() ?? 'G')
  const avatarBg  = user ? 'bg-blue-600' : 'bg-gray-400'

  async function handleSignOut() {
    setOpen(false)
    await signOut()
  }

  return (
    <div ref={ref} className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Account menu"
        className={`w-9 h-9 ${avatarBg} text-white text-sm font-bold rounded-full flex items-center justify-center shadow-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute top-11 right-0 w-60 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden text-sm">

          <div className="px-4 py-3 border-b border-gray-100">
            {isGuest ? (
              <>
                <p className="font-semibold text-gray-900">Guest</p>
                <p className="text-xs text-gray-400 mt-0.5">Progress saved locally on this device</p>
              </>
            ) : (
              <>
                {fullName && <p className="font-semibold text-gray-900">{fullName}</p>}
                <p className={`text-xs text-gray-400 truncate ${fullName ? 'mt-0.5' : 'font-semibold text-sm text-gray-900'}`}>{user?.email}</p>
                {fullName && <p className="text-xs text-gray-400 mt-0.5">Signed in</p>}
              </>
            )}
          </div>

          {user && (
            <button
              onClick={() => { setOpen(false); router.push('/account') }}
              className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-400" /> Account settings
            </button>
          )}
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
          >
            {isGuest ? (
              <><LogIn className="w-4 h-4 text-gray-400" /> Sign in or create account</>
            ) : (
              <><LogOut className="w-4 h-4 text-gray-400" /> Sign out</>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
