import { NextResponse } from "next/server"
import { getBookingById } from "@/lib/db/bookings"

/**
 * GET /api/booking/confirm?bookingId={id}
 * Get booking status by booking ID
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("bookingId")

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId query parameter is required" },
        { status: 400 }
      )
    }

    // bookingId is a UUID string, not a number
    try {
      const booking = await getBookingById(bookingId)
      
      if (!booking) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        )
      }

      return NextResponse.json(
        {
          success: true,
          booking: {
            id: booking.id,
            confirmationCode: `LR-${booking.id.substring(0, 8).toUpperCase()}`,
            status: booking.reservation_status,
            startDate: booking.arrival_date,
            endDate: booking.departure_date,
            guests: booking.number_of_guests,
            totalPrice: booking.total_price,
            currency: booking.currency,
            createdAt: booking.created_at,
          },
        },
        { status: 200 }
      )
    } catch (error: any) {
      console.error("Error fetching booking:", error)
      
      if (error.message?.includes("not found") || error.message?.includes("404")) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: error.message || "Failed to fetch booking status" },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Error in booking confirmation endpoint:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    )
  }
}
