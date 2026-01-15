/**
 * Test to determine if inquiry messages should be marked as incoming (from guest)
 */

import { makeRequest, createInquiry } from "../lib/hostaway"

async function testMessageDirection() {
  console.log("🔍 Testing Message Direction (incoming vs outgoing)\n")

  // Create inquiry
  const listingId = 472341
  let reservationId: number
  
  try {
    const inquiryResult = await createInquiry({
      listingId,
      checkIn: "2026-04-10",
      checkOut: "2026-04-12",
      guests: 2,
      adults: 2,
      guestInfo: {
        firstName: "Direction",
        lastName: "Test",
        email: "direction.test@example.com",
        phone: "+15551234604",
        country: "US",
      },
      message: "Test message to check direction",
    })
    
    reservationId = parseInt(inquiryResult.hostawayReservationId)
    console.log(`✅ Created inquiry with Reservation ID: ${reservationId}\n`)
  } catch (error: any) {
    console.error(`❌ Failed: ${error.message}`)
    return
  }

  // Wait for conversation
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Get conversation
  let conversationId: number | null = null
  try {
    const conversations = await makeRequest<any[]>(`/conversations?reservationId=${reservationId}`, {
      method: "GET",
    })
    
    if (conversations.length > 0) {
      conversationId = conversations[0].id
      console.log(`✅ Found conversation ID: ${conversationId}\n`)
    }
  } catch (error: any) {
    console.log(`❌ Failed to get conversation: ${error.message}`)
    return
  }

  if (!conversationId) {
    console.log("❌ No conversation found")
    return
  }

  // Test 1: Message with isIncoming: 1 (from guest)
  console.log("📧 Test 1: Adding message as incoming (from guest)...")
  try {
    const result = await makeRequest<any>(`/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: "This message is marked as incoming (from guest)",
        isIncoming: 1,
      }),
    })
    console.log("✅ Message created!")
    console.log(`   Message ID: ${result.id}`)
    console.log(`   Is incoming: ${result.isIncoming} (1 = from guest)`)
    console.log(`   Status: ${result.status}`)
  } catch (error: any) {
    console.log(`❌ Failed: ${error.message}`)
  }
  console.log()

  // Test 2: Message with isIncoming: 0 (from host) - default
  console.log("📧 Test 2: Adding message as outgoing (from host)...")
  try {
    const result = await makeRequest<any>(`/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: "This message is marked as outgoing (from host)",
        isIncoming: 0,
      }),
    })
    console.log("✅ Message created!")
    console.log(`   Message ID: ${result.id}`)
    console.log(`   Is incoming: ${result.isIncoming} (0 = from host)`)
    console.log(`   Status: ${result.status}`)
  } catch (error: any) {
    console.log(`❌ Failed: ${error.message}`)
  }
  console.log()

  // Test 3: Check existing messages to see their direction
  console.log("📧 Test 3: Checking existing messages in conversation...")
  try {
    const conversations = await makeRequest<any[]>(`/conversations?reservationId=${reservationId}`, {
      method: "GET",
    })
    
    if (conversations.length > 0 && conversations[0].conversationMessages) {
      const messages = conversations[0].conversationMessages
      console.log(`Found ${messages.length} message(s):`)
      messages.forEach((msg: any, idx: number) => {
        console.log(`  ${idx + 1}. ID: ${msg.id}`)
        console.log(`     Body: ${msg.body?.substring(0, 50)}...`)
        console.log(`     Is incoming: ${msg.isIncoming} (${msg.isIncoming === 1 ? 'from guest' : 'from host'})`)
        console.log(`     Originated by: ${msg.originatedBy}`)
        console.log(`     Message source: ${msg.messageSource}`)
        console.log()
      })
    }
  } catch (error: any) {
    console.log(`❌ Failed: ${error.message}`)
  }

  console.log("✅ Testing complete!")
}

testMessageDirection().catch((error) => {
  console.error("❌ Test script failed:", error)
  process.exit(1)
})
