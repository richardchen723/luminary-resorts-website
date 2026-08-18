import assert from "node:assert/strict"
import test from "node:test"
import {
  buildHostawayInquiryNote,
  buildInitialTextMessage,
  buildTextInquiryFingerprint,
  createTextInquirySchema,
  normalizeTextPhone,
  splitGuestName,
  validateStayDateRange,
} from "../lib/text-inquiry"

const baseDetails = {
  idempotencyKey: "a86c4b85-1f89-4b21-8a0c-7d5266517803",
  guestName: "Sarah Chen",
  guestPhone: "+15551234567",
  listingSlug: "dew",
  cabinName: "Dew",
  checkIn: "2026-09-12",
  checkOut: "2026-09-15",
  guests: 2,
  pets: 0,
  infants: 0,
  message: "Is the pool heated?",
  sourcePath: "/stay/dew",
}

test("normalizes North American mobile numbers to E.164", () => {
  assert.equal(normalizeTextPhone("(555) 123-4567", "+1"), "+15551234567")
  assert.equal(normalizeTextPhone("1 555 123 4567", "+1"), "+15551234567")
})

test("preserves explicitly international numbers", () => {
  assert.equal(normalizeTextPhone("+60 12-345 6789", "+1"), "+60123456789")
  assert.equal(normalizeTextPhone("012-345 6789", "+60"), "+60123456789")
})

test("rejects invalid mobile numbers", () => {
  assert.throws(() => normalizeTextPhone("123", "+1"), /valid mobile number/)
})

test("validates a future stay date range", () => {
  const referenceDate = new Date("2026-08-17T00:00:00Z")
  assert.doesNotThrow(() =>
    validateStayDateRange("2026-09-12", "2026-09-15", referenceDate)
  )
  assert.throws(
    () => validateStayDateRange("2026-08-16", "2026-08-18", referenceDate),
    /past/
  )
  assert.throws(
    () => validateStayDateRange("2026-09-15", "2026-09-12", referenceDate),
    /after check-in/
  )
})

test("validates the guest inquiry payload", () => {
  const payload = createTextInquirySchema.parse({
    ...baseDetails,
    countryCallingCode: "+1",
    website: "",
  })
  assert.equal(payload.listingSlug, "dew")
  assert.equal(payload.guests, 2)
})

test("builds Hostaway notes and a concise initial SMS", () => {
  const hostawayNote = buildHostawayInquiryNote(baseDetails)
  assert.match(hostawayNote, /Website text-message inquiry from Sarah Chen/)
  assert.match(hostawayNote, /Cabin: Dew/)
  assert.match(hostawayNote, /Mobile phone: \+15551234567/)

  const initialText = buildInitialTextMessage(baseDetails, 52652999)
  assert.match(initialText, /Inquiry #52652999/)
  assert.match(initialText, /Dew/)
  assert.match(initialText, /Reply to continue/)
  assert.match(initialText, /STOP to opt out/)
  assert.ok(initialText.length <= 140)
})

test("builds stable request fingerprints", () => {
  const detailsWithoutCabinName = { ...baseDetails }
  delete (detailsWithoutCabinName as Partial<typeof baseDetails>).cabinName

  assert.equal(
    buildTextInquiryFingerprint(detailsWithoutCabinName),
    buildTextInquiryFingerprint({ ...detailsWithoutCabinName })
  )
})

test("splits single and multi-part guest names for Hostaway", () => {
  assert.deepEqual(splitGuestName("Sarah Chen"), { firstName: "Sarah", lastName: "Chen" })
  assert.deepEqual(splitGuestName("Prince"), { firstName: "Prince", lastName: "Guest" })
})
