/**
 * Test endpoint to verify Hostaway booking creation
 * POST /api/test/booking
 * Body: { listingId, startDate, endDate, guests, guest }
 */

import { NextResponse } from "next/server"
import { createBooking } from "@/lib/hostaway"
import type { HostawayBookingRequest } from "@/types/hostaway"

export async function POST(request: Request) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "This endpoint is only available in development" },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    const { listingId, startDate, endDate, guests, guest } = body
    
    if (!listingId || !startDate || !endDate || !guests || !guest) {
      return NextResponse.json(
        { error: "Missing required fields: listingId, startDate, endDate, guests, and guest are required" },
        { status: 400 }
      )
    }

    // Validate guest information
    if (!guest.firstName || !guest.lastName || !guest.email || !guest.phone) {
      return NextResponse.json(
        { error: "Guest information must include firstName, lastName, email, and phone" },
        { status: 400 }
      )
    }

    const bookingRequest: HostawayBookingRequest = {
      listingId: parseInt(listingId, 10),
      startDate,
      endDate,
      guests: parseInt(guests, 10),
      guest: {
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone,
        countryCode: guest.countryCode || "US",
        address: guest.address,
        city: guest.city,
        state: guest.state,
        zipCode: guest.zipCode,
      },
    }

    console.log("Attempting to create Hostaway booking with data:")
    console.log(JSON.stringify(bookingRequest, null, 2))

    const result = await createBooking(bookingRequest)

    return NextResponse.json(
      {
        success: true,
        message: "Booking created successfully",
        booking: result,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating Hostaway booking:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create booking",
        details: error.stack,
      },
      { status: 500 }
    )
  }
}
