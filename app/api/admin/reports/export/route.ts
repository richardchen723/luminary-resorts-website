/**
 * GET /api/admin/reports/export - Export report as CSV
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAuthApi } from "@/lib/auth-helpers"
import { generateReport, generateCSV } from "@/lib/reports"

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

    // Get all results (no pagination for export)
    const result = await generateReport({
      influencer_id,
      start_date,
      end_date,
      status,
      page: 1,
      limit: 10000, // Large limit for export
    })

    const csv = generateCSV(result)

    const filename = `influencer-report-${new Date().toISOString().split("T")[0]}.csv`

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error("Error exporting report:", error)
    return NextResponse.json(
      { error: error.message || "Failed to export report" },
      { status: 500 }
    )
  }
}
