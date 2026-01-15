/**
 * Test script to investigate how to create inquiries with status "Inquiry"
 * 
 * Previous test showed that setting status: "Inquiry" resulted in status: "new"
 * Need to test different approaches
 */

import { makeRequest } from "../lib/hostaway"
import { getListingMapId } from "../lib/hostaway"

async function testInquiryStatus() {
  console.log("🔍 Testing Hostaway API Inquiry Status Creation\n")

  const testListingId = 472341
  const testListingMapId = await getListingMapId(testListingId)
  
  console.log(`Test Listing ID: ${testListingId}`)
  console.log(`Test Listing Map ID: ${testListingMapId}\n`)

  // Test 1: Check what reservation statuses are available
  console.log("📊 Test 1: Fetching existing reservations to see status values...")
  try {
    const reservations = await makeRequest<any>("/reservations?limit=5")
    if (Array.isArray(reservations)) {
      const statuses = new Set(reservations.map((r: any) => r.status))
      console.log("✅ Found reservation statuses:", Array.from(statuses))
      console.log("Sample reservation:", JSON.stringify(reservations[0], null, 2).substring(0, 800))
    } else {
      console.log("Response:", JSON.stringify(reservations, null, 2).substring(0, 500))
    }
  } catch (error: any) {
    console.log(`❌ Failed: ${error.message}`)
  }
  console.log()

  // Test 2: Try creating with status as lowercase "inquiry"
  console.log("📋 Test 2: Creating reservation with status 'inquiry' (lowercase)...")
  const inquiryPayload1 = {
    channelId: 2000,
    listingMapId: testListingMapId,
    arrivalDate: "2026-02-05",
    departureDate: "2026-02-07",
    numberOfGuests: 2,
    adults: 2,
    guestFirstName: "Test",
    guestLastName: "Inquiry Lowercase",
    guestName: "Test Inquiry Lowercase",
    guestEmail: "test.inquiry.lowercase@example.com",
    phone: "+15551234569",
    guestCountry: "US",
    totalPrice: 0,
    currency: "USD",
    isPaid: 0,
    status: "inquiry", // lowercase
    comment: "Test inquiry lowercase status - please delete",
  }

  try {
    const result1 = await makeRequest<any>("/reservations?forceOverbooking=1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inquiryPayload1),
    })
    console.log("✅ Created! Status:", result1.status)
    console.log("ID:", result1.id)
  } catch (error: any) {
    console.log(`❌ Failed: ${error.message}`)
  }
  console.log()

  // Test 3: Try creating then updating status
  console.log("📋 Test 3: Creating reservation then updating status to 'Inquiry'...")
  const inquiryPayload2 = {
    channelId: 2000,
    listingMapId: testListingMapId,
    arrivalDate: "2026-02-08",
    departureDate: "2026-02-10",
    numberOfGuests: 2,
    adults: 2,
    guestFirstName: "Test",
    guestLastName: "Inquiry Update",
    guestName: "Test Inquiry Update",
    guestEmail: "test.inquiry.update@example.com",
    phone: "+15551234570",
    guestCountry: "US",
    totalPrice: 0,
    currency: "USD",
    isPaid: 0,
    comment: "Test inquiry update status - please delete",
  }

  try {
    const result2 = await makeRequest<any>("/reservations?forceOverbooking=1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inquiryPayload2),
    })
    console.log("✅ Created! Initial status:", result2.status)
    console.log("ID:", result2.id)
    
    // Try to update status
    console.log("   Attempting to update status to 'Inquiry'...")
    const updateResult = await makeRequest<any>(`/reservations/${result2.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Inquiry" }),
    })
    console.log("✅ Updated! New status:", updateResult.status)
  } catch (error: any) {
    console.log(`❌ Failed: ${error.message}`)
  }
  console.log()

  // Test 4: Check if there's a specific inquiry creation flag
  console.log("📋 Test 4: Creating with isInitial=1 (might indicate inquiry)...")
  const inquiryPayload3 = {
    channelId: 2000,
    listingMapId: testListingMapId,
    arrivalDate: "2026-02-11",
    departureDate: "2026-02-13",
    numberOfGuests: 2,
    adults: 2,
    guestFirstName: "Test",
    guestLastName: "Inquiry Initial",
    guestName: "Test Inquiry Initial",
    guestEmail: "test.inquiry.initial@example.com",
    phone: "+15551234571",
    guestCountry: "US",
    totalPrice: 0,
    currency: "USD",
    isPaid: 0,
    isInitial: 1, // Might indicate inquiry
    comment: "Test inquiry with isInitial=1 - please delete",
  }

  try {
    const result3 = await makeRequest<any>("/reservations?forceOverbooking=1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inquiryPayload3),
    })
    console.log("✅ Created! Status:", result3.status)
    console.log("isInitial:", result3.isInitial)
    console.log("ID:", result3.id)
  } catch (error: any) {
    console.log(`❌ Failed: ${error.message}`)
  }
  console.log()

  console.log("✅ Status testing complete!")
}

testInquiryStatus().catch((error) => {
  console.error("❌ Test script failed:", error)
  process.exit(1)
})
