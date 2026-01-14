import { NextResponse } from "next/server"
import { createBooking, getPricing, getListing } from "@/lib/hostaway"
import { getListingIdBySlug } from "@/lib/listing-map"
import { checkCabinAvailability } from "@/lib/availability"
import type { HostawayBookingRequest, HostawayGuestInfo } from "@/types/hostaway"

interface BookingCreateRequest {
  slug: string
  startDate: string
  endDate: string
  guests: number
  guest: HostawayGuestInfo
  paymentMethod?: "credit_card" | "paypal" | "bank_transfer"
  paymentData?: {
    cardNumber?: string
    expiryMonth?: string
    expiryYear?: string
    cvv?: string
    cardholderName?: string
  }
}

/**
 * POST /api/booking/create
 * Create a new booking
 */
export async function POST(request: Request) {
  try {
    const body: BookingCreateRequest = await request.json()
    const { slug, startDate, endDate, guests, guest, paymentMethod, paymentData } = body

    // Validate required fields
    if (!slug || !startDate || !endDate || !guests || !guest) {
      return NextResponse.json(
        { error: "Missing required fields: slug, startDate, endDate, guests, and guest information are required" },
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

    // Get listing ID
    const listingId = getListingIdBySlug(slug)
    if (!listingId) {
      return NextResponse.json(
        { error: `No listing found for cabin: ${slug}` },
        { status: 404 }
      )
    }

    // Re-check availability before booking (prevent race conditions)
    const availability = await checkCabinAvailability(slug, startDate, endDate, guests)
    if (!availability.available) {
      return NextResponse.json(
        { error: "This cabin is no longer available for the selected dates. Please select different dates." },
        { status: 409 } // Conflict
      )
    }

    // Get pricing to verify total
    let totalPrice: number
    try {
      const pricing = await getPricing(listingId, startDate, endDate, guests)
      
      if (pricing.breakdown?.total) {
        // Use pricing from API if available
        totalPrice = pricing.breakdown.total
      } else {
        // Fallback: calculate using listing's base price
        try {
          const listingData = await getListing(listingId)
          const basePrice = listingData.averageNightlyPrice || listingData.listing.price || 200
          const currency = listingData.listing.currencyCode || "USD"
          
          // Calculate number of nights
          const start = new Date(startDate)
          const end = new Date(endDate)
          const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
          
          // Calculate pricing breakdown
          const subtotal = Math.round((basePrice * nights) * 100) / 100
          const cleaningFee = 100
          const tax = Math.round((subtotal * 0.12) * 100) / 100 // ~12% tax
          const channelFee = Math.round((subtotal * 0.02) * 100) / 100 // ~2% channel fee
          totalPrice = Math.round((subtotal + cleaningFee + tax + channelFee) * 100) / 100
        } catch (listingError: any) {
          console.error("Error getting listing for fallback pricing:", listingError)
          // Last resort: use hardcoded calculation
          const start = new Date(startDate)
          const end = new Date(endDate)
          const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
          const basePrice = 200
          const subtotal = Math.round((basePrice * nights) * 100) / 100
          const cleaningFee = 100
          const tax = Math.round((subtotal * 0.12) * 100) / 100
          const channelFee = Math.round((subtotal * 0.02) * 100) / 100
          totalPrice = Math.round((subtotal + cleaningFee + tax + channelFee) * 100) / 100
        }
      }
    } catch (error: any) {
      console.error("Error getting pricing:", error)
      // Try fallback calculation even if pricing API fails
      try {
        const listingData = await getListing(listingId)
        const basePrice = listingData.averageNightlyPrice || listingData.listing.price || 200
        const start = new Date(startDate)
        const end = new Date(endDate)
        const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        const subtotal = basePrice * nights
        const cleaningFee = 100
        const tax = Math.round(subtotal * 0.12)
        const channelFee = Math.round(subtotal * 0.02)
        totalPrice = subtotal + cleaningFee + tax + channelFee
      } catch (fallbackError: any) {
        console.error("Fallback pricing calculation failed:", fallbackError)
        return NextResponse.json(
          { error: "Failed to calculate pricing. Please try again." },
          { status: 500 }
        )
      }
    }

    // Prepare booking request
    const bookingRequest: HostawayBookingRequest = {
      listingId,
      startDate,
      endDate,
      guests,
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
        specialRequests: guest.specialRequests,
      },
      paymentMethod: paymentMethod || "credit_card",
      paymentData: paymentData
        ? {
            cardNumber: paymentData.cardNumber,
            expiryMonth: paymentData.expiryMonth,
            expiryYear: paymentData.expiryYear,
            cvv: paymentData.cvv,
            cardholderName: paymentData.cardholderName,
          }
        : undefined,
    }

    // Redirect to Hostaway booking engine instead of creating booking via API
    // Hostaway doesn't support direct booking creation via their public API
    // We need to redirect users to their booking engine widget
    const bookingEngineUrl = `https://book.luminaryresorts.com/listings/${listingId}?checkIn=${startDate}&checkOut=${endDate}&guests=${guests}`
    
    return NextResponse.json(
      {
        success: true,
        redirect: true,
        bookingEngineUrl,
        message: "Redirecting to secure booking page...",
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error in booking creation endpoint:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    )
  }
}
