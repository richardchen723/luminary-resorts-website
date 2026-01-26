/**
 * Booking database operations
 */

import { db, query } from './client'
import type { Booking, PaymentStatus, ReservationStatus } from './schema'
import { BOOKINGS_TABLE, BOOKING_MODIFICATIONS_TABLE } from './schema'

/**
 * Create a new booking
 */
export async function createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'cancelled_at'>): Promise<Booking> {
  const result = await query(
    `INSERT INTO ${BOOKINGS_TABLE} (
      stripe_payment_intent_id, hostaway_reservation_id, listing_id, listing_map_id, slug,
      guest_first_name, guest_last_name, guest_email, guest_phone,
      guest_address, guest_city, guest_state, guest_zip_code, guest_country,
      arrival_date, departure_date, number_of_guests, adults, children, infants, pets,
      total_price, currency, nightly_rate, cleaning_fee, tax, channel_fee,
      payment_status, reservation_status, stripe_metadata, hostaway_metadata, notes
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,
      $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
    ) RETURNING *`,
    [
      booking.stripe_payment_intent_id,
      booking.hostaway_reservation_id,
      booking.listing_id,
      booking.listing_map_id,
      booking.slug,
      booking.guest_first_name,
      booking.guest_last_name,
      booking.guest_email,
      booking.guest_phone,
      booking.guest_address,
      booking.guest_city,
      booking.guest_state,
      booking.guest_zip_code,
      booking.guest_country,
      booking.arrival_date,
      booking.departure_date,
      booking.number_of_guests,
      booking.adults,
      booking.children,
      booking.infants,
      booking.pets,
      booking.total_price,
      booking.currency,
      booking.nightly_rate,
      booking.cleaning_fee,
      booking.tax,
      booking.channel_fee,
      booking.payment_status,
      booking.reservation_status,
      booking.stripe_metadata ? JSON.stringify(booking.stripe_metadata) : null,
      booking.hostaway_metadata ? JSON.stringify(booking.hostaway_metadata) : null,
      booking.notes,
    ]
  )
  
  return mapRowToBooking(result.rows[0])
}

/**
 * Get booking by ID
 */
export async function getBookingById(id: string): Promise<Booking | null> {
  const result = await query(`SELECT * FROM ${BOOKINGS_TABLE} WHERE id = $1`, [id])
  if (result.rows.length === 0) return null
  return mapRowToBooking(result.rows[0])
}

/**
 * Get booking by Stripe payment intent ID
 */
export async function getBookingByPaymentIntentId(paymentIntentId: string): Promise<Booking | null> {
  const result = await query(`SELECT * FROM ${BOOKINGS_TABLE} WHERE stripe_payment_intent_id = $1`, [paymentIntentId])
  if (result.rows.length === 0) return null
  return mapRowToBooking(result.rows[0])
}

/**
 * Get booking by Hostaway reservation ID
 */
export async function getBookingByHostawayReservationId(reservationId: number): Promise<Booking | null> {
  const result = await query(`SELECT * FROM ${BOOKINGS_TABLE} WHERE hostaway_reservation_id = $1`, [reservationId])
  if (result.rows.length === 0) return null
  return mapRowToBooking(result.rows[0])
}

/**
 * Update booking
 */
export async function updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
  const fields: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (updates.hostaway_reservation_id !== undefined) {
    fields.push(`hostaway_reservation_id = $${paramIndex++}`)
    values.push(updates.hostaway_reservation_id)
  }
  if (updates.arrival_date !== undefined) {
    fields.push(`arrival_date = $${paramIndex++}`)
    values.push(updates.arrival_date)
  }
  if (updates.departure_date !== undefined) {
    fields.push(`departure_date = $${paramIndex++}`)
    values.push(updates.departure_date)
  }
  if (updates.number_of_guests !== undefined) {
    fields.push(`number_of_guests = $${paramIndex++}`)
    values.push(updates.number_of_guests)
  }
  if (updates.adults !== undefined) {
    fields.push(`adults = $${paramIndex++}`)
    values.push(updates.adults)
  }
  if (updates.total_price !== undefined) {
    fields.push(`total_price = $${paramIndex++}`)
    values.push(updates.total_price)
  }
  if (updates.payment_status !== undefined) {
    fields.push(`payment_status = $${paramIndex++}`)
    values.push(updates.payment_status)
  }
  if (updates.reservation_status !== undefined) {
    fields.push(`reservation_status = $${paramIndex++}`)
    values.push(updates.reservation_status)
  }
  if (updates.hostaway_metadata !== undefined) {
    fields.push(`hostaway_metadata = $${paramIndex++}`)
    values.push(updates.hostaway_metadata ? JSON.stringify(updates.hostaway_metadata) : null)
  }
  if (updates.notes !== undefined) {
    fields.push(`notes = $${paramIndex++}`)
    values.push(updates.notes)
  }
  if (updates.cancelled_at !== undefined) {
    fields.push(`cancelled_at = $${paramIndex++}`)
    values.push(updates.cancelled_at)
  }

  if (fields.length === 0) {
    // No updates, just return existing booking
    return getBookingById(id) as Promise<Booking>
  }

  values.push(id)
  const result = await query(
    `UPDATE ${BOOKINGS_TABLE} SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  )
  
  return mapRowToBooking(result.rows[0])
}

/**
 * Get bookings for a listing within a date range
 */
export async function getBookingsForListing(
  listingId: number,
  startDate?: string,
  endDate?: string
): Promise<Booking[]> {
  let queryText = `SELECT * FROM ${BOOKINGS_TABLE} WHERE listing_id = $1 AND reservation_status != 'cancelled'`
  const params: any[] = [listingId]

  if (startDate && endDate) {
    queryText += ` AND (
      (arrival_date <= $2 AND departure_date > $2) OR
      (arrival_date < $3 AND departure_date >= $3) OR
      (arrival_date >= $2 AND departure_date <= $3)
    )`
    params.push(startDate, endDate)
  }

  queryText += ` ORDER BY arrival_date ASC`

  const result = await query(queryText, params)
  return result.rows.map(mapRowToBooking)
}

/**
 * Get bookings by guest email
 */
export async function getBookingsByEmail(email: string): Promise<Booking[]> {
  const result = await query(
    `SELECT * FROM ${BOOKINGS_TABLE} WHERE guest_email = $1 ORDER BY created_at DESC`,
    [email]
  )
  return result.rows.map(mapRowToBooking)
}

/**
 * Log booking modification
 */
export async function logBookingModification(
  bookingId: string,
  modificationType: 'created' | 'modified' | 'cancelled',
  changes: Record<string, any>,
  modifiedBy: string
): Promise<void> {
  await query(
    `INSERT INTO ${BOOKING_MODIFICATIONS_TABLE} (booking_id, modification_type, changes, modified_by)
     VALUES ($1, $2, $3, $4)`,
    [bookingId, modificationType, JSON.stringify(changes), modifiedBy]
  )
}

/**
 * Get saved payment method ID from booking
 * Returns the payment method ID if available, null otherwise
 */
export function getSavedPaymentMethodId(booking: Booking): string | null {
  return booking.stripe_metadata?.paymentMethodId || null
}

/**
 * Map database row to Booking object
 */
function mapRowToBooking(row: any): Booking {
  return {
    id: row.id,
    stripe_payment_intent_id: row.stripe_payment_intent_id,
    hostaway_reservation_id: row.hostaway_reservation_id,
    listing_id: row.listing_id,
    listing_map_id: row.listing_map_id,
    slug: row.slug,
    guest_first_name: row.guest_first_name,
    guest_last_name: row.guest_last_name,
    guest_email: row.guest_email,
    guest_phone: row.guest_phone,
    guest_address: row.guest_address,
    guest_city: row.guest_city,
    guest_state: row.guest_state,
    guest_zip_code: row.guest_zip_code,
    guest_country: row.guest_country,
    arrival_date: row.arrival_date,
    departure_date: row.departure_date,
    number_of_guests: row.number_of_guests,
    adults: row.adults,
    children: row.children,
    infants: row.infants,
    pets: row.pets,
    total_price: parseFloat(row.total_price),
    currency: row.currency,
    nightly_rate: parseFloat(row.nightly_rate),
    cleaning_fee: parseFloat(row.cleaning_fee),
    tax: parseFloat(row.tax),
    channel_fee: parseFloat(row.channel_fee),
    payment_status: row.payment_status as PaymentStatus,
    reservation_status: row.reservation_status as ReservationStatus,
    stripe_metadata: row.stripe_metadata ? (typeof row.stripe_metadata === 'string' ? JSON.parse(row.stripe_metadata) : row.stripe_metadata) : null,
    hostaway_metadata: row.hostaway_metadata ? (typeof row.hostaway_metadata === 'string' ? JSON.parse(row.hostaway_metadata) : row.hostaway_metadata) : null,
    notes: row.notes,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
    cancelled_at: row.cancelled_at ? new Date(row.cancelled_at) : null,
  }
}
