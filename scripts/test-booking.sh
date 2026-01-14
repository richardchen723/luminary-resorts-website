#!/bin/bash

# Test script to verify Hostaway booking creation
# Make sure the dev server is running: pnpm dev

echo "Testing Hostaway Booking Creation API..."
echo ""

# Test data - using Dew cabin (listing ID 472341)
# Using dates far in the future to avoid conflicts
curl -X POST http://localhost:3000/api/test/booking \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": 472341,
    "startDate": "2026-12-01",
    "endDate": "2026-12-04",
    "guests": 2,
    "guest": {
      "firstName": "Test",
      "lastName": "Guest",
      "email": "test@example.com",
      "phone": "(555) 123-4567",
      "countryCode": "US",
      "address": "123 Test St",
      "city": "Test City",
      "state": "TX",
      "zipCode": "77331"
    }
  }' | jq '.'

echo ""
echo "Test completed."
