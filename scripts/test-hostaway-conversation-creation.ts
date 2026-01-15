/**
 * Test script to find how to create or find conversations for reservations
 */

import { makeRequest, getListingMapId, createInquiry } from "../lib/hostaway"

async function testConversationCreation() {
  console.log("🔍 Testing Conversation Creation and Finding\n")

  // Create a test inquiry
  console.log("📋 Step 1: Creating test inquiry...")
  const listingId = 472341
  let reservationId: number
  let guestEmail: string
  
  try {
    const inquiryResult = await createInquiry({
      listingId,
      checkIn: "2026-03-30",
      checkOut: "2026-04-01",
      guests: 2,
      adults: 2,
      guestInfo: {
        firstName: "Conversation",
        lastName: "Finder",
        email: "conversation.finder@example.com",
        phone: "+15551234602",
        country: "US",
      },
      message: "Test message for conversation finding",
    })
    
    reservationId = parseInt(inquiryResult.hostawayReservationId)
    guestEmail = "conversation.finder@example.com"
    console.log(`✅ Created inquiry with Reservation ID: ${reservationId}\n`)
  } catch (error: any) {
    console.error(`❌ Failed to create inquiry: ${error.message}`)
    return
  }

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Test 1: Query conversations by reservationId
  console.log(`📧 Test 1: GET /conversations?reservationId=${reservationId}...`)
  try {
    const result = await makeRequest<any[]>(`/conversations?reservationId=${reservationId}`, {
      method: "GET",
    })
    console.log(`✅ Found ${result.length} conversation(s) for this reservation`)
    if (result.length > 0) {
      console.log("Conversation:", JSON.stringify(result[0], null, 2).substring(0, 500))
    }
  } catch (error: any) {
    console.log(`❌ Failed: ${error.message}`)
  }
  console.log()

  // Test 2: Query conversations by guestEmail
  console.log(`📧 Test 2: GET /conversations?guestEmail=${guestEmail}...`)
  try {
    const result = await makeRequest<any[]>(`/conversations?guestEmail=${guestEmail}`, {
      method: "GET",
    })
    console.log(`✅ Found ${result.length} conversation(s) for this email`)
    if (result.length > 0) {
      console.log("Conversation:", JSON.stringify(result[0], null, 2).substring(0, 500))
    }
  } catch (error: any) {
    console.log(`❌ Failed: ${error.message}`)
  }
  console.log()

  // Test 3: Get all conversations and filter
  console.log("📧 Test 3: Getting all conversations and filtering by reservationId...")
  try {
    const allConversations = await makeRequest<any[]>("/conversations", {
      method: "GET",
    })
    
    const matchingConversations = allConversations.filter(
      (conv: any) => conv.reservationId === reservationId
    )
    
    console.log(`✅ Found ${matchingConversations.length} conversation(s) for reservation ${reservationId}`)
    
    if (matchingConversations.length > 0) {
      const conv = matchingConversations[0]
      console.log(`Conversation ID: ${conv.id}`)
      console.log(`Type: ${conv.type}`)
      
      // Try to add a message to this conversation
      console.log(`\n📧 Adding message to conversation ${conv.id}...`)
      try {
        const messageResult = await makeRequest<any>(`/conversations/${conv.id}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            body: "This message was added via API after finding the conversation",
          }),
        })
        console.log("✅ Message successfully added!")
        console.log("Message ID:", messageResult.id)
        console.log("Message body:", messageResult.body)
      } catch (error: any) {
        console.log(`❌ Failed to add message: ${error.message}`)
      }
    } else {
      console.log("❌ No conversation found - need to create one or use different approach")
    }
  } catch (error: any) {
    console.log(`❌ Failed: ${error.message}`)
  }
  console.log()

  // Test 4: Try different POST /conversations payloads
  console.log("📧 Test 4: Trying different ways to create conversation...")
  
  const testPayloads = [
    {
      name: "With reservationId and type",
      payload: {
        reservationId: reservationId,
        type: "host-guest-email",
      },
    },
    {
      name: "With reservationId, type, and recipientEmail",
      payload: {
        reservationId: reservationId,
        type: "host-guest-email",
        recipientEmail: guestEmail,
      },
    },
    {
      name: "With listingMapId, reservationId, and type",
      payload: {
        listingMapId: 472341,
        reservationId: reservationId,
        type: "host-guest-email",
        recipientEmail: guestEmail,
      },
    },
  ]

  for (const test of testPayloads) {
    console.log(`\n  Trying: ${test.name}...`)
    try {
      const result = await makeRequest<any>("/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(test.payload),
      })
      console.log(`  ✅ Success! Created conversation ID: ${result.id}`)
      
      // Try to add message immediately
      try {
        const messageResult = await makeRequest<any>(`/conversations/${result.id}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            body: "Initial message in newly created conversation",
          }),
        })
        console.log(`  ✅ Message added! Message ID: ${messageResult.id}`)
      } catch (error: any) {
        console.log(`  ❌ Failed to add message: ${error.message}`)
      }
      break // Stop if one works
    } catch (error: any) {
      console.log(`  ❌ Failed: ${error.message}`)
    }
  }
  console.log()

  console.log("✅ Testing complete!")
}

testConversationCreation().catch((error) => {
  console.error("❌ Test script failed:", error)
  process.exit(1)
})
