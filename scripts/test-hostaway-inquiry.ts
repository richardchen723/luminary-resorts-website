/**
 * Test script to investigate Hostaway API for creating inquiries
 * 
 * Based on research:
 * - Hostaway supports creating inquiries with status "Inquiry"
 * - Inquiries can be created via the /reservations endpoint
 * - Inquiries don't require full booking details
 */

import { makeRequest } from "../lib/hostaway"
import { getListingIdBySlug } from "../lib/listing-map"
import { getListingMapId } from "../lib/hostaway"

async function testInquiryEndpoints() {
  console.log("🔍 Testing Hostaway API for Inquiry Creation\n")

  // Test data
  const testListingId = 472341 // Moss cabin
  const testListingMapId = await getListingMapId(testListingId)
  
  console.log(`Test Listing ID: ${testListingId}`)
  console.log(`Test Listing Map ID: ${testListingMapId}\n`)

  // Test 1: Check if /messages endpoint exists
  console.log("📧 Test 1: Checking /messages endpoint...")
  try {
    const messagesResult = await makeRequest<any>("/messages")
    console.log("✅ /messages endpoint exists!")
    console.log("Response:", JSON.stringify(messagesResult, null, 2).substring(0, 500))
  } catch (error: any) {
    console.log(`❌ /messages endpoint: ${error.message}`)
  }
  console.log()

  // Test 2: Check if /inquiries endpoint exists
  console.log("📝 Test 2: Checking /inquiries endpoint...")
  try {
    const inquiriesResult = await makeRequest<any>("/inquiries")
    console.log("✅ /inquiries endpoint exists!")
    console.log("Response:", JSON.stringify(inquiriesResult, null, 2).substring(0, 500))
  } catch (error: any) {
    console.log(`❌ /inquiries endpoint: ${error.message}`)
  }
  console.log()

  // Test 3: Check if /leads endpoint exists
  console.log("🎯 Test 3: Checking /leads endpoint...")
  try {
    const leadsResult = await makeRequest<any>("/leads")
    console.log("✅ /leads endpoint exists!")
    console.log("Response:", JSON.stringify(leadsResult, null, 2).substring(0, 500))
  } catch (error: any) {
    console.log(`❌ /leads endpoint: ${error.message}`)
  }
  console.log()

  // Test 4: Check if /contacts endpoint exists
  console.log("👤 Test 4: Checking /contacts endpoint...")
  try {
    const contactsResult = await makeRequest<any>("/contacts")
    console.log("✅ /contacts endpoint exists!")
    console.log("Response:", JSON.stringify(contactsResult, null, 2).substring(0, 500))
  } catch (error: any) {
    console.log(`❌ /contacts endpoint: ${error.message}`)
  }
  console.log()

  // Test 5: Try creating a reservation with status "Inquiry"
  console.log("📋 Test 5: Creating reservation with status 'Inquiry'...")
  const inquiryPayload = {
    channelId: 2000, // Direct booking channel
    listingMapId: testListingMapId,
    arrivalDate: "2026-02-01",
    departureDate: "2026-02-03",
    numberOfGuests: 2,
    adults: 2,
    children: null,
    infants: null,
    pets: null,
    guestFirstName: "Test",
    guestLastName: "Inquiry",
    guestName: "Test Inquiry",
    guestEmail: "test.inquiry@example.com",
    phone: "+15551234567",
    guestZipCode: "77331",
    guestAddress: "",
    guestCity: "",
    guestCountry: "US",
    totalPrice: 0, // Inquiry doesn't need price
    currency: "USD",
    isPaid: 0, // Not paid
    isManuallyChecked: 0,
    isInitial: 0,
    status: "Inquiry", // Key: Set status to "Inquiry"
    comment: "Test inquiry from API - please delete",
  }

  try {
    const inquiryResult = await makeRequest<any>("/reservations?forceOverbooking=1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inquiryPayload),
    })
    console.log("✅ Successfully created inquiry via /reservations endpoint!")
    console.log("Response:", JSON.stringify(inquiryResult, null, 2))
    console.log("\n⚠️  Note: This inquiry should be deleted from Hostaway dashboard")
  } catch (error: any) {
    console.log(`❌ Failed to create inquiry: ${error.message}`)
    console.log("Error details:", error)
  }
  console.log()

  // Test 6: Try creating inquiry without dates (optional dates)
  console.log("📋 Test 6: Creating inquiry without dates (optional dates)...")
  const inquiryNoDatesPayload = {
    channelId: 2000,
    listingMapId: testListingMapId,
    // No arrivalDate or departureDate
    numberOfGuests: 2,
    adults: 2,
    guestFirstName: "Test",
    guestLastName: "Inquiry No Dates",
    guestName: "Test Inquiry No Dates",
    guestEmail: "test.inquiry.nodates@example.com",
    phone: "+15551234568",
    guestCountry: "US",
    status: "Inquiry",
    comment: "Test inquiry without dates - please delete",
  }

  try {
    const inquiryNoDatesResult = await makeRequest<any>("/reservations?forceOverbooking=1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inquiryNoDatesPayload),
    })
    console.log("✅ Successfully created inquiry without dates!")
    console.log("Response:", JSON.stringify(inquiryNoDatesResult, null, 2))
    console.log("\n⚠️  Note: This inquiry should be deleted from Hostaway dashboard")
  } catch (error: any) {
    console.log(`❌ Failed to create inquiry without dates: ${error.message}`)
  }
  console.log()

  // Test 7: Check reservation statuses endpoint
  console.log("📊 Test 7: Checking /reservationStatuses endpoint...")
  try {
    const statusesResult = await makeRequest<any>("/reservationStatuses")
    console.log("✅ /reservationStatuses endpoint exists!")
    console.log("Available statuses:", JSON.stringify(statusesResult, null, 2).substring(0, 500))
  } catch (error: any) {
    console.log(`❌ /reservationStatuses endpoint: ${error.message}`)
  }
  console.log()

  console.log("✅ Testing complete!")
}

// Run tests
testInquiryEndpoints().catch((error) => {
  console.error("❌ Test script failed:", error)
  process.exit(1)
})
