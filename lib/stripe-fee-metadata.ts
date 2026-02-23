import { roundToTwoDecimals } from "@/lib/utils"

interface PricingDiscount {
  amount: number
}

export interface StripeFeeMetadataPricing {
  subtotal: number
  discounted_subtotal?: number
  cleaningFee: number
  tax: number
  channelFee: number
  petFee?: number
  total: number
  nights?: number
  discount?: PricingDiscount
}

export interface NormalizedStripeFeeBreakdown {
  subtotal: number
  discountedSubtotal: number
  baseRate: number
  cleaningFee: number
  tax: number
  bookingFee: number
  petFee: number
  discountAmount: number
  total: number
  nights?: number
}

function normalizeAmount(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0
  return roundToTwoDecimals(value)
}

function toCents(amount: number): number {
  return Math.round(roundToTwoDecimals(amount) * 100)
}

export function normalizeStripeFeeBreakdown(
  pricing: StripeFeeMetadataPricing
): NormalizedStripeFeeBreakdown {
  const subtotal = normalizeAmount(pricing.subtotal)
  const discountedSubtotal = normalizeAmount(
    pricing.discounted_subtotal ?? pricing.subtotal
  )
  const discountAmount =
    pricing.discount?.amount !== undefined
      ? normalizeAmount(pricing.discount.amount)
      : roundToTwoDecimals(Math.max(0, subtotal - discountedSubtotal))
  const nights =
    typeof pricing.nights === "number" && Number.isFinite(pricing.nights)
      ? Math.max(0, Math.trunc(pricing.nights))
      : undefined

  return {
    subtotal,
    discountedSubtotal,
    baseRate: discountedSubtotal,
    cleaningFee: normalizeAmount(pricing.cleaningFee),
    tax: normalizeAmount(pricing.tax),
    bookingFee: normalizeAmount(pricing.channelFee),
    petFee: normalizeAmount(pricing.petFee ?? 0),
    discountAmount,
    total: normalizeAmount(pricing.total),
    nights,
  }
}

export function buildStripeFeeMetadata(
  pricing: StripeFeeMetadataPricing
): Record<string, string> {
  const normalized = normalizeStripeFeeBreakdown(pricing)

  const metadata: Record<string, string> = {
    pricing_version: "lr_v1",
    subtotal_cents: String(toCents(normalized.subtotal)),
    discounted_subtotal_cents: String(toCents(normalized.discountedSubtotal)),
    base_rate_cents: String(toCents(normalized.baseRate)),
    booking_fee_cents: String(toCents(normalized.bookingFee)),
    cleaning_fee_cents: String(toCents(normalized.cleaningFee)),
    tax_cents: String(toCents(normalized.tax)),
    pet_fee_cents: String(toCents(normalized.petFee)),
    discount_amount_cents: String(toCents(normalized.discountAmount)),
    total_cents: String(toCents(normalized.total)),
  }

  if (normalized.nights !== undefined) {
    metadata.nights = String(normalized.nights)
  }

  return metadata
}
