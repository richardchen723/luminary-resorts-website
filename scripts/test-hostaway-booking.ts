/**
 * Test script to verify Hostaway booking creation via API
 * Run with: npx tsx scripts/test-hostaway-booking.ts
 */

import { createBooking } from "../lib/hostaway"
import type { HostawayBookingRequest } from "../types/hostaway"

async function testHostawayBooking() {
  console.log("Testing Hostaway Booking Creation API...\n")

  // Test booking data - using Dew cabin (listing ID 472341)
  // Using dates far in the future to avoid conflicts
  const testBooking: HostawayBookingRequest = {
    listingId: 472341, // Dew cabin
    startDate: "2026-12-01", // Future date
    endDate: "2026-12-04", // 3 nights
    guests: 2,
    guest: {
      firstName: "Test",
      lastName: "Guest",
      email: "test@example.com",
      phone: "(555) 123-4567",
      countryCode: "US",
      address: "123 Test St",
      city: "Test City",
      state: "TX",
      zipCode: "77331",
    },
    // Note: Hostaway may not accept payment data directly
    // Payment processing might need to be handled separately
  }

  try {
    console.log("Attempting to create booking with data:")
    console.log(JSON.stringify(testBooking, null, 2))
    console.log("\n")

    const result = await createBooking(testBooking)

    console.log("✅ SUCCESS! Booking created:")
    console.log(JSON.stringify(result, null, 2))
    console.log("\nBooking ID:", result.id)
    console.log("Confirmation Code:", result.confirmationCode)
    console.log("Status:", result.status)
  } catch (error: any) {
    console.error("❌ FAILED to create booking:")
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)

    // Try to get more details about the error
    if (error.response) {
      console.error("Response status:", error.response.status)
      console.error("Response body:", error.response.body)
    }

    // Check if it's an endpoint issue
    if (error.message?.includes("Resource not found") || error.message?.includes("404")) {
      console.log("\n⚠️  The /bookings endpoint may not exist or may require different authentication.")
      console.log("Possible alternatives:")
      console.log("  - /v1/reservations")
      console.log("  - /v1/bookings/create")
      console.log("  - Different authentication method required")
    }
  }
}

// Run the test
testHostawayBooking()
  .then(() => {
    console.log("\nTest completed.")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\nTest failed with error:", error)
    process.exit(1)
  })
