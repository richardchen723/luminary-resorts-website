/**
 * GET /api/admin/reports - Generate report
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAuthApi } from "@/lib/auth-helpers"
import { generateReport } from "@/lib/reports"

export async function GET(request: NextRequest) {
  try {
    await requireAuthApi(request)

    const { searchParams } = new URL(request.url)
    const influencer_id = searchParams.get("influencer_id") || undefined
    const start_date = searchParams.get("start_date") || undefined
    const end_date = searchParams.get("end_date") || undefined
    const status = (searchParams.get("status") || "all") as
      | "all"
      | "owed"
      | "paid"
      | "cancelled"
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "50", 10)

    const result = await generateReport({
      influencer_id,
      start_date,
      end_date,
      status,
      page,
      limit,
    })

    return NextResponse.json({
      bookings: result.bookings,
      summary: result.summary,
      pagination: {
        page,
        limit,
        total: result.summary.total_bookings,
        totalPages: Math.ceil(result.summary.total_bookings / limit),
      },
    })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error("Error generating report:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 500 }
    )
  }
}
