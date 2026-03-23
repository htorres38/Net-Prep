import { PowerSyncDatabase } from '@powersync/web'
import { AppSchema } from './schema'
import { SupabaseConnector } from './connector'

export const powerSyncDb = new PowerSyncDatabase({
  schema: AppSchema,
  database: { dbFilename: 'prepnet.db' },
})

export const connector = new SupabaseConnector()

export async function initPowerSync() {
  await powerSyncDb.init()
  await powerSyncDb.connect(connector)
}
