/**
 * GET /api/booking/[id]
 * Get booking details by ID
 */

import { NextResponse } from "next/server"
import { getBookingById } from "@/lib/db/bookings"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const booking = await getBookingById(id)
    
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      booking: {
        id: booking.id,
        confirmationCode: `LR-${booking.id.substring(0, 8).toUpperCase()}`,
        slug: booking.slug,
        arrivalDate: booking.arrival_date,
        departureDate: booking.departure_date,
        numberOfGuests: booking.number_of_guests,
        totalPrice: booking.total_price,
        currency: booking.currency,
        paymentStatus: booking.payment_status,
        reservationStatus: booking.reservation_status,
        guestInfo: {
          firstName: booking.guest_first_name,
          lastName: booking.guest_last_name,
          email: booking.guest_email,
          phone: booking.guest_phone,
        },
        createdAt: booking.created_at,
      },
    })
  } catch (error: any) {
    console.error("Error getting booking:", error)
    return NextResponse.json(
      { error: error.message || "Failed to get booking" },
      { status: 500 }
    )
  }
}
