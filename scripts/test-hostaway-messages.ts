/**
 * Test script to investigate Hostaway API messaging endpoints
 * 
 * This script will test various possible endpoints for creating messages
 * that appear in the Hostaway inbox/messaging system for inquiries.
 */

import { makeRequest, getListingMapId, createInquiry } from "../lib/hostaway"
import { getListingIdBySlug } from "../lib/listing-map"

async function testHostawayMessages() {
  console.log("🔍 Testing Hostaway API Messaging Endpoints\n")

  const listingId = 472341 // Dew cabin
  const listingMapId = await getListingMapId(listingId)
  
  console.log(`Test Listing ID: ${listingId}`)
  console.log(`Test Listing Map ID: ${listingMapId}\n`)

  // First, create a test inquiry to get a reservation ID
  console.log("📋 Step 1: Creating test inquiry...")
  let inquiryId: number
  let reservationId: number
  
  try {
    const inquiryResult = await createInquiry({
      listingId,
      checkIn: "2026-03-15",
      checkOut: "2026-03-17",
      guests: 2,
      adults: 2,
      guestInfo: {
        firstName: "Message",
        lastName: "Test",
        email: "message.test@example.com",
        phone: "+15551234599",
        country: "US",
      },
      message: "This is a test message to investigate messaging endpoints",
    })
    
    inquiryId = inquiryResult.id
    reservationId = parseInt(inquiryResult.hostawayReservationId)
    console.log(`✅ Created inquiry with ID: ${inquiryId}`)
    console.log(`   Reservation ID: ${reservationId}\n`)
  } catch (error: any) {
    console.error(`❌ Failed to create inquiry: ${error.message}`)
    return
  }

  const testMessage = "This is a test message sent via API to test messaging endpoints"

  // Test 1: POST /messages
  console.log("📧 Test 1: POST /messages endpoint...")
  try {
    const result = await makeRequest<any>("/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reservationId,
        message: testMessage,
        fromGuest: true,
      }),
    })
    console.log("✅ POST /messages endpoint exists!")
    console.log("Response:", JSON.stringify(result, null, 2).substring(0, 500))
  } catch (error: any) {
    console.log(`❌ POST /messages: ${error.message}`)
  }
  console.log()

  // Test 2: POST /reservations/{id}/messages
  console.log(`📧 Test 2: POST /reservations/${reservationId}/messages endpoint...`)
  try {
    const result = await makeRequest<any>(`/reservations/${reservationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: testMessage,
        fromGuest: true,
      }),
    })
    console.log("✅ POST /reservations/{id}/messages endpoint exists!")
    console.log("Response:", JSON.stringify(result, null, 2).substring(0, 500))
  } catch (error: any) {
    console.log(`❌ POST /reservations/{id}/messages: ${error.message}`)
  }
  console.log()

  // Test 3: POST /conversations
  console.log("📧 Test 3: POST /conversations endpoint...")
  try {
    const result = await makeRequest<any>("/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reservationId,
        initialMessage: testMessage,
        fromGuest: true,
      }),
    })
    console.log("✅ POST /conversations endpoint exists!")
    console.log("Response:", JSON.stringify(result, null, 2).substring(0, 500))
  } catch (error: any) {
    console.log(`❌ POST /conversations: ${error.message}`)
  }
  console.log()

  // Test 4: POST /threads
  console.log("📧 Test 4: POST /threads endpoint...")
  try {
    const result = await makeRequest<any>("/threads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reservationId,
        message: testMessage,
        fromGuest: true,
      }),
    })
    console.log("✅ POST /threads endpoint exists!")
    console.log("Response:", JSON.stringify(result, null, 2).substring(0, 500))
  } catch (error: any) {
    console.log(`❌ POST /threads: ${error.message}`)
  }
  console.log()

  // Test 5: GET /messages (to see structure)
  console.log("📧 Test 5: GET /messages endpoint (to see structure)...")
  try {
    const result = await makeRequest<any>("/messages", {
      method: "GET",
    })
    console.log("✅ GET /messages endpoint exists!")
    console.log("Response structure:", JSON.stringify(result, null, 2).substring(0, 1000))
  } catch (error: any) {
    console.log(`❌ GET /messages: ${error.message}`)
  }
  console.log()

  // Test 6: GET /reservations/{id}/messages
  console.log(`📧 Test 6: GET /reservations/${reservationId}/messages endpoint...`)
  try {
    const result = await makeRequest<any>(`/reservations/${reservationId}/messages`, {
      method: "GET",
    })
    console.log("✅ GET /reservations/{id}/messages endpoint exists!")
    console.log("Response:", JSON.stringify(result, null, 2).substring(0, 1000))
  } catch (error: any) {
    console.log(`❌ GET /reservations/{id}/messages: ${error.message}`)
  }
  console.log()

  // Test 7: GET /conversations
  console.log("📧 Test 7: GET /conversations endpoint...")
  try {
    const result = await makeRequest<any>("/conversations", {
      method: "GET",
    })
    console.log("✅ GET /conversations endpoint exists!")
    console.log("Response structure:", JSON.stringify(result, null, 2).substring(0, 1000))
  } catch (error: any) {
    console.log(`❌ GET /conversations: ${error.message}`)
  }
  console.log()

  // Test 8: PUT /reservations/{id} (update with message)
  console.log(`📧 Test 8: PUT /reservations/${reservationId} (trying to add message via update)...`)
  try {
    // First get the current reservation
    const currentReservation = await makeRequest<any>(`/reservations/${reservationId}`, {
      method: "GET",
    })
    
    // Try updating with a new message in guestNote
    const result = await makeRequest<any>(`/reservations/${reservationId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...currentReservation,
        guestNote: `${currentReservation.guestNote || ""}\n\n[API Update] ${testMessage}`,
      }),
    })
    console.log("✅ PUT /reservations/{id} update successful!")
    console.log("Updated guestNote:", result.guestNote)
  } catch (error: any) {
    console.log(`❌ PUT /reservations/{id}: ${error.message}`)
  }
  console.log()

  // Test 9: Check if there's a /channels/{channelId}/messages endpoint
  console.log("📧 Test 9: POST /channels/2000/messages (Direct channel messages)...")
  try {
    const result = await makeRequest<any>("/channels/2000/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reservationId,
        message: testMessage,
        fromGuest: true,
      }),
    })
    console.log("✅ POST /channels/{id}/messages endpoint exists!")
    console.log("Response:", JSON.stringify(result, null, 2).substring(0, 500))
  } catch (error: any) {
    console.log(`❌ POST /channels/{id}/messages: ${error.message}`)
  }
  console.log()

  // Test 10: Check reservation response for message-related fields
  console.log(`📧 Test 10: GET /reservations/${reservationId} (checking for message fields)...`)
  try {
    const reservation = await makeRequest<any>(`/reservations/${reservationId}`, {
      method: "GET",
    })
    console.log("✅ Reservation retrieved!")
    console.log("Fields related to messages:")
    console.log(`  - comment: ${reservation.comment || "(empty)"}`)
    console.log(`  - guestNote: ${reservation.guestNote || "(empty)"}`)
    console.log(`  - hostNote: ${reservation.hostNote || "(empty)"}`)
    console.log(`  - guestEmail: ${reservation.guestEmail || "(empty)"}`)
    
    // Check for any message-related fields
    const messageFields = Object.keys(reservation).filter(key => 
      key.toLowerCase().includes('message') || 
      key.toLowerCase().includes('thread') || 
      key.toLowerCase().includes('conversation') ||
      key.toLowerCase().includes('inbox')
    )
    if (messageFields.length > 0) {
      console.log(`  - Message-related fields found: ${messageFields.join(", ")}`)
      messageFields.forEach(field => {
        console.log(`    ${field}: ${JSON.stringify(reservation[field])}`)
      })
    } else {
      console.log("  - No message-related fields found in reservation object")
    }
  } catch (error: any) {
    console.log(`❌ GET /reservations/{id}: ${error.message}`)
  }
  console.log()

  console.log("✅ Testing complete!")
  console.log(`\n⚠️  Note: Test inquiry (ID: ${inquiryId}) should be deleted from Hostaway dashboard`)
}

// Run tests
testHostawayMessages().catch((error) => {
  console.error("❌ Test script failed:", error)
  process.exit(1)
})
