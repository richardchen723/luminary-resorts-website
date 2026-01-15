/**
 * Test script to create a message in a Hostaway conversation
 * 
 * Based on the conversation structure, we need to:
 * 1. Find or create a conversation for a reservation
 * 2. POST to /conversations/{id}/messages with the correct payload
 */

import { makeRequest, getListingMapId, createInquiry } from "../lib/hostaway"

async function testCreateMessage() {
  console.log("🔍 Testing Message Creation in Hostaway Conversations\n")

  // Step 1: Create a test inquiry
  console.log("📋 Step 1: Creating test inquiry...")
  const listingId = 472341
  let reservationId: number
  
  try {
    const inquiryResult = await createInquiry({
      listingId,
      checkIn: "2026-03-25",
      checkOut: "2026-03-27",
      guests: 2,
      adults: 2,
      guestInfo: {
        firstName: "Message",
        lastName: "Creation",
        email: "message.creation@example.com",
        phone: "+15551234601",
        country: "US",
      },
      message: "Initial inquiry message",
    })
    
    reservationId = parseInt(inquiryResult.hostawayReservationId)
    console.log(`✅ Created inquiry with Reservation ID: ${reservationId}\n`)
  } catch (error: any) {
    console.error(`❌ Failed to create inquiry: ${error.message}`)
    return
  }

  // Step 2: Wait a moment and check if conversation exists
  console.log("📧 Step 2: Checking for conversation...")
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  let conversationId: number | null = null
  try {
    const conversations = await makeRequest<any[]>("/conversations", {
      method: "GET",
    })
    
    const reservationConversation = conversations.find(
      (conv: any) => conv.reservationId === reservationId
    )
    
    if (reservationConversation) {
      conversationId = reservationConversation.id
      console.log(`✅ Found conversation ID: ${conversationId}\n`)
    } else {
      console.log("❌ No conversation found for this reservation")
      console.log("Trying to use an existing conversation for testing...\n")
      
      // Use an existing conversation for testing
      if (conversations.length > 0) {
        conversationId = conversations[0].id
        reservationId = conversations[0].reservationId
        console.log(`Using existing conversation ID: ${conversationId}`)
        console.log(`Linked to reservation ID: ${reservationId}\n`)
      }
    }
  } catch (error: any) {
    console.log(`❌ Failed to get conversations: ${error.message}`)
    return
  }

  if (!conversationId) {
    console.log("❌ Cannot proceed without a conversation ID")
    return
  }

  // Step 3: Try different payload structures for creating messages
  const testMessage = "This is a test message created via API to test the messaging endpoint"

  // Test 1: Simple body field
  console.log(`📧 Test 1: POST /conversations/${conversationId}/messages with 'body' field...`)
  try {
    const result = await makeRequest<any>(`/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: testMessage,
      }),
    })
    console.log("✅ Success! Message created with 'body' field")
    console.log("Response:", JSON.stringify(result, null, 2))
  } catch (error: any) {
    console.log(`❌ Failed: ${error.message}`)
  }
  console.log()

  // Test 2: With message field
  console.log(`📧 Test 2: POST /conversations/${conversationId}/messages with 'message' field...`)
  try {
    const result = await makeRequest<any>(`/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: testMessage,
      }),
    })
    console.log("✅ Success! Message created with 'message' field")
    console.log("Response:", JSON.stringify(result, null, 2))
  } catch (error: any) {
    console.log(`❌ Failed: ${error.message}`)
  }
  console.log()

  // Test 3: With full structure based on existing messages
  console.log(`📧 Test 3: POST /conversations/${conversationId}/messages with full structure...`)
  try {
    // Get the conversation to see its structure
    const conversations = await makeRequest<any[]>("/conversations", {
      method: "GET",
    })
    const conv = conversations.find((c: any) => c.id === conversationId)
    
    const result = await makeRequest<any>(`/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: testMessage,
        reservationId: reservationId,
        listingMapId: conv?.listingMapId,
        isIncoming: 0, // 0 = outgoing (from host), 1 = incoming (from guest)
        communicationType: "email",
        messageSource: "API",
        originatedBy: "user",
      }),
    })
    console.log("✅ Success! Message created with full structure")
    console.log("Response:", JSON.stringify(result, null, 2))
  } catch (error: any) {
    console.log(`❌ Failed: ${error.message}`)
  }
  console.log()

  // Test 4: Check if we need to create conversation first
  console.log("📧 Test 4: Checking if we can create a conversation for the reservation...")
  try {
    const result = await makeRequest<any>("/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reservationId: reservationId,
        type: "host-guest-email",
        recipientEmail: "message.creation@example.com",
      }),
    })
    console.log("✅ Success! Can create conversation")
    console.log("Response:", JSON.stringify(result, null, 2))
    
    // If conversation was created, try to add message
    if (result.id) {
      console.log(`\n📧 Adding message to newly created conversation ${result.id}...`)
      try {
        const messageResult = await makeRequest<any>(`/conversations/${result.id}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            body: testMessage,
          }),
        })
        console.log("✅ Message added to new conversation!")
        console.log("Response:", JSON.stringify(messageResult, null, 2))
      } catch (error: any) {
        console.log(`❌ Failed to add message: ${error.message}`)
      }
    }
  } catch (error: any) {
    console.log(`❌ Failed to create conversation: ${error.message}`)
  }
  console.log()

  console.log("✅ Testing complete!")
}

testCreateMessage().catch((error) => {
  console.error("❌ Test script failed:", error)
  process.exit(1)
})
