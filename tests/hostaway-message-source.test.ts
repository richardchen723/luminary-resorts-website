import assert from "node:assert/strict"
import test from "node:test"
import { labelHostawayGuestMessage } from "../lib/hostaway-message-source"

test("labels the Hostaway copy of website webchat messages", () => {
  assert.equal(
    labelHostawayGuestMessage("Is early check-in available?", "webchat"),
    "Is early check-in available?\n\n(Source: Luminary website — webchat)"
  )
})

test("labels the Hostaway copy of website text-message form submissions", () => {
  assert.equal(
    labelHostawayGuestMessage("Please text me", "text_message_form"),
    "Please text me\n\n(Source: Luminary website — text-message form)"
  )
})

test("does not double-label retried Hostaway messages", () => {
  const labelled = labelHostawayGuestMessage("Hello", "webchat")
  assert.equal(labelHostawayGuestMessage(labelled, "webchat"), labelled)
})

test("keeps empty messages empty", () => {
  assert.equal(labelHostawayGuestMessage("   ", "webchat"), "")
})
