import { NextResponse } from "next/server"
import { getPricing } from "@/lib/hostaway"

interface PricingRequest {
  listingId: number
  startDate: string
  endDate: string
  guests: number
}

/**
 * POST /api/pricing
 * Get pricing breakdown for a listing
 * Body: { listingId, startDate, endDate, guests }
 */
export async function POST(request: Request) {
  try {
    const body: PricingRequest = await request.json()
    const { listingId, startDate, endDate, guests } = body

    // Validate required fields
    if (!listingId || !startDate || !endDate || !guests) {
      return NextResponse.json(
        { error: "listingId, startDate, endDate, and guests are required" },
        { status: 400 }
      )
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json(
        { error: "Dates must be in YYYY-MM-DD format" },
        { status: 400 }
      )
    }

    // Get pricing from Hostaway
    const pricing = await getPricing(listingId, startDate, endDate, guests)

    return NextResponse.json(pricing, { status: 200 })
  } catch (error: any) {
    console.error("Error getting pricing:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to get pricing. Please try again later.",
        available: false,
      },
      { status: 500 }
    )
  }
}
