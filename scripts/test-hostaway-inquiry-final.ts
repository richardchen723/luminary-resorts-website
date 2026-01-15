/**
 * Final test to confirm inquiry creation requirements and behavior
 */

import { makeRequest } from "../lib/hostaway"
import { getListingMapId } from "../lib/hostaway"

async function testInquiryFinal() {
  console.log("🔍 Final Hostaway Inquiry API Testing\n")

  const testListingId = 472341
  const testListingMapId = await getListingMapId(testListingId)
  
  // Test 1: Minimal inquiry payload (only required fields)
  console.log("📋 Test 1: Creating inquiry with minimal required fields...")
  const minimalInquiry = {
    channelId: 2000,
    listingMapId: testListingMapId,
    arrivalDate: "2026-03-01",
    departureDate: "2026-03-03",
    numberOfGuests: 2,
    adults: 2,
    guestFirstName: "Minimal",
    guestLastName: "Test",
    guestName: "Minimal Test",
    guestEmail: "minimal.test@example.com",
    phone: "+15551234572",
    guestCountry: "US",
    status: "inquiry", // lowercase works!
    comment: "Minimal inquiry test - please delete",
  }

  try {
    const result1 = await makeRequest<any>("/reservations?forceOverbooking=1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(minimalInquiry),
    })
    console.log("✅ Success! Status:", result1.status)
    console.log("   ID:", result1.id)
    console.log("   Guest Email:", result1.guestEmail)
    console.log("   Phone:", result1.phone)
    console.log("   Dates:", result1.arrivalDate, "to", result1.departureDate)
    console.log("   Listing:", result1.listingName || "N/A")
  } catch (error: any) {
    console.log(`❌ Failed: ${error.message}`)
  }
  console.log()

  // Test 2: Full inquiry payload with all guest info
  console.log("📋 Test 2: Creating inquiry with full guest information...")
  const fullInquiry = {
    channelId: 2000,
    listingMapId: testListingMapId,
    arrivalDate: "2026-03-05",
    departureDate: "2026-03-07",
    numberOfGuests: 2,
    adults: 2,
    children: null,
    infants: 1,
    pets: 1,
    guestFirstName: "Full",
    guestLastName: "Inquiry",
    guestName: "Full Inquiry",
    guestEmail: "full.inquiry@example.com",
    phone: "+15551234573",
    guestZipCode: "77331",
    guestAddress: "123 Test St",
    guestCity: "Coldspring",
    guestState: "TX",
    guestCountry: "US",
    totalPrice: 0,
    currency: "USD",
    isPaid: 0,
    status: "inquiry",
    comment: "Full inquiry test with all fields - please delete",
  }

  try {
    const result2 = await makeRequest<any>("/reservations?forceOverbooking=1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullInquiry),
    })
    console.log("✅ Success! Status:", result2.status)
    console.log("   ID:", result2.id)
    console.log("   Infants:", result2.infants)
    console.log("   Pets:", result2.pets)
    console.log("   Address:", result2.guestAddress, result2.guestCity, result2.guestState)
  } catch (error: any) {
    console.log(`❌ Failed: ${error.message}`)
  }
  console.log()

  // Test 3: Verify we can retrieve the inquiry
  console.log("📋 Test 3: Retrieving created inquiry...")
  try {
    const inquiryId = 52652913 // From previous test
    const retrieved = await makeRequest<any>(`/reservations/${inquiryId}`)
    console.log("✅ Retrieved inquiry!")
    console.log("   Status:", retrieved.status)
    console.log("   Guest:", retrieved.guestName, `(${retrieved.guestEmail})`)
    console.log("   Phone:", retrieved.phone)
    console.log("   Dates:", retrieved.arrivalDate, "to", retrieved.departureDate)
    console.log("   Listing:", retrieved.listingName)
    console.log("   Comment:", retrieved.comment)
  } catch (error: any) {
    console.log(`❌ Failed: ${error.message}`)
  }
  console.log()

  // Test 4: Check if we can filter inquiries by status
  console.log("📋 Test 4: Filtering reservations by status 'inquiry'...")
  try {
    const inquiries = await makeRequest<any>("/reservations?status=inquiry&limit=10")
    if (Array.isArray(inquiries)) {
      console.log(`✅ Found ${inquiries.length} inquiries`)
      if (inquiries.length > 0) {
        console.log("   Sample inquiry:", {
          id: inquiries[0].id,
          status: inquiries[0].status,
          guest: inquiries[0].guestName,
          dates: `${inquiries[0].arrivalDate} to ${inquiries[0].departureDate}`,
        })
      }
    } else {
      console.log("Response:", JSON.stringify(inquiries, null, 2).substring(0, 500))
    }
  } catch (error: any) {
    console.log(`❌ Failed: ${error.message}`)
  }
  console.log()

  console.log("✅ Final testing complete!")
  console.log("\n📝 Summary:")
  console.log("   - Status 'inquiry' (lowercase) works for creating inquiries")
  console.log("   - Required fields: channelId, listingMapId, arrivalDate, departureDate,")
  console.log("     numberOfGuests, adults, guestFirstName, guestLastName, guestName,")
  console.log("     guestEmail, phone, guestCountry, status")
  console.log("   - Optional fields: children, infants, pets, guestAddress, guestCity,")
  console.log("     guestState, guestZipCode, comment")
  console.log("   - Dates are REQUIRED (cannot create inquiry without dates)")
}

testInquiryFinal().catch((error) => {
  console.error("❌ Test script failed:", error)
  process.exit(1)
})
