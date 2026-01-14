import { NextResponse } from "next/server"
import { getListing } from "@/lib/hostaway"

/**
 * GET /api/listing/[id]
 * Get listing data including base price
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const listingId = parseInt(id, 10)

    if (isNaN(listingId)) {
      return NextResponse.json(
        { error: "Invalid listing ID" },
        { status: 400 }
      )
    }

    const listingData = await getListing(listingId)

    return NextResponse.json({
      listingId: listingData.listing.id,
      basePrice: listingData.averageNightlyPrice || listingData.listing.price,
      currency: listingData.listing.currencyCode || "USD",
    }, { status: 200 })
  } catch (error: any) {
    console.error("Error getting listing:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to get listing data. Please try again later.",
      },
      { status: 500 }
    )
  }
}
