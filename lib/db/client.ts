/**
 * Database client initialization
 * Uses @vercel/postgres for Vercel deployment
 * Falls back to standard postgres client for local development
 */

let sql: any = null
let isVercelPostgres = false

// Check if we're using a local database (localhost or 127.0.0.1)
const isLocalDatabase = () => {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL || ''
  return url.includes('localhost') || url.includes('127.0.0.1')
}

// Initialize database client
let pgClient: any = null
let pgConnected = false

async function ensurePgConnection() {
  if (!pgClient) {
    return
  }
  
  // If we think we're connected, don't try to connect again
  if (pgConnected) {
    return
  }
  
  try {
    await pgClient.connect()
    pgConnected = true
  } catch (error: any) {
    // Handle "already connected" error - pg throws this if client is already connected
    // This can happen if the client was connected in a previous request
    if (error.message && (
      error.message.includes('already been connected') ||
      error.message.includes('Client has already been connected')
    )) {
      pgConnected = true
      return
    }
    // Connection might already be established (code 57P03 = already connected)
    if (error.code === '57P03') {
      pgConnected = true
      return
    }
    // For any other error, throw it
    throw error
  }
}

try {
  if (isLocalDatabase()) {
    // Use pg library for local development (supports $1, $2 syntax natively)
    const { Client } = require('pg')
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
    if (connectionString) {
      pgClient = new Client({ connectionString })
      // Don't connect during module initialization - connect on first query
      // This prevents connection reuse issues
      isVercelPostgres = false
      console.log('Using pg library for local PostgreSQL development')
    }
  } else {
    // Try to use @vercel/postgres for Vercel/production
    const vercelPostgres = require('@vercel/postgres')
    sql = vercelPostgres.sql
    isVercelPostgres = true
  }
} catch (error) {
  // If @vercel/postgres fails, try pg as fallback
  try {
    const { Client } = require('pg')
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
    if (connectionString) {
      pgClient = new Client({ connectionString })
      // Don't connect during module initialization - connect on first query
      isVercelPostgres = false
      console.log('Fell back to pg library')
    }
  } catch (fallbackError) {
    console.warn('No PostgreSQL client available. Database operations will be disabled.')
  }
}

export const db = sql || pgClient

/**
 * Check if database is available
 */
export function isDatabaseAvailable(): boolean {
  const hasClient = sql !== null || pgClient !== null
  const hasPostgresUrl = process.env.POSTGRES_URL !== undefined
  const hasDatabaseUrl = process.env.DATABASE_URL !== undefined
  const result = hasClient && (hasPostgresUrl || hasDatabaseUrl)
  
  return result
}

/**
 * Execute a SQL query
 * Wraps both @vercel/postgres and standard postgres clients
 */
export async function query(text: string, params?: any[]) {
  if (!isDatabaseAvailable()) {
    throw new Error('Database is not configured. Please set POSTGRES_URL or DATABASE_URL environment variable.')
  }
  
  try {
    if (isVercelPostgres) {
      // @vercel/postgres API
      const result = await sql.query(text, params)
      return result
    } else {
      // pg library API (supports $1, $2 syntax natively)
      await ensurePgConnection()
      const result = await pgClient.query(text, params || [])
      return {
        rows: result.rows || [],
        rowCount: result.rowCount || 0
      }
    }
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

/**
 * Execute a transaction
 */
export async function transaction<T>(callback: (client: typeof sql) => Promise<T>): Promise<T> {
  if (!isDatabaseAvailable()) {
    throw new Error('Database is not configured. Please set POSTGRES_URL or DATABASE_URL environment variable.')
  }
  
  try {
    if (isVercelPostgres) {
      // @vercel/postgres doesn't support transactions directly
      return await callback(sql)
    } else {
      // pg library supports transactions
      await ensurePgConnection()
      await pgClient.query('BEGIN')
      try {
        const result = await callback(pgClient)
        await pgClient.query('COMMIT')
        return result
      } catch (error) {
        await pgClient.query('ROLLBACK')
        throw error
      }
    }
  } catch (error) {
    console.error('Transaction error:', error)
    throw error
  }
}
