/**
 * POST /api/payment/charge-saved
 * Charge a saved payment method for a booking
 * Use this to charge the remaining balance (e.g., one month before check-in)
 */

import { NextResponse } from "next/server"
import { getBookingById } from "@/lib/db/bookings"
import { chargeSavedPaymentMethod, getPaymentIntent } from "@/lib/stripe"
import { updateBooking } from "@/lib/db/bookings"
import { PaymentStatus } from "@/lib/db/schema"

interface ChargeSavedPaymentRequest {
  bookingId: string
  amount: number // in cents
  reason?: string // e.g., "final_payment", "deposit", etc.
}

export async function POST(request: Request) {
  try {
    const body: ChargeSavedPaymentRequest = await request.json()
    const { bookingId, amount, reason } = body

    // Validate required fields
    if (!bookingId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Missing required fields: bookingId and amount (in cents)" },
        { status: 400 }
      )
    }

    // Get booking
    const booking = await getBookingById(bookingId)
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    // Get payment method ID from stripe_metadata
    const paymentMethodId = booking.stripe_metadata?.paymentMethodId
    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "No saved payment method found for this booking" },
        { status: 400 }
      )
    }

    // Charge the saved payment method
    const paymentIntent = await chargeSavedPaymentMethod({
      paymentMethodId,
      amount,
      currency: booking.currency.toLowerCase() || "usd",
      metadata: {
        bookingId: booking.id,
        originalPaymentIntentId: booking.stripe_payment_intent_id,
        reason: reason || "additional_payment",
        slug: booking.slug,
      },
      description: `Additional payment for booking ${booking.slug} - ${reason || "additional payment"}`,
    })

    // Update booking payment status if payment succeeded
    if (paymentIntent.status === "succeeded") {
      await updateBooking(bookingId, {
        payment_status: PaymentStatus.SUCCEEDED,
        stripe_metadata: {
          ...booking.stripe_metadata,
          additionalPayments: [
            ...(booking.stripe_metadata?.additionalPayments || []),
            {
              paymentIntentId: paymentIntent.id,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              reason: reason || "additional_payment",
              capturedAt: new Date().toISOString(),
            },
          ],
        },
      })
    }

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    })
  } catch (error: any) {
    console.error("Error charging saved payment method:", error)
    return NextResponse.json(
      { error: error.message || "Failed to charge saved payment method" },
      { status: 500 }
    )
  }
}
