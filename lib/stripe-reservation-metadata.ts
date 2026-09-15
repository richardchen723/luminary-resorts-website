export const STRIPE_HOSTAWAY_RESERVATION_ID_KEY = "hostawayReservationId"

/**
 * Build the canonical Stripe metadata used to reconcile a payment with a
 * Hostaway reservation.
 */
export function buildStripeReservationMetadata(params: {
  hostawayReservationId: number | string
  bookingId?: string
}): Record<string, string> {
  const hostawayReservationId = String(params.hostawayReservationId).trim()

  if (!/^[1-9]\d*$/.test(hostawayReservationId)) {
    throw new Error("A valid Hostaway reservation ID is required")
  }

  return {
    [STRIPE_HOSTAWAY_RESERVATION_ID_KEY]: hostawayReservationId,
    ...(params.bookingId ? { bookingId: params.bookingId } : {}),
  }
}
