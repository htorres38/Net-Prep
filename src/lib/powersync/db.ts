import { AppSchema } from './schema'
import { SupabaseConnector } from './connector'

export const connector = new SupabaseConnector()

export async function createPowerSyncDb() {
  const { PowerSyncDatabase } = await import('@powersync/web')
  const db = new PowerSyncDatabase({
    schema: AppSchema,
    database: {
      dbFilename: 'prepnet.db',
      flags: {
        disableSSRWarning: true,
        useWebWorker: false,
        enableMultiTabs: false,
      },
    },
  })
  await db.init()
  await db.connect(connector)
  return db
}
