import assert from "node:assert/strict"
import test from "node:test"

import {
  buildStripeReservationMetadata,
  STRIPE_HOSTAWAY_RESERVATION_ID_KEY,
} from "@/lib/stripe-reservation-metadata"

test("builds canonical Stripe metadata for a Hostaway reservation", () => {
  assert.deepEqual(
    buildStripeReservationMetadata({
      hostawayReservationId: 52652999,
      bookingId: "booking-123",
    }),
    {
      [STRIPE_HOSTAWAY_RESERVATION_ID_KEY]: "52652999",
      bookingId: "booking-123",
    }
  )
})

test("rejects an empty Hostaway reservation ID", () => {
  assert.throws(
    () => buildStripeReservationMetadata({ hostawayReservationId: "" }),
    /valid Hostaway reservation ID/
  )
  assert.throws(
    () => buildStripeReservationMetadata({ hostawayReservationId: 0 }),
    /valid Hostaway reservation ID/
  )
  assert.throws(
    () => buildStripeReservationMetadata({ hostawayReservationId: "not-an-id" }),
    /valid Hostaway reservation ID/
  )
})
