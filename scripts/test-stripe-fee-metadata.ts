import assert from "node:assert/strict"
import {
  buildStripeFeeMetadata,
  normalizeStripeFeeBreakdown,
} from "../lib/stripe-fee-metadata"

function runTests() {
  const discounted = normalizeStripeFeeBreakdown({
    subtotal: 1000,
    discounted_subtotal: 900,
    cleaningFee: 100,
    tax: 108,
    channelFee: 18,
    petFee: 50,
    total: 1176,
    nights: 3,
    discount: { amount: 100 },
  })

  assert.equal(discounted.baseRate, 900)
  assert.equal(discounted.bookingFee, 18)
  assert.equal(discounted.total, 1176)

  const discountedMetadata = buildStripeFeeMetadata({
    subtotal: 1000,
    discounted_subtotal: 900,
    cleaningFee: 100,
    tax: 108,
    channelFee: 18,
    petFee: 50,
    total: 1176,
    nights: 3,
    discount: { amount: 100 },
  })

  assert.equal(discountedMetadata.base_rate_cents, "90000")
  assert.equal(discountedMetadata.booking_fee_cents, "1800")
  assert.equal(discountedMetadata.total_cents, "117600")
  assert.equal(discountedMetadata.discount_amount_cents, "10000")
  assert.equal(discountedMetadata.nights, "3")

  const noDiscountMetadata = buildStripeFeeMetadata({
    subtotal: 540.25,
    cleaningFee: 100,
    tax: 64.83,
    channelFee: 10.81,
    petFee: 0,
    total: 715.89,
    nights: 2,
  })

  assert.equal(noDiscountMetadata.base_rate_cents, "54025")
  assert.equal(noDiscountMetadata.booking_fee_cents, "1081")
  assert.equal(noDiscountMetadata.total_cents, "71589")
  assert.equal(noDiscountMetadata.discount_amount_cents, "0")

  console.log("stripe fee metadata tests passed")
}

runTests()
