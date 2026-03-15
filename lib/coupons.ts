import { randomInt } from "crypto"

import type { AdminUser } from "./auth"
import { query } from "./db/client"
import { roundToTwoDecimals } from "./utils"

const COUPON_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const COUPON_RAW_LENGTH = 10
const COUPON_SEGMENT_LENGTH = 5

export type CouponDiscountType = "fixed" | "percent"
export type CouponUsageMode = "single_use" | "multi_use"
export type CouponRedemptionStatus = "reserved" | "redeemed" | "released"

export interface CouponCode {
  id: string
  name: string
  description: string | null
  code: string
  normalized_code: string
  discount_type: CouponDiscountType
  discount_value: number
  expires_at: Date | null
  usage_mode: CouponUsageMode
  max_redemptions: number | null
  redemptions_count: number
  is_active: boolean
  created_by: string
  created_at: Date
  updated_at: Date
}

export interface CouponRedemption {
  id: string
  coupon_id: string
  booking_id: string | null
  payment_intent_id: string
  guest_email: string
  discount_amount: number
  status: CouponRedemptionStatus
  coupon_code: string
  discount_type: CouponDiscountType
  discount_value: number
  created_at: Date
  redeemed_at: Date | null
  released_at: Date | null
}

export interface CouponDiscountResult {
  coupon: CouponCode
  discount: {
    source: "coupon"
    code: string
    coupon_id: string
    name: string
    discount_type: CouponDiscountType
    discount_value: number
    discount_amount: number
    original_subtotal: number
    discounted_subtotal: number
  }
}

export interface CreateCouponInput {
  name: string
  description?: string | null
  discount_type?: CouponDiscountType
  discount_value: number
  expires_at?: string | null
  usage_mode?: CouponUsageMode
  max_redemptions?: number | null
  is_active?: boolean
}

export interface UpdateCouponInput {
  name?: string
  description?: string | null
  discount_type?: CouponDiscountType
  discount_value?: number
  expires_at?: string | null
  usage_mode?: CouponUsageMode
  max_redemptions?: number | null
  is_active?: boolean
}

export interface CouponPricingValidationInput {
  subtotal: number
  discounted_subtotal?: number
  cleaningFee: number
  tax: number
  channelFee: number
  petFee?: number
  total: number
  discount?: {
    type: CouponDiscountType
    value: number
    amount: number
  }
}

interface CouponUsageStats {
  limit: number | null
  remaining: number | null
}

function randomCouponChars(length: number): string {
  let result = ""

  for (let index = 0; index < length; index += 1) {
    result += COUPON_ALPHABET[randomInt(COUPON_ALPHABET.length)]
  }

  return result
}

function normalizeInteger(value: number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null
  }

  if (!Number.isFinite(value)) {
    throw new Error("Usage limit must be a valid number")
  }

  return Math.trunc(value)
}

function getCouponLimit(coupon: Pick<CouponCode, "usage_mode" | "max_redemptions">): number | null {
  if (coupon.usage_mode === "single_use") {
    return 1
  }

  return coupon.max_redemptions ?? null
}

function getCouponUsageStats(coupon: CouponCode): CouponUsageStats {
  const limit = getCouponLimit(coupon)

  return {
    limit,
    remaining: limit === null ? null : Math.max(0, limit - coupon.redemptions_count),
  }
}

function calculateDiscountedSubtotal(
  subtotal: number,
  discountType: CouponDiscountType,
  discountValue: number
): number {
  if (discountType === "percent") {
    return roundToTwoDecimals(Math.max(0, subtotal - subtotal * (discountValue / 100)))
  }

  return roundToTwoDecimals(Math.max(0, subtotal - discountValue))
}

function mapCouponRow(row: any): CouponCode {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    code: row.code,
    normalized_code: row.normalized_code,
    discount_type: row.discount_type,
    discount_value: parseFloat(row.discount_value?.toString() || "0"),
    expires_at: row.expires_at ? new Date(row.expires_at) : null,
    usage_mode: row.usage_mode,
    max_redemptions:
      row.max_redemptions === null || row.max_redemptions === undefined
        ? null
        : parseInt(row.max_redemptions.toString(), 10),
    redemptions_count: parseInt(row.redemptions_count?.toString() || "0", 10),
    is_active: Boolean(row.is_active),
    created_by: row.created_by,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  }
}

function mapRedemptionRow(row: any): CouponRedemption {
  return {
    id: row.id,
    coupon_id: row.coupon_id,
    booking_id: row.booking_id,
    payment_intent_id: row.payment_intent_id,
    guest_email: row.guest_email,
    discount_amount: parseFloat(row.discount_amount?.toString() || "0"),
    status: row.status,
    coupon_code: row.coupon_code,
    discount_type: row.discount_type,
    discount_value: parseFloat(row.discount_value?.toString() || "0"),
    created_at: new Date(row.created_at),
    redeemed_at: row.redeemed_at ? new Date(row.redeemed_at) : null,
    released_at: row.released_at ? new Date(row.released_at) : null,
  }
}

function sanitizeCouponInput<T extends CreateCouponInput | UpdateCouponInput>(
  input: T,
  isPartial = false
): T {
  const sanitized = { ...input }

  if ("name" in sanitized && sanitized.name !== undefined) {
    sanitized.name = sanitized.name.trim()

    if (!sanitized.name) {
      throw new Error("Coupon name is required")
    }
  } else if (!isPartial) {
    throw new Error("Coupon name is required")
  }

  if ("discount_type" in sanitized && sanitized.discount_type === undefined && !isPartial) {
    sanitized.discount_type = "fixed"
  }

  if ("usage_mode" in sanitized && sanitized.usage_mode === undefined && !isPartial) {
    sanitized.usage_mode = "single_use"
  }

  if ("discount_value" in sanitized && sanitized.discount_value !== undefined) {
    if (!Number.isFinite(sanitized.discount_value) || sanitized.discount_value <= 0) {
      throw new Error("Discount value must be greater than 0")
    }

    sanitized.discount_value = roundToTwoDecimals(sanitized.discount_value)
  } else if (!isPartial) {
    throw new Error("Discount value is required")
  }

  const resolvedDiscountType =
    sanitized.discount_type ?? (isPartial ? undefined : "fixed")

  if (resolvedDiscountType === "percent" && sanitized.discount_value !== undefined && sanitized.discount_value > 100) {
    throw new Error("Percentage discounts cannot exceed 100")
  }

  if ("expires_at" in sanitized && sanitized.expires_at !== undefined) {
    if (sanitized.expires_at === null || sanitized.expires_at === "") {
      sanitized.expires_at = null
    } else if (Number.isNaN(new Date(sanitized.expires_at).getTime())) {
      throw new Error("Expiration date is invalid")
    }
  }

  if ("max_redemptions" in sanitized && sanitized.max_redemptions !== undefined) {
    sanitized.max_redemptions = normalizeInteger(sanitized.max_redemptions) as T["max_redemptions"]
  }

  const resolvedUsageMode =
    sanitized.usage_mode ?? (isPartial ? undefined : "single_use")

  if (resolvedUsageMode === "single_use") {
    sanitized.max_redemptions = 1 as T["max_redemptions"]
  } else if (
    sanitized.max_redemptions !== undefined &&
    sanitized.max_redemptions !== null &&
    sanitized.max_redemptions < 1
  ) {
    throw new Error("Usage limit must be greater than 0")
  }

  if ("description" in sanitized && sanitized.description !== undefined) {
    sanitized.description = sanitized.description?.trim() || null
  }

  if ("is_active" in sanitized && sanitized.is_active !== undefined) {
    sanitized.is_active = Boolean(sanitized.is_active) as T["is_active"]
  }

  return sanitized
}

export function normalizeCouponCode(input: string): string {
  return input.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
}

export function formatCouponCode(rawCode: string): string {
  const normalized = normalizeCouponCode(rawCode)
  if (!normalized) return ""

  const parts: string[] = []
  for (let index = 0; index < normalized.length; index += COUPON_SEGMENT_LENGTH) {
    parts.push(normalized.slice(index, index + COUPON_SEGMENT_LENGTH))
  }

  return parts.join("-")
}

export function generateCouponCode(): { code: string; normalized_code: string } {
  const raw = randomCouponChars(COUPON_RAW_LENGTH)

  return {
    code: formatCouponCode(raw),
    normalized_code: raw,
  }
}

export async function getCouponById(id: string): Promise<CouponCode | null> {
  const result = await query("SELECT * FROM coupon_codes WHERE id = $1 LIMIT 1", [id])
  return result.rows?.[0] ? mapCouponRow(result.rows[0]) : null
}

export async function getCouponByCode(code: string): Promise<CouponCode | null> {
  const normalizedCode = normalizeCouponCode(code)

  if (!normalizedCode) {
    return null
  }

  const result = await query(
    "SELECT * FROM coupon_codes WHERE normalized_code = $1 LIMIT 1",
    [normalizedCode]
  )

  return result.rows?.[0] ? mapCouponRow(result.rows[0]) : null
}

export async function listCoupons(): Promise<(CouponCode & { usage: CouponUsageStats })[]> {
  const result = await query("SELECT * FROM coupon_codes ORDER BY created_at DESC")

  return (result.rows || []).map((row: any) => {
    const coupon = mapCouponRow(row)
    return {
      ...coupon,
      usage: getCouponUsageStats(coupon),
    }
  })
}

async function generateUniqueCouponCode(maxAttempts = 12): Promise<{ code: string; normalized_code: string }> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const generated = generateCouponCode()
    const existing = await query(
      "SELECT id FROM coupon_codes WHERE normalized_code = $1 LIMIT 1",
      [generated.normalized_code]
    )

    if (existing.rowCount === 0) {
      return generated
    }
  }

  throw new Error("Failed to generate a unique coupon code")
}

export async function createCoupon(
  input: CreateCouponInput,
  createdBy: AdminUser
): Promise<CouponCode> {
  const sanitized = sanitizeCouponInput<CreateCouponInput>(input)
  const generatedCode = await generateUniqueCouponCode()

  const result = await query(
    `INSERT INTO coupon_codes (
      name,
      description,
      code,
      normalized_code,
      discount_type,
      discount_value,
      expires_at,
      usage_mode,
      max_redemptions,
      is_active,
      created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      sanitized.name,
      sanitized.description || null,
      generatedCode.code,
      generatedCode.normalized_code,
      sanitized.discount_type || "fixed",
      sanitized.discount_value,
      sanitized.expires_at || null,
      sanitized.usage_mode || "single_use",
      sanitized.max_redemptions ?? null,
      sanitized.is_active ?? true,
      createdBy.id,
    ]
  )

  return mapCouponRow(result.rows[0])
}

export async function updateCoupon(
  id: string,
  input: UpdateCouponInput
): Promise<CouponCode> {
  const existing = await getCouponById(id)
  if (!existing) {
    throw new Error("Coupon not found")
  }

  const sanitized = sanitizeCouponInput<UpdateCouponInput>(input, true)
  const updates: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (sanitized.name !== undefined) {
    updates.push(`name = $${paramIndex++}`)
    values.push(sanitized.name)
  }
  if (sanitized.description !== undefined) {
    updates.push(`description = $${paramIndex++}`)
    values.push(sanitized.description)
  }
  if (sanitized.discount_type !== undefined) {
    updates.push(`discount_type = $${paramIndex++}`)
    values.push(sanitized.discount_type)
  }
  if (sanitized.discount_value !== undefined) {
    updates.push(`discount_value = $${paramIndex++}`)
    values.push(sanitized.discount_value)
  }
  if (sanitized.expires_at !== undefined) {
    updates.push(`expires_at = $${paramIndex++}`)
    values.push(sanitized.expires_at)
  }
  if (sanitized.usage_mode !== undefined) {
    updates.push(`usage_mode = $${paramIndex++}`)
    values.push(sanitized.usage_mode)
  }
  if (sanitized.max_redemptions !== undefined) {
    updates.push(`max_redemptions = $${paramIndex++}`)
    values.push(sanitized.max_redemptions)
  }
  if (sanitized.is_active !== undefined) {
    updates.push(`is_active = $${paramIndex++}`)
    values.push(sanitized.is_active)
  }

  if (updates.length === 0) {
    return existing
  }

  values.push(id)

  const result = await query(
    `UPDATE coupon_codes
     SET ${updates.join(", ")}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  )

  return mapCouponRow(result.rows[0])
}

function validateCouponAvailability(coupon: CouponCode): CouponUsageStats {
  if (!coupon.is_active) {
    throw new Error("This coupon code is inactive")
  }

  if (coupon.expires_at && coupon.expires_at.getTime() <= Date.now()) {
    throw new Error("This coupon code has expired")
  }

  const usage = getCouponUsageStats(coupon)

  if (usage.remaining !== null && usage.remaining <= 0) {
    throw new Error("This coupon code has reached its usage limit")
  }

  return usage
}

export async function validateCouponForCheckout(
  code: string,
  subtotal: number
): Promise<CouponDiscountResult> {
  const coupon = await getCouponByCode(code)

  if (!coupon) {
    throw new Error("Coupon code not found")
  }

  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    throw new Error("Subtotal must be greater than 0")
  }

  validateCouponAvailability(coupon)

  const safeSubtotal = roundToTwoDecimals(subtotal)
  const discountedSubtotal = calculateDiscountedSubtotal(
    safeSubtotal,
    coupon.discount_type,
    coupon.discount_value
  )
  const discountAmount = roundToTwoDecimals(safeSubtotal - discountedSubtotal)

  return {
    coupon,
    discount: {
      source: "coupon",
      code: coupon.code,
      coupon_id: coupon.id,
      name: coupon.name,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount_amount: discountAmount,
      original_subtotal: safeSubtotal,
      discounted_subtotal: discountedSubtotal,
    },
  }
}

export async function validateCouponPricing(
  couponCode: string,
  pricing: CouponPricingValidationInput
): Promise<CouponDiscountResult> {
  const result = await validateCouponForCheckout(couponCode, pricing.subtotal)
  const expectedDiscount = result.discount
  const actualDiscount = pricing.discount

  if (!actualDiscount) {
    throw new Error("Coupon pricing is missing discount details")
  }

  if (actualDiscount.type !== expectedDiscount.discount_type) {
    throw new Error("Coupon discount type does not match the current rule")
  }

  if (roundToTwoDecimals(actualDiscount.value) !== expectedDiscount.discount_value) {
    throw new Error("Coupon discount value does not match the current rule")
  }

  if (roundToTwoDecimals(actualDiscount.amount) !== expectedDiscount.discount_amount) {
    throw new Error("Coupon discount amount is no longer valid")
  }

  const discountedSubtotal = roundToTwoDecimals(
    pricing.discounted_subtotal ?? pricing.subtotal - actualDiscount.amount
  )

  if (discountedSubtotal !== expectedDiscount.discounted_subtotal) {
    throw new Error("Coupon discounted subtotal is no longer valid")
  }

  const expectedTotal = roundToTwoDecimals(
    discountedSubtotal +
      roundToTwoDecimals(pricing.cleaningFee) +
      roundToTwoDecimals(pricing.tax) +
      roundToTwoDecimals(pricing.channelFee) +
      roundToTwoDecimals(pricing.petFee || 0)
  )

  if (roundToTwoDecimals(pricing.total) !== expectedTotal) {
    throw new Error("Coupon-adjusted total is invalid")
  }

  return result
}

export async function reserveCouponRedemption(params: {
  couponCode: string
  paymentIntentId: string
  guestEmail: string
  discountAmount: number
}): Promise<CouponRedemption> {
  const normalizedCode = normalizeCouponCode(params.couponCode)
  const normalizedEmail = params.guestEmail.trim().toLowerCase()
  const existing = await query(
    "SELECT * FROM coupon_redemptions WHERE payment_intent_id = $1 AND status != 'released' LIMIT 1",
    [params.paymentIntentId]
  )

  if (existing.rows?.[0]) {
    return mapRedemptionRow(existing.rows[0])
  }

  const result = await query(
    `WITH eligible_coupon AS (
       UPDATE coupon_codes
       SET redemptions_count = redemptions_count + 1,
           updated_at = NOW()
       WHERE normalized_code = $1
         AND is_active = true
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (
           CASE
             WHEN usage_mode = 'single_use' THEN redemptions_count < 1
             WHEN max_redemptions IS NULL THEN true
             ELSE redemptions_count < max_redemptions
           END
         )
         AND NOT EXISTS (
           SELECT 1 FROM coupon_redemptions WHERE payment_intent_id = $2
         )
       RETURNING *
     ),
     inserted AS (
       INSERT INTO coupon_redemptions (
         coupon_id,
         payment_intent_id,
         guest_email,
         discount_amount,
         status,
         coupon_code,
         discount_type,
         discount_value
       )
       SELECT
         id,
         $2,
         $3,
         $4,
         'reserved',
         code,
         discount_type,
         discount_value
       FROM eligible_coupon
       RETURNING *
     )
     SELECT * FROM inserted`,
    [
      normalizedCode,
      params.paymentIntentId,
      normalizedEmail,
      roundToTwoDecimals(params.discountAmount),
    ]
  )

  if (!result.rows?.[0]) {
    throw new Error("Coupon code could not be reserved")
  }

  return mapRedemptionRow(result.rows[0])
}

export async function redeemCouponRedemption(
  paymentIntentId: string,
  bookingId: string
): Promise<CouponRedemption | null> {
  const result = await query(
    `UPDATE coupon_redemptions
     SET status = 'redeemed',
         booking_id = $2,
         redeemed_at = NOW()
     WHERE payment_intent_id = $1
       AND status = 'reserved'
     RETURNING *`,
    [paymentIntentId, bookingId]
  )

  if (result.rows?.[0]) {
    return mapRedemptionRow(result.rows[0])
  }

  const existing = await query(
    "SELECT * FROM coupon_redemptions WHERE payment_intent_id = $1 LIMIT 1",
    [paymentIntentId]
  )

  return existing.rows?.[0] ? mapRedemptionRow(existing.rows[0]) : null
}

export async function releaseCouponRedemption(paymentIntentId: string): Promise<void> {
  await query(
    `WITH released AS (
       DELETE FROM coupon_redemptions
       WHERE payment_intent_id = $1
         AND status = 'reserved'
       RETURNING coupon_id
     )
     UPDATE coupon_codes
     SET redemptions_count = GREATEST(0, redemptions_count - 1),
         updated_at = NOW()
     WHERE id IN (SELECT coupon_id FROM released)`,
    [paymentIntentId]
  )
}

export function getCouponUsageSummary(coupon: CouponCode): CouponUsageStats {
  return getCouponUsageStats(coupon)
}
