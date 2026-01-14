/**
 * PATCH /api/booking/[id]/modify
 * Modify a booking (dates, guests, etc.)
 */

import { NextResponse } from "next/server"
import { modifyBookingOperation } from "@/lib/booking-operations"
import { getBookingById } from "@/lib/db/bookings"

interface ModifyBookingRequest {
  checkIn?: string
  checkOut?: string
  guests?: number
  adults?: number
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: ModifyBookingRequest = await request.json()
    
    // Validate that at least one field is being updated
    if (!body.checkIn && !body.checkOut && !body.guests && !body.adults) {
      return NextResponse.json(
        { error: "At least one field must be provided for modification" },
        { status: 400 }
      )
    }
    
    // Verify booking exists
    const existingBooking = await getBookingById(id)
    if (!existingBooking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }
    
    // Modify booking
    const updatedBooking = await modifyBookingOperation(id, {
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      guests: body.guests,
      adults: body.adults,
    })
    
    return NextResponse.json({
      success: true,
      booking: {
        id: updatedBooking.id,
        confirmationCode: `LR-${updatedBooking.id.substring(0, 8).toUpperCase()}`,
        arrivalDate: updatedBooking.arrival_date,
        departureDate: updatedBooking.departure_date,
        numberOfGuests: updatedBooking.number_of_guests,
        reservationStatus: updatedBooking.reservation_status,
      },
    })
  } catch (error: any) {
    console.error("Error modifying booking:", error)
    return NextResponse.json(
      { error: error.message || "Failed to modify booking" },
      { status: 500 }
    )
  }
}
