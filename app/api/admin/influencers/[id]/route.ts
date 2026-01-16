/**
 * GET /api/admin/influencers/[id] - Get influencer by ID
 * PATCH /api/admin/influencers/[id] - Update influencer
 * DELETE /api/admin/influencers/[id] - Delete influencer (soft delete)
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAuthApi, requireRoleApi } from "@/lib/auth-helpers"
import { getInfluencerById, updateInfluencer, deleteInfluencer } from "@/lib/influencers"
import { query } from "@/lib/db/client"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await requireAuthApi(request)

    // Handle params as Promise (Next.js 15+) or object (Next.js 14)
    const resolvedParams = params instanceof Promise ? await params : params
    const influencer = await getInfluencerById(resolvedParams.id)

    if (!influencer) {
      return NextResponse.json(
        { error: "Influencer not found" },
        { status: 404 }
      )
    }

    // Get active incentive
    const incentiveResult = await query<{
      id: string
      guest_discount_type: string
      guest_discount_value: number
      influencer_commission_type: string
      influencer_commission_value: number
      effective_start_date: string | null
      effective_end_date: string | null
    }>(
      "SELECT * FROM incentive_rules WHERE influencer_id = $1 AND is_active = true LIMIT 1",
      [resolvedParams.id]
    )

    const activeIncentive = incentiveResult.rows?.[0] || null

    // Get stats
    const statsResult = await query<{
      total_bookings: string
      total_revenue: string
      total_commission_owed: string
      total_commission_paid: string
    }>(
      `SELECT 
        COUNT(ba.id) as total_bookings,
        COALESCE(SUM(ba.revenue_basis), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN cl.status = 'owed' THEN cl.amount ELSE 0 END), 0) as total_commission_owed,
        COALESCE(SUM(CASE WHEN cl.status = 'paid' THEN cl.amount ELSE 0 END), 0) as total_commission_paid
      FROM influencers i
      LEFT JOIN booking_attributions ba ON ba.influencer_id = i.id
      LEFT JOIN commission_ledger cl ON cl.booking_attribution_id = ba.id
      WHERE i.id = $1
      GROUP BY i.id`,
      [resolvedParams.id]
    )

    const stats = statsResult.rows?.[0] || {
      total_bookings: "0",
      total_revenue: "0",
      total_commission_owed: "0",
      total_commission_paid: "0",
    }

    return NextResponse.json({
      ...influencer,
      referral_link: `${process.env.NEXT_PUBLIC_BASE_URL || "https://luminaryresorts.com"}/r/${influencer.referral_code}`,
      active_incentive: activeIncentive,
      stats: {
        total_bookings: parseInt(stats.total_bookings, 10),
        total_revenue: parseFloat(stats.total_revenue),
        total_commission_owed: parseFloat(stats.total_commission_owed),
        total_commission_paid: parseFloat(stats.total_commission_paid),
      },
    })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error("Error getting influencer:", error)
    return NextResponse.json(
      { error: error.message || "Failed to get influencer" },
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

    // Handle params as Promise (Next.js 15+) or object (Next.js 14)
    const resolvedParams = params instanceof Promise ? await params : params
    const body = await request.json()
    const influencer = await updateInfluencer(resolvedParams.id, body)

    return NextResponse.json(influencer)
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error("Error updating influencer:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update influencer" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Only owner can delete
    await requireRoleApi(request, ["owner"])

    // Handle params as Promise (Next.js 15+) or object (Next.js 14)
    const resolvedParams = params instanceof Promise ? await params : params
    await deleteInfluencer(resolvedParams.id)

    return NextResponse.json({ success: true, message: "Influencer deleted" })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error("Error deleting influencer:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete influencer" },
      { status: 500 }
    )
  }
}
