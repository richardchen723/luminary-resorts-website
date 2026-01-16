/**
 * GET /api/admin/influencers/[id]/incentives - Get incentives (active + history)
 * POST /api/admin/influencers/[id]/incentives - Create new incentive
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAuthApi } from "@/lib/auth-helpers"
import { listIncentives, createIncentive } from "@/lib/incentives"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await requireAuthApi(request)

    // Handle params as Promise (Next.js 15+) or object (Next.js 14)
    const resolvedParams = params instanceof Promise ? await params : params
    const result = await listIncentives(resolvedParams.id)

    return NextResponse.json(result)
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error("Error listing incentives:", error)
    return NextResponse.json(
      { error: error.message || "Failed to list incentives" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const adminUser = await requireAuthApi(request)

    // Handle params as Promise (Next.js 15+) or object (Next.js 14)
    const resolvedParams = params instanceof Promise ? await params : params

    const body = await request.json()
    const {
      guest_discount_type,
      guest_discount_value,
      influencer_commission_type,
      influencer_commission_value,
      effective_start_date,
      effective_end_date,
      notes,
    } = body

    // Validation
    if (!guest_discount_type || !guest_discount_value || !influencer_commission_type || !influencer_commission_value) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (guest_discount_type === "percent" && (guest_discount_value < 0 || guest_discount_value > 100)) {
      return NextResponse.json(
        { error: "Percent discount must be between 0 and 100" },
        { status: 400 }
      )
    }

    if (influencer_commission_type === "percent" && (influencer_commission_value < 0 || influencer_commission_value > 100)) {
      return NextResponse.json(
        { error: "Percent commission must be between 0 and 100" },
        { status: 400 }
      )
    }

    if (effective_end_date && effective_start_date && effective_end_date < effective_start_date) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      )
    }

    const incentive = await createIncentive(
      {
        influencer_id: resolvedParams.id,
        guest_discount_type,
        guest_discount_value: parseFloat(guest_discount_value),
        influencer_commission_type,
        influencer_commission_value: parseFloat(influencer_commission_value),
        effective_start_date: effective_start_date || null,
        effective_end_date: effective_end_date || null,
        notes: notes || null,
      },
      adminUser
    )

    return NextResponse.json(incentive, { status: 201 })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error("Error creating incentive:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create incentive" },
      { status: 500 }
    )
  }
}
