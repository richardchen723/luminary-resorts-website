import { NextRequest, NextResponse } from "next/server"
import { isDatabaseAvailable } from "@/lib/db/client"
import { getCabinBySlugSync } from "@/lib/cabins"
import { buildGuestChatPlaceholderEmail } from "@/lib/guest-chat-utils"
import {
  addHostawayIncomingGuestMessage,
  createInquiry,
  sendHostawayConversationMessage,
  waitForConversationForReservation,
} from "@/lib/hostaway"
import { getListingIdBySlug } from "@/lib/listing-map"
import {
  buildHostawayGuestConversationMessage,
  buildHostawayInquiryNote,
  buildInitialTextMessage,
  buildTextInquiryFingerprint,
  createTextInquirySchema,
  hashTextInquiryClientIp,
  normalizeTextPhone,
  splitGuestName,
  validateStayDateRange,
} from "@/lib/text-inquiry"
import {
  countRecentTextInquiryAttempts,
  createTextInquiryRecord,
  getTextInquiryByIdempotencyKey,
  markTextInquiryFailed,
  markTextInquiryHostawayCreated,
  markTextInquiryReady,
  retryFailedTextInquiry,
  type TextInquiryRecord,
} from "@/lib/text-inquiries"

export const dynamic = "force-dynamic"

function jsonResponse(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  })
}

function getClientIpHash(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  const ipAddress =
    forwardedFor ||
    request.headers.get("x-real-ip") ||
    `unknown:${request.headers.get("user-agent") || "browser"}`

  return hashTextInquiryClientIp(ipAddress)
}

function buildReadyResponse(record: TextInquiryRecord, reused: boolean) {
  return {
    success: true,
    reused,
    inquiryId: record.hostawayReservationId,
    conversationId: record.hostawayConversationId,
    textMessageSent: Boolean(record.smsMessageId),
    smsMessageId: record.smsMessageId,
    smsStatus: record.smsStatus,
  }
}

export async function POST(request: NextRequest) {
  let activeRecord: TextInquiryRecord | null = null

  try {
    if (!isDatabaseAvailable()) {
      return jsonResponse({ error: "Text inquiries are temporarily unavailable" }, 503)
    }

    const hasHostawayCredentials = Boolean(
      process.env.HOSTAWAY_ACCESS_TOKEN ||
        (process.env.HOSTAWAY_CLIENT_ID && process.env.HOSTAWAY_CLIENT_SECRET)
    )
    if (process.env.HOSTAWAY_SMS_ENABLED === "false" || !hasHostawayCredentials) {
      return jsonResponse(
        { error: "Text messaging is not configured yet. Please use website chat instead." },
        503
      )
    }

    const parsed = createTextInquirySchema.parse(await request.json())
    if (parsed.website) {
      return jsonResponse({ error: "Invalid inquiry" }, 400)
    }

    validateStayDateRange(parsed.checkIn, parsed.checkOut)

    const listingId = getListingIdBySlug(parsed.listingSlug)
    const cabin = getCabinBySlugSync(parsed.listingSlug)
    if (!listingId || !cabin) {
      return jsonResponse({ error: "Please select a valid cabin" }, 400)
    }

    const guestPhone = normalizeTextPhone(parsed.guestPhone, parsed.countryCallingCode)
    const normalizedDetails = {
      ...parsed,
      guestPhone,
      cabinName: cabin.name,
    }
    const requestFingerprint = buildTextInquiryFingerprint(normalizedDetails)
    const clientIpHash = getClientIpHash(request)

    const existing = await getTextInquiryByIdempotencyKey(parsed.idempotencyKey)
    if (existing) {
      if (existing.requestFingerprint !== requestFingerprint) {
        return jsonResponse({ error: "This inquiry key was already used" }, 409)
      }
      if (existing.status === "ready" && existing.smsMessageId) {
        return jsonResponse(buildReadyResponse(existing, true), 200)
      }
      if (existing.status === "pending") {
        return jsonResponse(
          { error: "Your inquiry is still being prepared. Please try again in a moment." },
          409
        )
      }
    }

    const configuredLimit = Number.parseInt(
      process.env.TEXT_INQUIRY_RATE_LIMIT || process.env.WHATSAPP_INQUIRY_RATE_LIMIT || "5",
      10
    )
    const rateLimit = Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : 5
    const recentAttempts = await countRecentTextInquiryAttempts(guestPhone, clientIpHash)
    if (recentAttempts >= rateLimit) {
      return jsonResponse(
        { error: "Too many inquiry attempts. Please use website chat or try again later." },
        429
      )
    }

    if (existing?.status === "failed") {
      const claimedForRetry = await retryFailedTextInquiry(existing.id)
      if (!claimedForRetry) {
        return jsonResponse(
          { error: "Your inquiry is already being retried. Please wait a moment." },
          409
        )
      }
      activeRecord = { ...existing, status: "pending", errorMessage: null }
    } else {
      const reserved = await createTextInquiryRecord({
        idempotencyKey: parsed.idempotencyKey,
        requestFingerprint,
        clientIpHash,
        guestName: parsed.guestName,
        guestPhone,
        listingSlug: parsed.listingSlug,
        checkIn: parsed.checkIn,
        checkOut: parsed.checkOut,
        guests: parsed.guests,
        pets: parsed.pets,
        infants: parsed.infants,
        message: parsed.message,
        sourcePath: parsed.sourcePath,
      })

      activeRecord = reserved.record
      if (!reserved.created) {
        if (reserved.record.requestFingerprint !== requestFingerprint) {
          return jsonResponse({ error: "This inquiry key was already used" }, 409)
        }
        if (reserved.record.status === "ready" && reserved.record.smsMessageId) {
          return jsonResponse(buildReadyResponse(reserved.record, true), 200)
        }
        return jsonResponse(
          { error: "Your inquiry is still being prepared. Please try again in a moment." },
          409
        )
      }
    }

    let hostawayReservationId = activeRecord.hostawayReservationId
    if (!hostawayReservationId) {
      const { firstName, lastName } = splitGuestName(parsed.guestName)
      const hostawayNote = buildHostawayInquiryNote(normalizedDetails)
      const inquiry = await createInquiry({
        listingId,
        checkIn: parsed.checkIn,
        checkOut: parsed.checkOut,
        guests: parsed.guests,
        adults: parsed.guests,
        pets: parsed.pets || undefined,
        infants: parsed.infants || undefined,
        guestInfo: {
          firstName,
          lastName,
          email: buildGuestChatPlaceholderEmail(guestPhone),
          phone: guestPhone,
        },
        message: hostawayNote,
        mirrorMessageToConversation: false,
      })

      hostawayReservationId = Number(inquiry.id || inquiry.hostawayReservationId)
      if (Number.isInteger(hostawayReservationId) && hostawayReservationId > 0) {
        await markTextInquiryHostawayCreated(activeRecord.id, hostawayReservationId)
      }
    }

    if (
      !hostawayReservationId ||
      !Number.isInteger(hostawayReservationId) ||
      hostawayReservationId <= 0
    ) {
      throw new Error("Hostaway did not return a valid inquiry ID")
    }

    const conversation = await waitForConversationForReservation(hostawayReservationId, {
      attempts: 10,
      delayMs: 750,
    })
    if (!conversation?.id) {
      throw new Error("Hostaway did not create an inbox conversation for this inquiry")
    }

    const guestConversationMessage = buildHostawayGuestConversationMessage(normalizedDetails)
    if (guestConversationMessage) {
      const guestMessageAlreadyPreserved = conversation.conversationMessages?.some(
        (message) =>
          Number(message.isIncoming) === 1 &&
          message.body?.trim() === guestConversationMessage
      )

      if (!guestMessageAlreadyPreserved) {
        await addHostawayIncomingGuestMessage(conversation.id, guestConversationMessage)
      }
    }

    const initialTextMessage = buildInitialTextMessage(normalizedDetails, hostawayReservationId)
    const existingSmsMessage = conversation.conversationMessages?.find(
      (message) =>
        message.communicationType === "sms" &&
        !message.isIncoming &&
        message.body === initialTextMessage
    )
    const smsMessage =
      existingSmsMessage ||
      (await sendHostawayConversationMessage(conversation.id, initialTextMessage, "sms"))
    const smsMessageId = Number(smsMessage.id)

    if (!Number.isInteger(smsMessageId) || smsMessageId <= 0) {
      throw new Error("Hostaway did not return a valid SMS message ID")
    }
    if (
      smsMessage.status === "failed" ||
      smsMessage.status === "cancelled_by_user" ||
      smsMessage.status === "cancelled_by_system"
    ) {
      throw new Error("Hostaway could not send the text message")
    }

    await markTextInquiryReady(
      activeRecord.id,
      hostawayReservationId,
      conversation.id,
      smsMessageId,
      smsMessage.status || null
    )

    return jsonResponse(
      {
        success: true,
        reused: false,
        inquiryId: hostawayReservationId,
        conversationId: conversation.id,
        textMessageSent: true,
        smsMessageId,
        smsStatus: smsMessage.status || null,
      },
      201
    )
  } catch (error: any) {
    if (activeRecord) {
      await markTextInquiryFailed(
        activeRecord.id,
        error?.message || "Failed to prepare text inquiry"
      ).catch(() => {})
    }

    if (error?.name === "ZodError") {
      return jsonResponse(
        { error: "Please check the inquiry details", details: error.flatten?.() },
        400
      )
    }

    console.error("Failed to prepare text inquiry:", error)
    return jsonResponse(
      { error: error?.message || "Failed to prepare text inquiry" },
      500
    )
  }
}
