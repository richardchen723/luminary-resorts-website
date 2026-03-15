import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { calculateCheckoutDiscount, getReferralCodeFromRequest } from "@/lib/discounts"

interface DiscountRequest {
  subtotal: number
  couponCode?: string | null
}

/**
 * POST /api/pricing/discount
 * Calculate discount for a given subtotal if referral cookie is present
 * Body: { subtotal }
 */
export async function POST(request: Request) {
  try {
    const body: DiscountRequest = await request.json()
    const { subtotal, couponCode } = body

    if (!subtotal || subtotal <= 0) {
      return NextResponse.json(
        { error: "subtotal is required and must be greater than 0" },
        { status: 400 }
      )
    }

    // Check for referral code and calculate discount
    const cookieStore = await cookies()
    const referralCode = getReferralCodeFromRequest(cookieStore)

    if (!couponCode && !referralCode) {
      return NextResponse.json({ discount: null }, { status: 200 })
    }

    try {
      const discount = await calculateCheckoutDiscount({
        couponCode,
        referralCode,
        subtotal,
      })

      return NextResponse.json({ discount }, { status: 200 })
    } catch (discountError: any) {
      return NextResponse.json(
        { error: discountError.message || "Coupon code is invalid" },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error("Error calculating discount:", error)
    return NextResponse.json(
      { error: error.message || "Failed to calculate discount" },
      { status: 500 }
    )
  }
}
