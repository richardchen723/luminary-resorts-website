import { NextRequest, NextResponse } from "next/server"

import { requireAuthApi } from "@/lib/auth-helpers"
import { getCouponById } from "@/lib/coupons"
import { sendCouponCodeEmail } from "@/lib/email"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await requireAuthApi(request)

    const resolvedParams = params instanceof Promise ? await params : params
    const body = await request.json()
    const firstName = body.firstName?.trim()
    const email = body.email?.trim()

    if (!firstName || !email) {
      return NextResponse.json(
        { error: "First name and email are required" },
        { status: 400 }
      )
    }

    const coupon = await getCouponById(resolvedParams.id)
    if (!coupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      )
    }

    await sendCouponCodeEmail({
      guestFirstName: firstName,
      guestEmail: email,
      couponCode: coupon.code,
      couponName: coupon.name,
      description: coupon.description,
      discount: {
        type: coupon.discount_type,
        value: coupon.discount_value,
      },
      expiresAt: coupon.expires_at,
    })

    return NextResponse.json({
      success: true,
      message: `Coupon email sent to ${email}`,
    })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }

    console.error("Error sending coupon email:", error)
    return NextResponse.json(
      { error: error.message || "Failed to send coupon email" },
      { status: 500 }
    )
  }
}
