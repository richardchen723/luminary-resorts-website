import test from "node:test"
import assert from "node:assert/strict"
import {
  GENERAL_INQUIRY_LISTING_SLUG,
  canConvertThreadToInquiry,
} from "../lib/chat"
import {
  resolveHostawayInquiryDates,
  selectNearestAvailableInquiryDates,
} from "../lib/hostaway"
import {
  buildGuestChatFallbackSms,
  GUEST_CHAT_AUTOMATED_RESPONSE,
  hostawayMessageBodyToPlainText,
  isInternalGuestChatSystemMessage,
} from "../lib/guest-chat-utils"
import {
  isValidHostawayWebhookAuthorization,
  parseHostawayChatWebhook,
} from "../lib/hostaway-webhook"

test("welcome message explains the unread SMS fallback", () => {
  assert.match(GUEST_CHAT_AUTOMATED_RESPONSE, /before you see our reply/i)
  assert.match(GUEST_CHAT_AUTOMATED_RESPONSE, /phone number/i)
})

test("builds a branded fallback SMS with opt-out language", () => {
  const message = buildGuestChatFallbackSms(["We have availability for those dates."])

  assert.match(message, /^Luminary Resorts:/)
  assert.match(message, /availability for those dates/)
  assert.match(message, /Reply STOP to opt out\.$/)
  assert.ok(message.length <= 1200)
})

test("caps long fallback messages without dropping the delivery footer", () => {
  const message = buildGuestChatFallbackSms(["x".repeat(2000)])

  assert.equal(message.length, 1200)
  assert.match(message, /…\n\nReply to this text/)
  assert.match(message, /Reply STOP to opt out\.$/)
})

test("converts Hostaway HTML replies to readable plain text", () => {
  assert.equal(
    hostawayMessageBodyToPlainText(
      '<p class=”mu-2”>response here.</p><p>We&apos;ll help &amp; follow up.</p>'
    ),
    "response here.\nWe'll help & follow up."
  )
})

test("identifies internal Hostaway link notices", () => {
  assert.equal(
    isInternalGuestChatSystemMessage("Conversation linked to Hostaway inquiry 64947547."),
    true
  )
  assert.equal(isInternalGuestChatSystemMessage(GUEST_CHAT_AUTOMATED_RESPONSE), false)
})

test("parses unified and direct Hostaway conversation webhook shapes", () => {
  assert.deepEqual(
    parseHostawayChatWebhook({
      event: "message.received",
      object: "conversationMessage",
      data: { reservationId: 1234, conversationId: 5678 },
    }),
    { supported: true, reservationId: 1234, conversationId: 5678, messageId: null }
  )

  assert.deepEqual(
    parseHostawayChatWebhook({
      id: 99,
      reservationId: "4321",
      conversationId: 8765,
      isIncoming: 0,
    }),
    { supported: true, reservationId: 4321, conversationId: 8765, messageId: null }
  )

  assert.deepEqual(
    parseHostawayChatWebhook({
      event: "message.received",
      object: "conversationMessage",
      objectId: 2468,
    }),
    { supported: true, reservationId: null, conversationId: null, messageId: 2468 }
  )
})

test("ignores unrelated Hostaway webhook events", () => {
  assert.deepEqual(parseHostawayChatWebhook({ event: "reservation.updated" }), {
    supported: false,
    reservationId: null,
    conversationId: null,
    messageId: null,
  })
})

test("validates Hostaway webhook basic authorization", () => {
  const authorization = `Basic ${Buffer.from("luminary:secret").toString("base64")}`

  assert.equal(
    isValidHostawayWebhookAuthorization(authorization, "luminary", "secret"),
    true
  )
  assert.equal(
    isValidHostawayWebhookAuthorization(authorization, "luminary", "different"),
    false
  )
})

test("routes a general chat to Hostaway without requiring stay details", () => {
  assert.equal(GENERAL_INQUIRY_LISTING_SLUG, "dew")
  assert.equal(
    canConvertThreadToInquiry({
      guestName: "Guest",
      guestEmail: "guest-chat@example.invalid",
      guestPhone: "+14045551234",
      hostawayReservationId: null,
      status: "waiting_on_team",
      context: {
        listingSlug: null,
        cabinName: null,
        checkIn: null,
        checkOut: null,
        guests: null,
        pets: null,
        infants: null,
        sourcePath: "/",
        sourceType: "home_page",
      },
    }),
    true
  )
})

test("uses specified Hostaway routing dates", () => {
  assert.deepEqual(
    resolveHostawayInquiryDates({
      checkIn: "2026-09-10",
      checkOut: "2026-09-12",
    }),
    {
      arrivalDate: "2026-09-10",
      departureDate: "2026-09-12",
      isDatesUnspecified: 0,
    }
  )
})

test("selects the nearest available Hostaway routing window", () => {
  assert.deepEqual(
    selectNearestAvailableInquiryDates(
      {
        "2026-08-20": { date: "2026-08-20", isAvailable: 0 },
        "2026-08-21": { date: "2026-08-21", isAvailable: 1, minimumStay: 2 },
        "2026-08-22": { date: "2026-08-22", isAvailable: 1 },
        "2026-08-23": { date: "2026-08-23", isAvailable: 1 },
      },
      "2026-08-20"
    ),
    { checkIn: "2026-08-21", checkOut: "2026-08-23" }
  )
})
