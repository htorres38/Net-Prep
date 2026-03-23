import {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
} from '@powersync/web'
import { supabase } from '@/lib/supabase'

export class SupabaseConnector implements PowerSyncBackendConnector {
  // auth still comes from Supabase
  async fetchCredentials() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null
    return {
      endpoint: process.env.NEXT_PUBLIC_POWERSYNC_URL!,
      token: session.access_token,
    }
  }

  async uploadData(database: AbstractPowerSyncDatabase) {
    const batch = await database.getCrudBatch(200)
    if (!batch) return

    try {
      const res = await fetch('/api/powersync-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ops: batch.crud }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Upload failed: ${res.status}`)
      }
      await batch.complete()
    } catch (err) {
      console.error('[PowerSync] upload error:', err)
      throw err
    }
  }
}
