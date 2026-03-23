import {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
  UpdateType,
} from '@powersync/web'
import { supabase } from '@/lib/supabase'

export class SupabaseConnector implements PowerSyncBackendConnector {
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
      for (const op of batch.crud) {
        const { table, id, opData } = op
        if (op.op === UpdateType.PUT) {
          await supabase.from(table).upsert({ id, ...opData })
        } else if (op.op === UpdateType.PATCH) {
          await supabase.from(table).update(opData!).eq('id', id)
        } else if (op.op === UpdateType.DELETE) {
          await supabase.from(table).delete().eq('id', id)
        }
      }
      await batch.complete()
    } catch (err) {
      console.error('PowerSync upload error:', err)
      throw err
    }
  }
}
