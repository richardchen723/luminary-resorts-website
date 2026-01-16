/**
 * Booking attribution utilities
 * Creates attribution records when bookings are made with referral codes
 */

import { query } from "./db/client"
import { getInfluencerByReferralCode } from "./influencers"
import { getActiveIncentiveForReferral } from "./incentives"
import { calculateCommission } from "./commissions"

export interface BookingAttribution {
  id: string
  booking_id: string
  influencer_id: string
  referral_code: string
  guest_discount_applied: number
  guest_discount_type: "percent" | "fixed"
  commission_owed: number
  commission_type: "percent" | "fixed"
  revenue_basis: number
  created_at: Date
}

/**
 * Create booking attribution from referral code
 */
export async function createBookingAttribution(params: {
  bookingId: string
  referralCode: string
  revenueBasis: number // Subtotal before discount
  guestDiscountApplied: number
}): Promise<BookingAttribution | null> {
  const { bookingId, referralCode, revenueBasis, guestDiscountApplied } = params

  // Get influencer
  const influencer = await getInfluencerByReferralCode(referralCode)
  if (!influencer) {
    console.warn(`Influencer not found for referral code: ${referralCode}`)
    return null
  }

  // Get active incentive (snapshot at booking time)
  const incentive = await getActiveIncentiveForReferral(referralCode)
  if (!incentive) {
    console.warn(`No active incentive found for referral code: ${referralCode}`)
    return null
  }

  // Calculate commission
  const commissionAmount = calculateCommission(
    revenueBasis,
    incentive.influencer_commission_type,
    incentive.influencer_commission_value
  )

  // Create attribution
  const attributionResult = await query<BookingAttribution>(
    `INSERT INTO booking_attributions (
      booking_id, influencer_id, referral_code,
      guest_discount_applied, guest_discount_type,
      commission_owed, commission_type, revenue_basis
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      bookingId,
      influencer.id,
      referralCode,
      guestDiscountApplied,
      incentive.guest_discount_type,
      commissionAmount,
      incentive.influencer_commission_type,
      revenueBasis,
    ]
  )

  const attribution = attributionResult.rows[0]

  // Create commission ledger entry
  await query(
    `INSERT INTO commission_ledger (
      booking_attribution_id, influencer_id, amount, status
    ) VALUES ($1, $2, $3, 'owed')`,
    [attribution.id, influencer.id, commissionAmount]
  )

  return attribution
}
