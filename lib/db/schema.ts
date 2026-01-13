/**
 * Database schema definitions
 * PostgreSQL schema for bookings, calendar cache, and booking modifications
 */

export const BOOKINGS_TABLE = 'bookings'
export const BOOKING_MODIFICATIONS_TABLE = 'booking_modifications'
export const CALENDAR_CACHE_TABLE = 'calendar_cache'

/**
 * Booking status enums
 */
export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  MODIFIED = 'modified',
}

export enum ModificationType {
  CREATED = 'created',
  MODIFIED = 'modified',
  CANCELLED = 'cancelled',
}

/**
 * Booking record interface
 */
export interface Booking {
  id: string
  stripe_payment_intent_id: string
  hostaway_reservation_id: number | null
  listing_id: number
  listing_map_id: number
  slug: string
  
  // Guest information
  guest_first_name: string
  guest_last_name: string
  guest_email: string
  guest_phone: string
  guest_address: string | null
  guest_city: string | null
  guest_state: string | null
  guest_zip_code: string | null
  guest_country: string
  
  // Booking details
  arrival_date: string
  departure_date: string
  number_of_guests: number
  adults: number
  children: number | null
  infants: number | null
  pets: number | null
  
  // Pricing
  total_price: number
  currency: string
  nightly_rate: number
  cleaning_fee: number
  tax: number
  channel_fee: number
  
  // Status
  payment_status: PaymentStatus
  reservation_status: ReservationStatus
  
  // Metadata
  stripe_metadata: Record<string, any> | null
  hostaway_metadata: Record<string, any> | null
  notes: string | null
  
  // Timestamps
  created_at: Date
  updated_at: Date
  cancelled_at: Date | null
}

/**
 * Booking modification record interface
 */
export interface BookingModification {
  id: string
  booking_id: string
  modification_type: ModificationType
  changes: Record<string, any>
  modified_by: string
  created_at: Date
}

/**
 * Calendar cache record interface
 */
export interface CalendarCache {
  id: string
  listing_id: number
  date: string
  available: boolean
  price: number | null
  currency: string | null
  minimum_stay: number | null
  reservations: any[] | null // JSONB array of reservations
  cached_at: Date
  expires_at: Date
}
