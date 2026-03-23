import {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
  UpdateType,
} from '@powersync/web'
import { supabase } from '@/lib/supabase'
import { neon } from '@neondatabase/serverless'

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
      // -- NEON (active) --
      const sql = neon(process.env.NEON_DATABASE_URL!)
      for (const op of batch.crud) {
        const { table, id, opData } = op
        if (op.op === UpdateType.PUT) {
          const cols = Object.keys({ id, ...opData! })
          const vals = Object.values({ id, ...opData! })
          await sql(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map((_,i) => `$${i+1}`).join(',')}) ON CONFLICT (id) DO UPDATE SET ${cols.map((c,i) => `${c}=$${i+1}`).join(',')}`, vals)
        } else if (op.op === UpdateType.PATCH) {
          const cols = Object.keys(opData!)
          const vals = [...Object.values(opData!), id]
          await sql(`UPDATE ${table} SET ${cols.map((c,i) => `${c}=$${i+1}`).join(',')} WHERE id=$${cols.length+1}`, vals)
        } else if (op.op === UpdateType.DELETE) {
          await sql(`DELETE FROM ${table} WHERE id=$1`, [id])
        }
      }

      // -- SUPABASE (commented out — uncomment to switch back) --
      // for (const op of batch.crud) {
      //   const { table, id, opData } = op
      //   if (op.op === UpdateType.PUT) {
      //     await supabase.from(table).upsert({ id, ...opData })
      //   } else if (op.op === UpdateType.PATCH) {
      //     await supabase.from(table).update(opData!).eq('id', id)
      //   } else if (op.op === UpdateType.DELETE) {
      //     await supabase.from(table).delete().eq('id', id)
      //   }
      // }

      await batch.complete()
    } catch (err) {
      console.error('PowerSync upload error:', err)
      throw err
    }
  }
}
