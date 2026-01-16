/**
 * POST /api/admin/reports/send - Send report email to influencer
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAuthApi } from "@/lib/auth-helpers"
import { generateReport, generateCSV } from "@/lib/reports"
import { getInfluencerById } from "@/lib/influencers"
import { sendInfluencerReportEmail } from "@/lib/email-templates/influencer-report"

export async function POST(request: NextRequest) {
  try {
    await requireAuthApi(request)

    const body = await request.json()
    const {
      influencer_id,
      start_date,
      end_date,
      email_subject,
      email_message,
    } = body

    if (!influencer_id) {
      return NextResponse.json(
        { error: "influencer_id is required" },
        { status: 400 }
      )
    }

    // Get influencer
    const influencer = await getInfluencerById(influencer_id)
    if (!influencer) {
      return NextResponse.json(
        { error: "Influencer not found" },
        { status: 404 }
      )
    }

    if (!influencer.email) {
      return NextResponse.json(
        { error: "Influencer email not set" },
        { status: 400 }
      )
    }

    // Generate report
    const result = await generateReport({
      influencer_id,
      start_date,
      end_date,
      status: "all",
      page: 1,
      limit: 10000,
    })

    // Generate CSV
    const csv = generateCSV(result)
    const csvBuffer = Buffer.from(csv, "utf-8")

    // Send email
    await sendInfluencerReportEmail({
      influencerEmail: influencer.email,
      influencerName: influencer.name,
      reportData: {
        startDate: start_date || "all time",
        endDate: end_date || "all time",
        bookings: result.bookings,
        summary: result.summary,
      },
      csvAttachment: csvBuffer,
      emailSubject: email_subject,
      emailMessage: email_message,
    })

    return NextResponse.json({
      success: true,
      message: `Report sent to ${influencer.email}`,
    })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error("Error sending report:", error)
    return NextResponse.json(
      { error: error.message || "Failed to send report" },
      { status: 500 }
    )
  }
}
