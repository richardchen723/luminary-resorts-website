import { NextResponse } from "next/server"
import { createInquiry } from "@/lib/hostaway"
import { getListingIdBySlug } from "@/lib/listing-map"

interface CreateInquiryRequest {
  slug: string
  checkIn: string // YYYY-MM-DD
  checkOut: string // YYYY-MM-DD
  guests: number
  pets?: number
  infants?: number
  guestInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    countryCode: string
  }
  message: string
}

export async function POST(request: Request) {
  try {
    const body: CreateInquiryRequest = await request.json()
    const { slug, checkIn, checkOut, guests, pets, infants, guestInfo, message } = body

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/inquiry/create/route.ts:29',message:'API endpoint - message received in request body',data:{message:message,messageLength:message?.length||0,messageType:typeof message,hasMessage:!!message,messageTrimmed:message?.trim(),messageTrimmedLength:message?.trim()?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    // Validate required fields
    if (!slug || !checkIn || !checkOut || !guests) {
      return NextResponse.json(
        { error: "Missing required fields: slug, checkIn, checkOut, guests" },
        { status: 400 }
      )
    }

    if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone) {
      return NextResponse.json(
        { error: "Missing required guest information: firstName, lastName, email, phone" },
        { status: 400 }
      )
    }

    // Validate message is provided and not empty
    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Validate dates
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      )
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: "Check-out date must be after check-in date" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(guestInfo.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Get listing ID from slug
    const listingId = getListingIdBySlug(slug)
    if (!listingId) {
      return NextResponse.json(
        { error: `Listing not found for slug: ${slug}` },
        { status: 404 }
      )
    }

    // Create inquiry in Hostaway
    try {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/inquiry/create/route.ts:85',message:'API endpoint - calling createInquiry with message',data:{message:message,messageTrimmed:message?.trim(),messageTrimmedLength:message?.trim()?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      const result = await createInquiry({
        listingId,
        checkIn,
        checkOut,
        guests,
        adults: guests, // Assume all guests are adults for inquiries
        pets: pets || undefined,
        infants: infants || undefined,
        guestInfo: {
          firstName: guestInfo.firstName,
          lastName: guestInfo.lastName,
          email: guestInfo.email,
          phone: guestInfo.phone,
          country: guestInfo.countryCode || "US",
        },
        message: message.trim(),
      })

      return NextResponse.json({
        success: true,
        inquiryId: result.id,
        hostawayReservationId: result.hostawayReservationId,
        message: "Inquiry created successfully",
      })
    } catch (error: any) {
      console.error("Error creating inquiry:", error)
      return NextResponse.json(
        { error: `Failed to create inquiry: ${error.message || "Unknown error"}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Error in inquiry creation endpoint:", error)
    return NextResponse.json(
      { error: error.message || "Failed to process inquiry request" },
      { status: 500 }
    )
  }
}
