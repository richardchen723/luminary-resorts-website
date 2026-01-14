/**
 * Test endpoint to verify Hostaway calendar update/block functionality
 * POST /api/test/calendar
 * Body: { listingId, startDate, endDate, block (true/false) }
 */

import { NextResponse } from "next/server"
import { updateCalendarAvailability } from "@/lib/hostaway"

export async function POST(request: Request) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "This endpoint is only available in development" },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    const { listingId, startDate, endDate, block } = body
    
    if (!listingId || !startDate || !endDate || block === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: listingId, startDate, endDate, and block are required" },
        { status: 400 }
      )
    }

    // Generate array of dates between startDate and endDate
    const dates: string[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0])
    }

    console.log(`Attempting to ${block ? 'block' : 'unblock'} dates for listing ${listingId}:`)
    console.log("Dates:", dates)

    await updateCalendarAvailability(
      parseInt(listingId, 10),
      dates,
      !block // available = !block (if block is true, available is false)
    )

    return NextResponse.json(
      {
        success: true,
        message: `Successfully ${block ? 'blocked' : 'unblocked'} dates`,
        listingId: parseInt(listingId, 10),
        dates,
        block,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error updating Hostaway calendar:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update calendar",
        details: error.stack,
      },
      { status: 500 }
    )
  }
}
