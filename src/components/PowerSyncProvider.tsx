'use client'

import { useEffect, useState, ReactNode } from 'react'
import { PowerSyncContext } from '@powersync/react'
import { powerSyncDb, connector, initPowerSync } from '@/lib/powersync/db'
import { supabase } from '@/lib/supabase'

export function PowerSyncProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initPowerSync().then(() => setReady(true)).catch(console.error)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') powerSyncDb.connect(connector).catch(() => {})
      if (event === 'SIGNED_OUT') powerSyncDb.disconnect().catch(() => {})
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!ready) return <>{children}</>

  return (
    <PowerSyncContext.Provider value={powerSyncDb}>
      {children}
    </PowerSyncContext.Provider>
  )
}
