import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Config robusta de pool y singleton para evitar agotamiento de conexiones
const connectionString = process.env.DATABASE_URL!

// Detectar entorno serverless (Vercel) para limitar conexiones
const isServerless = !!process.env.VERCEL

const poolMax = Number(process.env.DB_POOL_MAX ?? (isServerless ? 1 : 10))
const idleTimeout = Number(process.env.DB_IDLE_TIMEOUT ?? (isServerless ? 0 : 20)) // segundos
const connectTimeout = Number(process.env.DB_CONNECT_TIMEOUT ?? 10) // segundos
const maxLifetime = Number(process.env.DB_MAX_LIFETIME ?? (isServerless ? 300 : 1800)) // segundos
const enableDebug = process.env.DB_DEBUG === 'true'

const pgOptions: Parameters<typeof postgres>[1] = {
  // Desactivar prefetch, no soportado en modo Transaction pool
  prepare: false,
  // Pool tuning
  max: poolMax,
  idle_timeout: idleTimeout,
  connect_timeout: connectTimeout,
  max_lifetime: maxLifetime,
  keep_alive: 1,
  // Debug opcional
  onnotice: enableDebug ? (notice) => console.log('[pg notice]', notice) : undefined,
  debug: enableDebug
    ? (connection, query, parameters) => {
        console.log('[pg debug]', query)
      }
    : undefined,
}

// Singleton en hot-reload y serverless para evitar múltiples clientes
declare global {
  // eslint-disable-next-line no-var
  var __pg__: ReturnType<typeof postgres> | undefined
  // eslint-disable-next-line no-var
  var __db__: ReturnType<typeof drizzle> | undefined
}

const client = globalThis.__pg__ ?? postgres(connectionString, pgOptions)
if (!globalThis.__pg__) {
  globalThis.__pg__ = client
}

export const db = globalThis.__db__ ?? drizzle(client, { schema })
if (!globalThis.__db__) {
  globalThis.__db__ = db
}

// Utilidad para cerrar conexión manualmente si fuese necesario (tests, scripts)
export const closeDb = async () => {
  try {
    await client.end({ timeout: 5 })
  } catch (err) {
    if (enableDebug) console.error('[pg close error]', err)
  }
}

export * from './schema'