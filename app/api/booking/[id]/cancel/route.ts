/**
 * POST /api/booking/[id]/cancel
 * Cancel a booking and process refund if applicable
 */

import { NextResponse } from "next/server"
import { cancelBookingOperation } from "@/lib/booking-operations"
import { getBookingById } from "@/lib/db/bookings"
import { createRefund } from "@/lib/stripe"

interface CancelBookingRequest {
  email?: string // For verification
  refundAmount?: number // Optional: specify refund amount in cents
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: CancelBookingRequest = await request.json()
    
    // Get booking
    const booking = await getBookingById(id)
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }
    
    // Verify email if provided
    if (body.email && body.email !== booking.guest_email) {
      return NextResponse.json(
        { error: "Email does not match booking" },
        { status: 403 }
      )
    }
    
    // Calculate refund based on cancellation policy
    let refundAmount: number | undefined
    
    // Cancellation policy: Full refund if cancelled within 48 hours of booking
    const bookingDate = new Date(booking.created_at)
    const now = new Date()
    const hoursSinceBooking = (now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60)
    
    if (hoursSinceBooking <= 48) {
      // Full refund
      refundAmount = Math.round(booking.total_price * 100) // Convert to cents
    } else {
      // Partial refund based on days before arrival
      const arrivalDate = new Date(booking.arrival_date)
      const daysUntilArrival = (arrivalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysUntilArrival >= 14) {
        // 50% refund if cancelled 14+ days before arrival
        refundAmount = Math.round(booking.total_price * 100 * 0.5)
      } else if (daysUntilArrival >= 7) {
        // 25% refund if cancelled 7-14 days before arrival
        refundAmount = Math.round(booking.total_price * 100 * 0.25)
      }
      // No refund if cancelled less than 7 days before arrival
    }
    
    // Process refund if applicable
    if (refundAmount && refundAmount > 0) {
      try {
        await createRefund({
          paymentIntentId: booking.stripe_payment_intent_id,
          amount: body.refundAmount ? body.refundAmount : refundAmount,
          reason: "requested_by_customer",
          metadata: {
            bookingId: booking.id,
            cancelledAt: new Date().toISOString(),
          },
        })
      } catch (error: any) {
        console.error("Error processing refund:", error)
        // Continue with cancellation even if refund fails
      }
    }
    
    // Cancel booking
    const cancelledBooking = await cancelBookingOperation(
      id,
      refundAmount ? refundAmount / 100 : undefined // Convert cents to dollars
    )
    
    return NextResponse.json({
      success: true,
      booking: {
        id: cancelledBooking.id,
        confirmationCode: `LR-${cancelledBooking.id.substring(0, 8).toUpperCase()}`,
        reservationStatus: cancelledBooking.reservation_status,
        paymentStatus: cancelledBooking.payment_status,
        refundAmount: refundAmount ? refundAmount / 100 : 0,
      },
    })
  } catch (error: any) {
    console.error("Error cancelling booking:", error)
    return NextResponse.json(
      { error: error.message || "Failed to cancel booking" },
      { status: 500 }
    )
  }
}
