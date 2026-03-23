'use client'

import { useEffect, useState, useRef, ReactNode } from 'react'
import { PowerSyncContext } from '@powersync/react'
import { supabase } from '@/lib/supabase'
import { setPowerSyncDb } from '@/lib/powersync/db'

export function PowerSyncProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<any>(null)
  const dbRef = useRef<any>(null)

  useEffect(() => {
    import('@/lib/powersync/db').then(async ({ createPowerSyncDb }) => {
      const powerSyncDb = await createPowerSyncDb()
      setPowerSyncDb(powerSyncDb)
      console.log('[PowerSync] initial status:', powerSyncDb.currentStatus)
      ;(powerSyncDb as any).statusStream?.subscribe((status: any) => {
        console.log('[PowerSync] status changed — connected:', status.connected, '| last sync:', status.lastSyncedAt ?? 'never')
      })
      dbRef.current = powerSyncDb
      setDb(powerSyncDb)
    }).catch(console.error)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      const { connector } = await import('@/lib/powersync/db')
      if (event === 'SIGNED_IN') dbRef.current?.connect(connector).catch(() => {})
      if (event === 'SIGNED_OUT') dbRef.current?.disconnect().catch(() => {})
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!db) return <>{children}</>

  return (
    <PowerSyncContext.Provider value={db}>
      {children}
    </PowerSyncContext.Provider>
  )
}
