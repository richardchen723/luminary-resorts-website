/**
 * Booking operation utilities
 * Handles create, modify, and cancel operations with proper error handling
 */

import { createBooking as createHostawayBooking, getListingMapId, deleteBooking as deleteHostawayBooking } from './hostaway'
import { isDatabaseAvailable } from './db/client'
import { createBooking as createDbBooking, updateBooking, getBookingById, logBookingModification } from './db/bookings'
import { invalidateCalendarForBooking } from './calendar-sync'
import { checkCabinAvailability } from './availability'
import { getSlugByListingId } from './listing-map'
import type { Booking, PaymentStatus, ReservationStatus } from './db/schema'
import type { HostawayBookingRequest } from './types/hostaway'

/**
 * Normalize phone number for Hostaway API
 * Ensures phone number has country code prefix (e.g., +1, +44)
 * If no country code is present and number looks like US/Canada (10 digits), adds +1
 */
function normalizePhoneNumber(phone: string): string {
  if (!phone) return ""
  
  // Remove all formatting except + and digits
  const cleaned = phone.replace(/[^\d+]/g, "")
  
  // If it already starts with +, return as is (international format)
  if (cleaned.startsWith("+")) {
    return cleaned
  }
  
  // If it's 10 digits, assume US/Canada and add +1
  if (/^\d{10}$/.test(cleaned)) {
    return `+1${cleaned}`
  }
  
  // If it's 11 digits starting with 1, add +
  if (/^1\d{10}$/.test(cleaned)) {
    return `+${cleaned}`
  }
  
  // Otherwise, try to add +1 as default (US)
  return `+1${cleaned}`
}

/**
 * Create a booking (payment already processed)
 */
export async function createBookingOperation(params: {
  paymentIntentId: string
  listingId: number
  checkIn: string
  checkOut: string
  guests: number
  adults: number
  guestInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  pricing: {
    total: number
    currency: string
    nightlyRate: number
    cleaningFee: number
    tax: number
    channelFee: number
  }
  stripeMetadata?: Record<string, any>
}): Promise<{ booking: Booking; hostawayReservationId: number }> {
  const { paymentIntentId, listingId, checkIn, checkOut, guests, adults, guestInfo, pricing, stripeMetadata } = params
  
  // Get slug and listingMapId
  const slug = getSlugByListingId(listingId)
  if (!slug) {
    throw new Error(`No slug found for listing ID: ${listingId}`)
  }
  
  // Re-check availability (prevent race conditions)
  const availability = await checkCabinAvailability(slug, checkIn, checkOut, guests)
  if (!availability.available) {
    throw new Error('Cabin is no longer available for the selected dates')
  }
  
  // Get listingMapId
  const listingMapId = await getListingMapId(listingId)
  
  // Create Hostaway reservation
  let hostawayReservation: any
  try {
    const hostawayPayload: HostawayBookingRequest = {
      channelId: 2000,
      listingMapId,
      arrivalDate: checkIn,
      departureDate: checkOut,
      numberOfGuests: guests,
      adults,
      children: null,
      infants: null,
      pets: null,
      guestFirstName: guestInfo.firstName,
      guestLastName: guestInfo.lastName,
      guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
      guestEmail: guestInfo.email,
      guestZipCode: guestInfo.zipCode || '',
      guestAddress: guestInfo.address || '',
      guestCity: guestInfo.city || '',
      guestCountry: guestInfo.country || 'US',
      // Normalize phone number: keep + and digits only, ensure country code is present
      phone: normalizePhoneNumber(guestInfo.phone),
      totalPrice: pricing.total,
      currency: pricing.currency,
      isPaid: 1,
      isManuallyChecked: 0,
      isInitial: 0,
      comment: `Stripe Payment Intent: ${paymentIntentId}`,
    }
    
    hostawayReservation = await createHostawayBooking(hostawayPayload)
  } catch (error: any) {
    console.error('Failed to create Hostaway reservation:', error)
    // Store booking with pending status - can retry later
    throw new Error(`Failed to create Hostaway reservation: ${error.message}`)
  }
  
  const hostawayReservationId = hostawayReservation.id || hostawayReservation.hostawayReservationId
  
  // Store booking in database (if available)
  let booking: Booking | null = null
  if (isDatabaseAvailable()) {
    try {
      booking = await createDbBooking({
      stripe_payment_intent_id: paymentIntentId,
      hostaway_reservation_id: hostawayReservationId,
      listing_id: listingId,
      listing_map_id: listingMapId,
      slug,
      guest_first_name: guestInfo.firstName,
      guest_last_name: guestInfo.lastName,
      guest_email: guestInfo.email,
      guest_phone: normalizePhoneNumber(guestInfo.phone),
      guest_address: guestInfo.address || null,
      guest_city: guestInfo.city || null,
      guest_state: guestInfo.state || null,
      guest_zip_code: guestInfo.zipCode || null,
      guest_country: guestInfo.country || 'US',
      arrival_date: checkIn,
      departure_date: checkOut,
      number_of_guests: guests,
      adults,
      children: null,
      infants: null,
      pets: null,
      total_price: pricing.total,
      currency: pricing.currency,
      nightly_rate: pricing.nightlyRate,
      cleaning_fee: pricing.cleaningFee,
      tax: pricing.tax,
      channel_fee: pricing.channelFee,
      payment_status: 'succeeded' as PaymentStatus,
      reservation_status: 'confirmed' as ReservationStatus,
      stripe_metadata: stripeMetadata || null,
      hostaway_metadata: hostawayReservation || null,
      notes: null,
    })
    
      // Log creation
      await logBookingModification(booking.id, 'created', {
        hostawayReservationId,
        paymentIntentId,
      }, 'system')
    } catch (error: any) {
      console.error('Failed to store booking in database:', error)
      // Hostaway reservation was created but database failed
      // This is recoverable - we can query Hostaway and sync later
      // Continue without throwing - booking exists in Hostaway
    }
  } else {
    console.warn('Database not available. Booking created in Hostaway but not stored locally.')
  }
  
  // Invalidate calendar cache (if database is available)
  if (isDatabaseAvailable()) {
    await invalidateCalendarForBooking(listingId, checkIn, checkOut).catch((error) => {
      console.error('Failed to invalidate calendar cache:', error)
    })
  }
  
  // Return booking (may be null if database is not available)
  if (!booking) {
    // Create a minimal booking object for return
    booking = {
      id: `temp-${Date.now()}`,
      stripe_payment_intent_id: paymentIntentId,
      hostaway_reservation_id: hostawayReservationId,
      listing_id: listingId,
      listing_map_id: listingMapId,
      slug,
      guest_first_name: guestInfo.firstName,
      guest_last_name: guestInfo.lastName,
      guest_email: guestInfo.email,
      guest_phone: normalizePhoneNumber(guestInfo.phone),
      guest_address: guestInfo.address || null,
      guest_city: guestInfo.city || null,
      guest_state: guestInfo.state || null,
      guest_zip_code: guestInfo.zipCode || null,
      guest_country: guestInfo.country || 'US',
      arrival_date: checkIn,
      departure_date: checkOut,
      number_of_guests: guests,
      adults,
      children: null,
      infants: null,
      pets: null,
      total_price: pricing.total,
      currency: pricing.currency,
      nightly_rate: pricing.nightlyRate,
      cleaning_fee: pricing.cleaningFee,
      tax: pricing.tax,
      channel_fee: pricing.channelFee,
      payment_status: 'succeeded' as PaymentStatus,
      reservation_status: 'confirmed' as ReservationStatus,
      stripe_metadata: stripeMetadata || null,
      hostaway_metadata: null,
      notes: null,
      created_at: new Date(),
      updated_at: new Date(),
      cancelled_at: null,
    } as Booking
  }
  
  return { booking, hostawayReservationId }
}

/**
 * Modify a booking
 */
export async function modifyBookingOperation(
  bookingId: string,
  updates: {
    checkIn?: string
    checkOut?: string
    guests?: number
    adults?: number
  }
): Promise<Booking> {
  const booking = await getBookingById(bookingId)
  if (!booking) {
    throw new Error('Booking not found')
  }
  
  if (booking.reservation_status === 'cancelled') {
    throw new Error('Cannot modify a cancelled booking')
  }
  
  // Validate new dates if provided
  if (updates.checkIn || updates.checkOut) {
    const newCheckIn = updates.checkIn || booking.arrival_date
    const newCheckOut = updates.checkOut || booking.departure_date
    const newGuests = updates.guests || booking.number_of_guests
    
    const availability = await checkCabinAvailability(booking.slug, newCheckIn, newCheckOut, newGuests)
    if (!availability.available) {
      throw new Error('New dates are not available')
    }
  }
  
  // TODO: Update Hostaway reservation (may need to cancel and recreate)
  // For now, just update database
  const updatedBooking = await updateBooking(bookingId, {
    arrival_date: updates.checkIn,
    departure_date: updates.checkOut,
    number_of_guests: updates.guests,
    adults: updates.adults,
    reservation_status: 'modified' as ReservationStatus,
  })
  
  // Log modification
  await logBookingModification(bookingId, 'modified', updates, 'system')
  
  // Invalidate calendar cache
  await invalidateCalendarForBooking(
    booking.listing_id,
    updates.checkIn || booking.arrival_date,
    updates.checkOut || booking.departure_date
  )
  
  return updatedBooking
}

/**
 * Cancel a booking
 */
export async function cancelBookingOperation(
  bookingId: string,
  refundAmount?: number
): Promise<Booking> {
  const booking = await getBookingById(bookingId)
  if (!booking) {
    throw new Error('Booking not found')
  }
  
  if (booking.reservation_status === 'cancelled') {
    throw new Error('Booking is already cancelled')
  }
  
  // Cancel Hostaway reservation
  if (booking.hostaway_reservation_id) {
    try {
      await deleteHostawayBooking(booking.hostaway_reservation_id)
    } catch (error: any) {
      console.error('Failed to cancel Hostaway reservation:', error)
      // Continue with database update even if Hostaway fails
    }
  }
  
  // Update database
  const updatedBooking = await updateBooking(bookingId, {
    reservation_status: 'cancelled' as ReservationStatus,
    payment_status: refundAmount ? 'refunded' as PaymentStatus : booking.payment_status,
    cancelled_at: new Date(),
  })
  
  // Log cancellation
  await logBookingModification(bookingId, 'cancelled', {
    refundAmount,
  }, 'system')
  
  // Invalidate calendar cache to free up dates
  await invalidateCalendarForBooking(
    booking.listing_id,
    booking.arrival_date,
    booking.departure_date
  )
  
  return updatedBooking
}
