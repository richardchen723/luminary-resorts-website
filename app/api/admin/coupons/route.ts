import { NextRequest, NextResponse } from "next/server"

import { requireAuthApi } from "@/lib/auth-helpers"
import { createCoupon, listCoupons } from "@/lib/coupons"

export async function GET(request: NextRequest) {
  try {
    await requireAuthApi(request)

    const coupons = await listCoupons()
    return NextResponse.json({ coupons })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }

    console.error("Error listing coupons:", error)
    return NextResponse.json(
      { error: error.message || "Failed to list coupons" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAuthApi(request)
    const body = await request.json()

    const coupon = await createCoupon(body, adminUser)
    return NextResponse.json(coupon, { status: 201 })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }

    console.error("Error creating coupon:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create coupon" },
      { status: 500 }
    )
  }
}
