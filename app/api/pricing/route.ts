import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getPricing } from "@/lib/hostaway"
import { calculateDiscount, getReferralCodeFromRequest } from "@/lib/discounts"

interface PricingRequest {
  listingId: number
  startDate: string
  endDate: string
  guests: number
}

/**
 * POST /api/pricing
 * Get pricing breakdown for a listing
 * Body: { listingId, startDate, endDate, guests }
 * Applies referral discounts if referral cookie is present
 */
export async function POST(request: Request) {
  try {
    const body: PricingRequest = await request.json()
    const { listingId, startDate, endDate, guests } = body

    // Validate required fields
    if (!listingId || !startDate || !endDate || !guests) {
      return NextResponse.json(
        { error: "listingId, startDate, endDate, and guests are required" },
        { status: 400 }
      )
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json(
        { error: "Dates must be in YYYY-MM-DD format" },
        { status: 400 }
      )
    }

    // Get pricing from Hostaway
    const pricing = await getPricing(listingId, startDate, endDate, guests)

    // Check for referral code and apply discount
    const cookieStore = await cookies()
    const referralCode = getReferralCodeFromRequest(cookieStore)

    // Apply discount even if Hostaway returned unavailable but we have a subtotal
    // This handles the case where Hostaway API fails but we can still calculate discount
    if (referralCode && pricing.breakdown?.subtotal && pricing.breakdown.subtotal > 0) {
      const discount = await calculateDiscount(referralCode, pricing.breakdown.subtotal)

      if (discount) {
        // Apply discount to subtotal
        const originalSubtotal = pricing.breakdown.subtotal
        const discountedSubtotal = discount.discounted_subtotal

        // Recalculate tax on discounted subtotal (assuming 12% tax rate)
        const taxRate = pricing.breakdown.taxes
          ? pricing.breakdown.taxes / originalSubtotal
          : 0.12
        const newTax = discountedSubtotal * taxRate

        // Recalculate channel fee on discounted subtotal (assuming 2% fee)
        // Channel fee is typically calculated on the original subtotal, but we'll recalculate on discounted
        const originalChannelFee = pricing.breakdown.channelFee || (pricing.breakdown.subtotal * 0.02)
        const channelFeeRate = pricing.breakdown.subtotal > 0
          ? originalChannelFee / pricing.breakdown.subtotal
          : 0.02
        const newChannelFee = discountedSubtotal * channelFeeRate

        // Update pricing breakdown
        pricing.breakdown = {
          ...pricing.breakdown,
          subtotal: originalSubtotal,
          discount: {
            type: discount.discount_type,
            value: discount.discount_value,
            amount: discount.discount_amount,
          },
          discounted_subtotal: discountedSubtotal,
          taxes: newTax,
          channelFee: newChannelFee,
          // Keep cleaning fee and other fees as-is
          total: discountedSubtotal + (pricing.breakdown.fees || 0) + newTax + newChannelFee,
        }
        
        // If Hostaway returned unavailable, mark as available now that we have valid pricing with discount
        if (!pricing.available) {
          pricing.available = true
        }
      }
    }
    
    return NextResponse.json(pricing, { status: 200 })
  } catch (error: any) {
    console.error("Error getting pricing:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to get pricing. Please try again later.",
        available: false,
      },
      { status: 500 }
    )
  }
}
