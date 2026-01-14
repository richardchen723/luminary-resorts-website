/**
 * Database client initialization
 * Uses PostgreSQL via @vercel/postgres for Vercel deployment
 * Falls back gracefully if database is not configured
 */

let sql: any = null

// Try to import @vercel/postgres, but handle gracefully if not available
try {
  const postgres = require('@vercel/postgres')
  sql = postgres.sql
} catch (error) {
  console.warn('@vercel/postgres not available. Database operations will be disabled.')
}

// For local development, you might want to use a different client
// This is set up for Vercel Postgres by default
export const db = sql

/**
 * Check if database is available
 * Vercel Postgres provides POSTGRES_URL, but we also support DATABASE_URL for flexibility
 */
export function isDatabaseAvailable(): boolean {
  return sql !== null && (process.env.POSTGRES_URL !== undefined || process.env.DATABASE_URL !== undefined)
}

/**
 * Execute a SQL query
 */
export async function query(text: string, params?: any[]) {
  if (!isDatabaseAvailable()) {
    throw new Error('Database is not configured. Please set POSTGRES_URL or DATABASE_URL environment variable.')
  }
  
  try {
    const result = await sql.query(text, params)
    return result
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
  
  // Note: @vercel/postgres doesn't support transactions directly
  // For transactions, consider using a different PostgreSQL client in production
  // For now, we'll execute sequentially
  try {
    return await callback(sql)
  } catch (error) {
    console.error('Transaction error:', error)
    throw error
  }
}
