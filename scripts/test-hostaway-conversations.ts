/**
 * Test script to investigate Hostaway conversations structure
 * and find how to create messages in conversations
 */

import { makeRequest, getListingMapId, createInquiry } from "../lib/hostaway"
import { getListingIdBySlug } from "../lib/listing-map"

async function testHostawayConversations() {
  console.log("🔍 Investigating Hostaway Conversations Structure\n")

  // Get existing conversations to understand structure
  console.log("📧 Step 1: Getting all conversations...")
  try {
    const conversations = await makeRequest<any[]>("/conversations", {
      method: "GET",
    })
    
    console.log(`✅ Found ${conversations.length} conversations\n`)
    
    if (conversations.length > 0) {
      const firstConv = conversations[0]
      console.log("Sample conversation structure:")
      console.log(JSON.stringify(firstConv, null, 2).substring(0, 2000))
      console.log("\n")
      
      // Check if there are messages
      if (firstConv.conversationMessages && firstConv.conversationMessages.length > 0) {
        const firstMessage = firstConv.conversationMessages[0]
        console.log("Sample message structure:")
        console.log(JSON.stringify(firstMessage, null, 2))
        console.log("\n")
      }
    }
  } catch (error: any) {
    console.log(`❌ Failed to get conversations: ${error.message}`)
    return
  }

  // Create a test inquiry
  console.log("📋 Step 2: Creating test inquiry...")
  const listingId = 472341
  let inquiryId: number
  let reservationId: number
  
  try {
    const inquiryResult = await createInquiry({
      listingId,
      checkIn: "2026-03-20",
      checkOut: "2026-03-22",
      guests: 2,
      adults: 2,
      guestInfo: {
        firstName: "Conversation",
        lastName: "Test",
        email: "conversation.test@example.com",
        phone: "+15551234600",
        country: "US",
      },
      message: "Test message for conversation investigation",
    })
    
    inquiryId = inquiryResult.id
    reservationId = parseInt(inquiryResult.hostawayReservationId)
    console.log(`✅ Created inquiry with ID: ${inquiryId}, Reservation ID: ${reservationId}\n`)
  } catch (error: any) {
    console.error(`❌ Failed to create inquiry: ${error.message}`)
    return
  }

  // Wait a moment for Hostaway to process
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Check if a conversation was automatically created for this reservation
  console.log(`📧 Step 3: Checking if conversation exists for reservation ${reservationId}...`)
  try {
    const conversations = await makeRequest<any[]>("/conversations", {
      method: "GET",
    })
    
    const reservationConversation = conversations.find(
      (conv: any) => conv.reservationId === reservationId
    )
    
    if (reservationConversation) {
      console.log("✅ Conversation found for this reservation!")
      console.log("Conversation ID:", reservationConversation.id)
      console.log("Conversation type:", reservationConversation.type)
      console.log("Has unread messages:", reservationConversation.hasUnreadMessages)
      console.log("Messages count:", reservationConversation.conversationMessages?.length || 0)
      console.log("\nFull conversation:")
      console.log(JSON.stringify(reservationConversation, null, 2))
    } else {
      console.log("❌ No conversation found for this reservation")
      console.log("This suggests conversations are not auto-created for direct inquiries")
    }
  } catch (error: any) {
    console.log(`❌ Failed to check conversations: ${error.message}`)
  }
  console.log()

  // Try to find endpoints to create messages in conversations
  console.log("📧 Step 4: Testing possible message creation endpoints...")
  
  // Get a conversation ID from existing conversations
  try {
    const conversations = await makeRequest<any[]>("/conversations", {
      method: "GET",
    })
    
    if (conversations.length > 0) {
      const testConvId = conversations[0].id
      console.log(`Using conversation ID ${testConvId} for testing\n`)
      
      // Test 1: POST /conversations/{id}/messages
      console.log(`Test 1: POST /conversations/${testConvId}/messages...`)
      try {
        const result = await makeRequest<any>(`/conversations/${testConvId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: "Test message via API",
            fromGuest: false,
          }),
        })
        console.log("✅ POST /conversations/{id}/messages works!")
        console.log("Response:", JSON.stringify(result, null, 2))
      } catch (error: any) {
        console.log(`❌ POST /conversations/{id}/messages: ${error.message}`)
      }
      console.log()

      // Test 2: POST /conversationMessages
      console.log("Test 2: POST /conversationMessages...")
      try {
        const result = await makeRequest<any>("/conversationMessages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId: testConvId,
            reservationId: conversations[0].reservationId,
            message: "Test message via conversationMessages endpoint",
            fromGuest: false,
          }),
        })
        console.log("✅ POST /conversationMessages works!")
        console.log("Response:", JSON.stringify(result, null, 2))
      } catch (error: any) {
        console.log(`❌ POST /conversationMessages: ${error.message}`)
      }
      console.log()

      // Test 3: POST /messages with conversationId
      console.log("Test 3: POST /messages with conversationId...")
      try {
        const result = await makeRequest<any>("/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId: testConvId,
            message: "Test message with conversationId",
            fromGuest: false,
          }),
        })
        console.log("✅ POST /messages with conversationId works!")
        console.log("Response:", JSON.stringify(result, null, 2))
      } catch (error: any) {
        console.log(`❌ POST /messages: ${error.message}`)
      }
      console.log()
    }
  } catch (error: any) {
    console.log(`❌ Failed to test message creation: ${error.message}`)
  }

  console.log("✅ Investigation complete!")
  console.log(`\n⚠️  Note: Test inquiry (ID: ${inquiryId}) should be deleted from Hostaway dashboard`)
}

testHostawayConversations().catch((error) => {
  console.error("❌ Test script failed:", error)
  process.exit(1)
})
