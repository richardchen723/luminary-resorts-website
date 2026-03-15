import { NextRequest, NextResponse } from "next/server"

import { requireAuthApi } from "@/lib/auth-helpers"
import { getCouponById, getCouponUsageSummary, updateCoupon } from "@/lib/coupons"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await requireAuthApi(request)

    const resolvedParams = params instanceof Promise ? await params : params
    const coupon = await getCouponById(resolvedParams.id)

    if (!coupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...coupon,
      usage: getCouponUsageSummary(coupon),
    })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }

    console.error("Error fetching coupon:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch coupon" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await requireAuthApi(request)

    const resolvedParams = params instanceof Promise ? await params : params
    const body = await request.json()
    const coupon = await updateCoupon(resolvedParams.id, body)

    return NextResponse.json({
      ...coupon,
      usage: getCouponUsageSummary(coupon),
    })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }

    console.error("Error updating coupon:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update coupon" },
      { status: 500 }
    )
  }
}
