/**
 * Test endpoint to verify Hostaway reservation creation with different formats
 * POST /api/test/reservation
 * 
 * Testing based on Hostaway support email indicating API supports reservation creation
 */

import { NextResponse } from "next/server"
import { makeRequest, deleteBooking } from "@/lib/hostaway"

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
    const { listingId, startDate, endDate, guests, guest } = body
    
    if (!listingId || !startDate || !endDate || !guests || !guest) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get listingMapId from listing - fetch from Hostaway API directly
    let listingMapId: number | null = null
    try {
      const { getListing } = await import("@/lib/hostaway")
      const listingData = await getListing(parseInt(listingId, 10))
      // The listing data structure: listingData.listing.listingMap
      listingMapId = (listingData as any).listing?.listingMap || (listingData as any).listingMap || null
      console.log(`Found listingMapId: ${listingMapId} for listing ${listingId}`)
      console.log(`Listing data structure:`, JSON.stringify(Object.keys(listingData), null, 2))
    } catch (error: any) {
      console.warn(`Could not fetch listingMapId: ${error.message}`)
      // Try to continue with listingId as fallback
      listingMapId = parseInt(listingId, 10)
      console.log(`Using listingId as fallback for listingMapId: ${listingMapId}`)
    }

    // Use listingId as listingMapId if we couldn't get it (they might be the same)
    if (!listingMapId) {
      listingMapId = parseInt(listingId, 10)
      console.log(`Using listingId as listingMapId: ${listingMapId}`)
    }

    const results: any[] = []

    // Test with correct payload format from Hostaway sample
    const testCase = {
      name: `Reservation with correct format (listingMapId: ${listingMapId})`,
      endpoint: "/reservations?forceOverbooking=1",
      payload: {
        channelId: 2000,
        listingMapId: listingMapId,
        isManuallyChecked: 0,
        isInitial: 0,
        guestName: `${guest.firstName} ${guest.lastName}`,
        guestFirstName: guest.firstName,
        guestLastName: guest.lastName,
        guestZipCode: guest.zipCode || "77331",
        guestAddress: guest.address || "",
        guestCity: guest.city || "Coldspring",
        guestCountry: guest.countryCode || "US",
        guestEmail: guest.email,
        phone: guest.phone,
        numberOfGuests: parseInt(guests, 10),
        adults: parseInt(guests, 10),
        children: null,
        infants: null,
        pets: null,
        arrivalDate: startDate,
        departureDate: endDate,
        totalPrice: 0, // Will be calculated by Hostaway
        currency: "USD",
      },
    }

    try {
      console.log(`Testing: ${testCase.name}`)
      console.log(`Endpoint: ${testCase.endpoint}`)
      console.log(`Payload:`, JSON.stringify(testCase.payload, null, 2))
      
      const result = await makeRequest<any>(testCase.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testCase.payload),
      })
      
      // If successful, return it and optionally delete the test reservation
      const reservationId = result.id || result.result?.id
      
      // If we have a reservation ID and this is a test, delete it
      if (reservationId && process.env.NODE_ENV === "development") {
        try {
          console.log(`Cleaning up test reservation ${reservationId}...`)
          await deleteBooking(reservationId)
          console.log(`✅ Test reservation ${reservationId} deleted`)
        } catch (deleteError: any) {
          console.warn(`⚠️ Could not delete test reservation ${reservationId}: ${deleteError.message}`)
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Success with: ${testCase.name}`,
        result,
        testCase: testCase.name,
        payload: testCase.payload,
        reservationId,
        deleted: !!reservationId,
      })
    } catch (error: any) {
      console.error(`Failed: ${testCase.name} - ${error.message}`)
      return NextResponse.json({
        success: false,
        error: error.message,
        endpoint: testCase.endpoint,
        payload: testCase.payload,
      }, { status: 500 })
    }

    for (const testCase of testCases) {
      try {
        console.log(`Testing: ${testCase.name}`)
        console.log(`Endpoint: ${testCase.endpoint}`)
        console.log(`Payload:`, JSON.stringify(testCase.payload, null, 2))
        
        const result = await makeRequest<any>(testCase.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testCase.payload),
        })
        
        results.push({
          test: testCase.name,
          success: true,
          result,
        })
        
        // If one succeeds, return it and optionally delete the test reservation
        const reservationId = result.id || result.result?.id
        
        // If we have a reservation ID and this is a test, delete it
        if (reservationId && process.env.NODE_ENV === "development") {
          try {
            console.log(`Cleaning up test reservation ${reservationId}...`)
            await deleteBooking(reservationId)
            console.log(`✅ Test reservation ${reservationId} deleted`)
          } catch (deleteError: any) {
            console.warn(`⚠️ Could not delete test reservation ${reservationId}: ${deleteError.message}`)
          }
        }
        
        return NextResponse.json({
          success: true,
          message: `Success with: ${testCase.name}`,
          result,
          testCase: testCase.name,
          payload: testCase.payload,
          reservationId,
          deleted: !!reservationId,
        })
      } catch (error: any) {
        const errorInfo = {
          test: testCase.name,
          success: false,
          error: error.message,
          endpoint: testCase.endpoint,
          status: error.response?.status,
          responseText: error.response?.text,
        }
        results.push(errorInfo)
        console.log(`Failed: ${testCase.name} - ${error.message}`)
      }
    }

    // If all failed, return all results
    return NextResponse.json({
      success: false,
      message: "All test cases failed",
      results,
    }, { status: 500 })
  } catch (error: any) {
    console.error("Error testing reservation creation:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to test reservation creation",
        details: error.stack,
      },
      { status: 500 }
    )
  }
}
