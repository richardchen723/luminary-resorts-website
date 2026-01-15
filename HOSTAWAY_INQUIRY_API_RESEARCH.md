# Hostaway Inquiry API Research & Testing Results

## Date: January 15, 2026

## Executive Summary

✅ **Hostaway API DOES support creating inquiries** via the `/reservations` endpoint by setting `status: "inquiry"` (lowercase).

**Key Finding**: Inquiries can be created, but **dates are REQUIRED** - you cannot create an inquiry without check-in and check-out dates.

---

## Test Results

### ✅ Endpoints That Work

1. **`POST /v1/reservations`** - Creates inquiries when `status: "inquiry"` is set
   - Status must be lowercase `"inquiry"` (not `"Inquiry"` or `"INQUIRY"`)
   - Returns full reservation object with inquiry status
   - Inquiry ID can be used to retrieve/update later

2. **`GET /v1/reservations/{id}`** - Retrieves inquiry by ID
   - Works for inquiries just like regular reservations

3. **`GET /v1/reservations?status=inquiry`** - Filters inquiries by status
   - Can query all inquiries with this filter

### ❌ Endpoints That Don't Exist

- `/messages` - Resource not found
- `/inquiries` - Resource not found  
- `/leads` - Resource not found
- `/contacts` - Resource not found
- `/reservationStatuses` - Resource not found

---

## Required Fields for Inquiry Creation

### ✅ Required Fields
- `channelId`: `2000` (Direct booking channel)
- `listingMapId`: The listing map ID (not listing ID)
- `arrivalDate`: `"YYYY-MM-DD"` format (REQUIRED)
- `departureDate`: `"YYYY-MM-DD"` format (REQUIRED)
- `numberOfGuests`: Number (REQUIRED)
- `adults`: Number (REQUIRED)
- `guestFirstName`: String (REQUIRED)
- `guestLastName`: String (REQUIRED)
- `guestName`: String (REQUIRED) - Usually `${firstName} ${lastName}`
- `guestEmail`: String (REQUIRED)
- `phone`: String (REQUIRED) - Should include country code (e.g., `+15551234567`)
- `guestCountry`: String (REQUIRED) - Country code (e.g., `"US"`)
- `status`: `"inquiry"` (lowercase, REQUIRED to create inquiry)

### ✅ Optional Fields
- `children`: Number or `null`
- `infants`: Number or `null`
- `pets`: Number or `null`
- `guestAddress`: String
- `guestCity`: String
- `guestState`: String
- `guestZipCode`: String
- `totalPrice`: Number (can be `0` for inquiries)
- `currency`: String (default: `"USD"`)
- `isPaid`: Number (should be `0` for inquiries)
- `comment`: String - Notes about the inquiry

---

## Test Results Summary

### Test 1: Basic Inquiry Creation ✅
- **Payload**: Minimal required fields + `status: "inquiry"`
- **Result**: ✅ Successfully created inquiry with status `"inquiry"`
- **ID**: 52652936

### Test 2: Full Guest Information ✅
- **Payload**: All fields including infants, pets, address
- **Result**: ✅ Successfully created inquiry
- **Note**: All optional fields were saved correctly

### Test 3: Status Variations
- `status: "Inquiry"` (capitalized) → ❌ Created as `"new"` reservation
- `status: "inquiry"` (lowercase) → ✅ Created as `"inquiry"`
- `status: "INQUIRY"` (uppercase) → Not tested, but likely won't work

### Test 4: Inquiry Without Dates ❌
- **Attempt**: Create inquiry without `arrivalDate` and `departureDate`
- **Result**: ❌ Error: "Wrong reservation dates passed"
- **Conclusion**: **Dates are MANDATORY** - cannot create inquiry without dates

### Test 5: Update Status to Inquiry
- **Attempt**: Create reservation then update status to `"Inquiry"`
- **Result**: ❌ Failed if dates conflict with existing reservations
- **Note**: Can update status if dates don't conflict

---

## Key Conclusions

### ✅ What Works

1. **Inquiry Creation**: Use `/reservations` endpoint with `status: "inquiry"` (lowercase)
2. **Required Dates**: Check-in and check-out dates are mandatory
3. **Guest Information**: Can store full guest details (name, email, phone, address)
4. **Additional Info**: Can include pets, infants, children, and comments
5. **Retrieval**: Can retrieve and filter inquiries by status

### ❌ Limitations

1. **Dates Required**: Cannot create inquiry without dates (this is a Hostaway API limitation)
2. **No Dedicated Endpoint**: Must use `/reservations` endpoint (no `/inquiries` endpoint)
3. **Status Case-Sensitive**: Must use lowercase `"inquiry"` (not `"Inquiry"`)

---

## Implications for Implementation

### For "Send Inquiry" Button

**Problem**: User wants to gray out button when dates aren't selected, but Hostaway requires dates.

**Solution**: 
- ✅ Gray out button when dates aren't selected (good UX)
- ✅ When dates ARE selected, create inquiry in Hostaway
- ✅ Store inquiry in local database for tracking
- ✅ Send email notification to property managers

### Recommended Flow

1. **User selects dates** → Button becomes enabled
2. **User clicks "Send Inquiry"** → Show modal/form to collect:
   - Name (first + last)
   - Email
   - Phone
   - Optional: Address, city, state, zip
   - Optional: Message/notes
3. **Submit** → Create inquiry in Hostaway via API
4. **Success** → Show confirmation, send email notification
5. **Store locally** → Save inquiry to database for tracking

---

## Recommended Implementation Plan

### Phase 1: UI Updates
- [ ] Disable "Send Inquiry" button when `!checkIn || !checkOut`
- [ ] Add visual feedback (grayed out, tooltip)
- [ ] Create inquiry modal/form component

### Phase 2: API Endpoint
- [ ] Create `/api/inquiry/create` endpoint
- [ ] Validate required fields
- [ ] Normalize phone number format
- [ ] Get `listingMapId` from `listingId`

### Phase 3: Hostaway Integration
- [ ] Create `createInquiry()` function in `lib/hostaway.ts`
- [ ] Use `/reservations` endpoint with `status: "inquiry"`
- [ ] Handle errors gracefully
- [ ] Return inquiry ID for tracking

### Phase 4: Database Storage (Optional)
- [ ] Create `inquiries` table (if needed for tracking)
- [ ] Store inquiry data locally
- [ ] Link to Hostaway inquiry ID

### Phase 5: Email Notification
- [ ] Send email to property managers when inquiry is created
- [ ] Include inquiry details and Hostaway link

---

## API Function Signature (Proposed)

```typescript
export async function createInquiry(data: {
  listingId: number
  checkIn: string // YYYY-MM-DD (REQUIRED)
  checkOut: string // YYYY-MM-DD (REQUIRED)
  guests: number
  adults: number
  pets?: number
  infants?: number
  guestInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  message?: string
}): Promise<{ id: number; hostawayReservationId: string }>
```

---

## Test Inquiries Created

⚠️ **IMPORTANT**: The following test inquiries were created and should be deleted from Hostaway dashboard:

- ID: 52652893 (Test Inquiry)
- ID: 52652913 (Test Inquiry Lowercase)
- ID: 52652914 (Test Inquiry Update)
- ID: 52652916 (Test Inquiry Initial)
- ID: 52652936 (Minimal Test)
- ID: 52652938 (Full Inquiry Test)

---

## Next Steps

1. ✅ Research complete - Hostaway API supports inquiries
2. ⏳ Implement UI changes (disable button, create form)
3. ⏳ Create API endpoint and Hostaway integration
4. ⏳ Test end-to-end flow
5. ⏳ Deploy and verify

---

## References

- Hostaway API Base: `https://api.hostaway.com/v1`
- Endpoint: `POST /v1/reservations?forceOverbooking=1`
- Status: `"inquiry"` (lowercase)
- Channel ID: `2000` (Direct booking)
