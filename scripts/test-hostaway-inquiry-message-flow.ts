/**
 * Complete test of the inquiry message flow:
 * 1. Create inquiry
 * 2. Wait for conversation to be created
 * 3. Query conversation by reservationId
 * 4. Add message to conversation
 */

import { makeRequest, getListingMapId, createInquiry } from "../lib/hostaway"

async function testInquiryMessageFlow() {
  console.log("🔍 Testing Complete Inquiry Message Flow\n")

  // Step 1: Create inquiry
  console.log("📋 Step 1: Creating inquiry with message...")
  const listingId = 472341
  let reservationId: number
  const inquiryMessage = "This is the inquiry message that should appear in Hostaway inbox"
  
  try {
    const inquiryResult = await createInquiry({
      listingId,
      checkIn: "2026-04-05",
      checkOut: "2026-04-07",
      guests: 2,
      adults: 2,
      guestInfo: {
        firstName: "Complete",
        lastName: "Flow",
        email: "complete.flow@example.com",
        phone: "+15551234603",
        country: "US",
      },
      message: inquiryMessage,
    })
    
    reservationId = parseInt(inquiryResult.hostawayReservationId)
    console.log(`✅ Created inquiry with Reservation ID: ${reservationId}\n`)
  } catch (error: any) {
    console.error(`❌ Failed to create inquiry: ${error.message}`)
    return
  }

  // Step 2: Wait for conversation to be created (may take a few seconds)
  console.log("⏳ Step 2: Waiting for conversation to be created...")
  let conversationId: number | null = null
  let attempts = 0
  const maxAttempts = 10
  
  while (attempts < maxAttempts && !conversationId) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    attempts++
    
    try {
      const conversations = await makeRequest<any[]>(`/conversations?reservationId=${reservationId}`, {
        method: "GET",
      })
      
      if (conversations.length > 0) {
        conversationId = conversations[0].id
        console.log(`✅ Conversation found! ID: ${conversationId} (after ${attempts} seconds)`)
        console.log(`   Type: ${conversations[0].type}`)
        console.log(`   Has messages: ${conversations[0].conversationMessages?.length || 0}`)
        break
      }
    } catch (error: any) {
      console.log(`   Attempt ${attempts}: ${error.message}`)
    }
  }
  
  if (!conversationId) {
    console.log(`❌ No conversation found after ${maxAttempts} attempts`)
    console.log("   This might mean conversations are not auto-created for direct inquiries")
    return
  }
  console.log()

  // Step 3: Add message to conversation
  console.log(`📧 Step 3: Adding message to conversation ${conversationId}...`)
  try {
    const messageResult = await makeRequest<any>(`/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: inquiryMessage,
      }),
    })
    
    console.log("✅ Message successfully added to conversation!")
    console.log(`   Message ID: ${messageResult.id}`)
    console.log(`   Message body: ${messageResult.body}`)
    console.log(`   Status: ${messageResult.status}`)
    console.log(`   Date: ${messageResult.date}`)
    console.log(`   Is incoming: ${messageResult.isIncoming} (0 = from host, 1 = from guest)`)
  } catch (error: any) {
    console.log(`❌ Failed to add message: ${error.message}`)
    return
  }
  console.log()

  // Step 4: Verify message appears in conversation
  console.log(`📧 Step 4: Verifying message in conversation...`)
  try {
    const conversations = await makeRequest<any[]>(`/conversations?reservationId=${reservationId}`, {
      method: "GET",
    })
    
    if (conversations.length > 0) {
      const conv = conversations[0]
      const messages = conv.conversationMessages || []
      console.log(`✅ Found ${messages.length} message(s) in conversation`)
      
      const ourMessage = messages.find((msg: any) => 
        msg.body === inquiryMessage || msg.body.includes(inquiryMessage.substring(0, 20))
      )
      
      if (ourMessage) {
        console.log("✅ Our message found in conversation!")
        console.log(`   Message ID: ${ourMessage.id}`)
        console.log(`   Body: ${ourMessage.body}`)
        console.log(`   Status: ${ourMessage.status}`)
      } else {
        console.log("⚠️  Our message not found, but conversation has messages")
        if (messages.length > 0) {
          console.log("   Latest message:", messages[messages.length - 1].body?.substring(0, 50))
        }
      }
    }
  } catch (error: any) {
    console.log(`❌ Failed to verify: ${error.message}`)
  }
  console.log()

  console.log("✅ Complete flow test finished!")
  console.log(`\n📝 Summary:`)
  console.log(`   - Inquiry created: ✅`)
  console.log(`   - Conversation found: ${conversationId ? '✅' : '❌'}`)
  console.log(`   - Message added: ${conversationId ? '✅' : 'N/A'}`)
  console.log(`\n⚠️  Note: Test inquiry (Reservation ID: ${reservationId}) should be deleted from Hostaway dashboard`)
}

testInquiryMessageFlow().catch((error) => {
  console.error("❌ Test script failed:", error)
  process.exit(1)
})
