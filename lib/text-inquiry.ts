import { createHash } from "crypto"
import { z } from "zod"

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const E164_PATTERN = /^\+[1-9]\d{7,14}$/

const dateField = z
  .string()
  .regex(DATE_PATTERN, "Use YYYY-MM-DD format")
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), "Invalid date")

export const createTextInquirySchema = z
  .object({
    idempotencyKey: z.string().uuid(),
    guestName: z.string().trim().min(2).max(255),
    guestPhone: z.string().trim().min(5).max(40),
    countryCallingCode: z.string().trim().regex(/^\+[1-9]\d{0,3}$/),
    listingSlug: z.string().trim().min(1).max(100),
    checkIn: dateField,
    checkOut: dateField,
    guests: z.number().int().min(1).max(20),
    pets: z.number().int().min(0).max(20).optional().default(0),
    infants: z.number().int().min(0).max(20).optional().default(0),
    message: z.string().trim().max(1000).optional().default(""),
    sourcePath: z.string().trim().max(500).optional().default("/"),
    website: z.string().max(0).optional().default(""),
  })
  .superRefine((value, context) => {
    if (value.checkOut <= value.checkIn) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["checkOut"],
        message: "Check-out must be after check-in",
      })
    }
  })

export type CreateTextInquiryInput = z.infer<typeof createTextInquirySchema>

export type TextInquiryDetails = Omit<
  CreateTextInquiryInput,
  "guestPhone" | "countryCallingCode" | "website"
> & {
  guestPhone: string
  cabinName: string
}

export function normalizeTextPhone(phone: string, countryCallingCode = "+1"): string {
  const trimmedPhone = phone.trim()
  const callingCodeDigits = countryCallingCode.replace(/\D/g, "")
  let phoneDigits = trimmedPhone.replace(/\D/g, "")

  if (!phoneDigits) {
    throw new Error("Mobile phone number is required")
  }

  if (!trimmedPhone.startsWith("+")) {
    phoneDigits = phoneDigits.replace(/^0+/, "")

    if (!phoneDigits.startsWith(callingCodeDigits)) {
      phoneDigits = `${callingCodeDigits}${phoneDigits}`
    }
  }

  const normalized = `+${phoneDigits}`
  if (!E164_PATTERN.test(normalized)) {
    throw new Error("Enter a valid mobile number with country code")
  }

  return normalized
}

export function splitGuestName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] || "Guest",
    lastName: parts.slice(1).join(" ") || "Guest",
  }
}

export function validateStayDateRange(
  checkIn: string,
  checkOut: string,
  today = new Date()
): void {
  if (!DATE_PATTERN.test(checkIn) || !DATE_PATTERN.test(checkOut)) {
    throw new Error("Stay dates must use YYYY-MM-DD format")
  }

  const checkInDate = new Date(`${checkIn}T00:00:00Z`)
  const checkOutDate = new Date(`${checkOut}T00:00:00Z`)
  const todayUtc = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  )

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    throw new Error("Stay dates are invalid")
  }
  if (checkInDate < todayUtc) {
    throw new Error("Check-in cannot be in the past")
  }
  if (checkOutDate <= checkInDate) {
    throw new Error("Check-out must be after check-in")
  }

  const maximumCheckOut = new Date(todayUtc)
  maximumCheckOut.setUTCFullYear(maximumCheckOut.getUTCFullYear() + 3)
  if (checkOutDate > maximumCheckOut) {
    throw new Error("Check-out is too far in the future")
  }
}

export function buildHostawayInquiryNote(details: TextInquiryDetails): string {
  const lines = [
    `Website text-message inquiry from ${details.guestName}.`,
    `Cabin: ${details.cabinName}`,
    `Stay dates: ${details.checkIn} to ${details.checkOut}`,
    `Guests: ${details.guests}`,
    details.pets ? `Pets: ${details.pets}` : null,
    details.infants ? `Infants: ${details.infants}` : null,
    `Mobile phone: ${details.guestPhone}`,
    "Text consent: Guest requested a transactional SMS from the website inquiry form.",
    `Source page: ${details.sourcePath}`,
    details.message ? `Guest message: ${details.message}` : null,
  ].filter(Boolean)

  return lines.join("\n")
}

export function buildHostawayGuestConversationMessage(
  details: Pick<TextInquiryDetails, "message">
): string | null {
  const message = details.message.trim()
  return message || null
}

function formatCompactStayDates(checkIn: string, checkOut: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })
  return `${formatter.format(new Date(`${checkIn}T00:00:00Z`))}–${formatter.format(
    new Date(`${checkOut}T00:00:00Z`)
  )}`
}

export function buildInitialTextMessage(
  details: TextInquiryDetails,
  hostawayReservationId: number
): string {
  const prefix = `Luminary Resorts: Inquiry #${hostawayReservationId} for `
  const suffix = `, ${formatCompactStayDates(
    details.checkIn,
    details.checkOut
  )} received. Reply to continue. Msg & data rates may apply. STOP to opt out.`
  const availableCabinCharacters = Math.max(1, 140 - prefix.length - suffix.length)
  const cabinName = details.cabinName.slice(0, availableCabinCharacters).trimEnd()

  return `${prefix}${cabinName}${suffix}`
}

export function buildTextInquiryFingerprint(
  details: Omit<TextInquiryDetails, "cabinName">
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        guestName: details.guestName,
        guestPhone: details.guestPhone,
        listingSlug: details.listingSlug,
        checkIn: details.checkIn,
        checkOut: details.checkOut,
        guests: details.guests,
        pets: details.pets,
        infants: details.infants,
        message: details.message,
        sourcePath: details.sourcePath,
      })
    )
    .digest("hex")
}

export function hashTextInquiryClientIp(ipAddress: string): string {
  const salt =
    process.env.TEXT_INQUIRY_HASH_SALT ||
    process.env.WHATSAPP_INQUIRY_HASH_SALT ||
    process.env.NEXTAUTH_SECRET ||
    "luminary"
  return createHash("sha256").update(`${salt}:${ipAddress}`).digest("hex")
}
