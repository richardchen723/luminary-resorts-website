/**
 * Calendar cache database operations
 */

import { query } from './client'
import type { CalendarCache } from './schema'
import type { HostawayReservation } from '@/types/hostaway'
import { CALENDAR_CACHE_TABLE } from './schema'

/**
 * Upsert calendar cache entry (insert or update)
 */
export async function upsertCalendarCache(
  listingId: number,
  date: string,
  available: boolean,
  price: number | null,
  currency: string | null,
  expiresAt: Date,
  minimumStay: number | null = null,
  reservations: HostawayReservation[] | null = null
): Promise<void> {
  await query(
    `INSERT INTO ${CALENDAR_CACHE_TABLE} (listing_id, date, available, price, currency, expires_at, minimum_stay, reservations)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (listing_id, date) 
     DO UPDATE SET 
       available = EXCLUDED.available,
       price = EXCLUDED.price,
       currency = EXCLUDED.currency,
       minimum_stay = EXCLUDED.minimum_stay,
       reservations = EXCLUDED.reservations,
       cached_at = NOW(),
       expires_at = EXCLUDED.expires_at`,
    [listingId, date, available, price, currency, expiresAt, minimumStay, reservations ? JSON.stringify(reservations) : null]
  )
}

/**
 * Get calendar cache for a listing within date range
 */
export async function getCalendarCache(
  listingId: number,
  startDate: string,
  endDate: string
): Promise<CalendarCache[]> {
  const result = await query(
    `SELECT * FROM ${CALENDAR_CACHE_TABLE}
     WHERE listing_id = $1 
       AND date >= $2 
       AND date < $3
       AND expires_at > NOW()
     ORDER BY date ASC`,
    [listingId, startDate, endDate]
  )
  
  return result.rows.map(mapRowToCalendarCache)
}

/**
 * Get calendar cache for a specific date
 */
export async function getCalendarCacheForDate(
  listingId: number,
  date: string
): Promise<CalendarCache | null> {
  const result = await query(
    `SELECT * FROM ${CALENDAR_CACHE_TABLE}
     WHERE listing_id = $1 AND date = $2 AND expires_at > NOW()
     LIMIT 1`,
    [listingId, date]
  )
  
  if (result.rows.length === 0) return null
  return mapRowToCalendarCache(result.rows[0])
}

/**
 * Invalidate calendar cache for a listing within date range
 */
export async function invalidateCalendarCache(
  listingId: number,
  startDate: string,
  endDate: string
): Promise<void> {
  await query(
    `UPDATE ${CALENDAR_CACHE_TABLE}
     SET expires_at = NOW()
     WHERE listing_id = $1 AND date >= $2 AND date < $3`,
    [listingId, startDate, endDate]
  )
}

/**
 * Clean up expired cache entries
 */
export async function cleanupExpiredCache(): Promise<number> {
  const result = await query(
    `DELETE FROM ${CALENDAR_CACHE_TABLE} WHERE expires_at < NOW()`
  )
  return result.rowCount || 0
}

/**
 * Map database row to CalendarCache object
 */
function mapRowToCalendarCache(row: any): CalendarCache {
  // Parse reservations JSONB if present
  let reservations: any[] | null = null
  if (row.reservations) {
    try {
      reservations = typeof row.reservations === 'string' 
        ? JSON.parse(row.reservations) 
        : row.reservations
    } catch (e) {
      console.error('Error parsing reservations JSON:', e)
      reservations = null
    }
  }
  
  return {
    id: row.id,
    listing_id: row.listing_id,
    date: row.date,
    available: row.available,
    price: row.price ? parseFloat(row.price) : null,
    currency: row.currency,
    minimum_stay: row.minimum_stay ? parseInt(row.minimum_stay, 10) : null,
    reservations,
    cached_at: new Date(row.cached_at),
    expires_at: new Date(row.expires_at),
  }
}
