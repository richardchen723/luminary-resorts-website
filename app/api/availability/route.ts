import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"
import { checkCabinAvailability, checkAllCabinsAvailability, formatAvailabilityResponse } from "@/lib/availability"
import { getAllCabinsFromHostaway } from "@/lib/cabin-cache"
import { getListingIdBySlug } from "@/lib/listing-map"

const CACHE_DURATION = 300 // 5 minutes

interface AvailabilityRequest {
  startDate: string
  endDate: string
  guests?: number
  listingId?: number
  slug?: string
}

/**
 * POST /api/availability
 * Check availability for cabins
 * Body: { startDate, endDate, guests?, listingId?, slug? }
 */
export async function POST(request: Request) {
  try {
    const body: AvailabilityRequest = await request.json()
    const { startDate, endDate, guests = 2, listingId, slug } = body

    // Validate required fields
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required (YYYY-MM-DD format)" },
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

    // Validate date range
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (start >= end) {
      return NextResponse.json(
        { error: "endDate must be after startDate" },
        { status: 400 }
      )
    }

    // Use cached function for availability checking
    const cachedCheck = unstable_cache(
      async () => {
        if (slug) {
          // Check single cabin by slug
          const result = await checkCabinAvailability(slug, startDate, endDate, guests)
          const cabins = await getAllCabinsFromHostaway()
          return formatAvailabilityResponse(
            {
              available: result.available,
              cabins: [result],
            },
            cabins
          )
        } else if (listingId) {
          // Check single cabin by listing ID
          // Find slug from listing ID
          const { getSlugByListingId } = await import("@/lib/listing-map")
          const cabinSlug = getSlugByListingId(listingId)
          if (!cabinSlug) {
            throw new Error(`No cabin found for listing ID: ${listingId}`)
          }
          const result = await checkCabinAvailability(cabinSlug, startDate, endDate, guests)
          const cabins = await getAllCabinsFromHostaway()
          return formatAvailabilityResponse(
            {
              available: result.available,
              cabins: [result],
            },
            cabins
          )
        } else {
          // Check all cabins
          const result = await checkAllCabinsAvailability(startDate, endDate, guests)
          const cabins = await getAllCabinsFromHostaway()
          return formatAvailabilityResponse(result, cabins)
        }
      },
      [`availability-${startDate}-${endDate}-${guests}-${slug || listingId || "all"}`],
      {
        revalidate: CACHE_DURATION,
        tags: ["availability"],
      }
    )

    const result = await cachedCheck()

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error("Error checking availability:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to check availability. Please try again later.",
        available: false,
        cabins: [],
      },
      { status: 500 }
    )
  }
}
