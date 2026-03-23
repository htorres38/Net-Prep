import { AppSchema } from './schema'
import { SupabaseConnector } from './connector'

export const connector = new SupabaseConnector()

// Module-level reference so non-React code can write to PowerSync
let _db: any = null
export function setPowerSyncDb(db: any) { _db = db }
export function getPowerSyncDb() { return _db }

export async function createPowerSyncDb() {
  const { PowerSyncDatabase, WASQLiteOpenFactory } = await import('@powersync/web')
  const db = new PowerSyncDatabase({
    schema: AppSchema,
    database: new WASQLiteOpenFactory({
      dbFilename: 'prepnet.db',
      flags: {
        disableSSRWarning: true,
        useWebWorker: false,
        enableMultiTabs: false,
      },
    }),
  })
  await db.init()
  await db.connect(connector)
  return db
}
