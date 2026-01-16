/**
 * Discount calculation utilities
 */

import { getActiveIncentiveForReferral } from "./incentives"

export interface DiscountResult {
  discount_type: "percent" | "fixed"
  discount_value: number
  discount_amount: number
  original_subtotal: number
  discounted_subtotal: number
}

/**
 * Apply discount to subtotal
 */
export function applyDiscount(
  subtotal: number,
  discountType: "percent" | "fixed",
  discountValue: number
): number {
  if (discountType === "percent") {
    const discountAmount = subtotal * (discountValue / 100)
    return Math.max(0, subtotal - discountAmount)
  } else {
    // Fixed discount
    return Math.max(0, subtotal - discountValue)
  }
}

/**
 * Calculate discount for a referral code
 */
export async function calculateDiscount(
  referralCode: string,
  subtotal: number
): Promise<DiscountResult | null> {
  const incentive = await getActiveIncentiveForReferral(referralCode)

  if (!incentive) {
    return null
  }

  const discountAmount = applyDiscount(
    subtotal,
    incentive.guest_discount_type,
    incentive.guest_discount_value
  )

  return {
    discount_type: incentive.guest_discount_type,
    discount_value: incentive.guest_discount_value,
    discount_amount: subtotal - discountAmount,
    original_subtotal: subtotal,
    discounted_subtotal: discountAmount,
  }
}

/**
 * Get referral code from request (cookie or query param)
 */
export function getReferralCodeFromRequest(
  cookies: { get: (name: string) => { value: string } | undefined },
  searchParams?: URLSearchParams
): string | null {
  // Check query param first (for testing)
  if (searchParams?.get("ref")) {
    return searchParams.get("ref")
  }

  // Check cookie
  const referralCookie = cookies.get("luminary_referral")
  return referralCookie?.value || null
}
