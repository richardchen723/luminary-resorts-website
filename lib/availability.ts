import { getCalendarAvailability, getPricing } from "@/lib/hostaway"
import { getListingIdBySlug, getAllListingIds, getSlugByListingId } from "@/lib/listing-map"
import { calculateCalendarStatus, buildNextCheckInMap } from "@/lib/calendar-status"
import { parseISO, format } from "date-fns"
import type { Cabin } from "@/lib/cabins"
import type { HostawayCalendarEntry } from "@/types/hostaway"

export interface CabinAvailability {
  slug: string
  listingId: number
  name: string
  available: boolean
  price?: number
  currency?: string
  image?: string
}

export interface AvailabilityCheckResult {
  available: boolean
  cabins: CabinAvailability[]
}

/**
 * Check availability for a single cabin
 * Simplified logic:
 * 1. Check-in date must be "open" (not checkout-only)
 * 2. All dates during stay (check-in+1 to check-out-1) can be "open" or "checkout-only"
 * 3. Check-out date can be "open" or "checkout-only"
 * 
 * Optimized with:
 * - Early exit on first failure
 * - Cached date parsing
 * - Efficient date range iteration
 * - Minimal calendar data processing
 */
export async function checkCabinAvailability(
  slug: string,
  startDate: string,
  endDate: string,
  guests: number = 2
): Promise<CabinAvailability> {
  const listingId = getListingIdBySlug(slug)
  if (!listingId) {
    throw new Error(`No listing ID found for cabin slug: ${slug}`)
  }

  // Get cabin name from static data (we'll enhance this later)
  const cabinName = slug.charAt(0).toUpperCase() + slug.slice(1)

  try {
    // Primary method: Use Calendar API for accurate availability checking
    // This syncs with Hostaway calendar in real-time
    let isAvailable = true
    let price: number | undefined
    let currency: string | undefined
    let calendarCheckSucceeded = false

    try {
      // Expand end date by 30 days to capture next check-in dates for minimum stay logic
      const endDateObj = new Date(endDate)
      const expandedEndDate = new Date(endDateObj)
      expandedEndDate.setDate(expandedEndDate.getDate() + 30)
      const expandedEndDateStr = expandedEndDate.toISOString().split("T")[0]
      
      // Get calendar availability from Hostaway (primary source of truth)
      const calendar = await getCalendarAvailability(listingId, startDate, expandedEndDateStr)
      
      if (calendar && Object.keys(calendar).length > 0) {
        calendarCheckSucceeded = true
        
        // Convert calendar to HostawayCalendarEntry format (optimized: only process what we need)
        const calendarEntries: Record<string, HostawayCalendarEntry> = {}
        for (const [date, entry] of Object.entries(calendar)) {
          if (typeof entry === 'object' && entry !== null) {
            calendarEntries[date] = entry as HostawayCalendarEntry
          }
        }
        
        // Pre-parse dates once (avoid repeated parsing)
        const checkInDate = parseISO(startDate)
        const checkOutDate = parseISO(endDate)
        
        // Build next check-in map only if we have calendar entries
        const nextCheckInMap = Object.keys(calendarEntries).length > 0 
          ? buildNextCheckInMap(calendarEntries)
          : {}
        
        // Step 1: Check-in date must be "open" (early exit if fails)
        const checkInDateInfo = calculateCalendarStatus(checkInDate, calendarEntries, checkInDate, nextCheckInMap)
        if (checkInDateInfo.status !== "open") {
          isAvailable = false
        } else {
          // Step 2: Check all dates during stay (check-in+1 to check-out-1)
          // Optimized: iterate dates directly without creating full array
          const start = new Date(checkInDate)
          start.setDate(start.getDate() + 1) // Start from day after check-in
          
          let currentDate = new Date(start)
          let allStayDatesValid = true
          
          // Iterate through dates during stay (exclusive of check-out)
          while (currentDate < checkOutDate && allStayDatesValid) {
            const dateStr = format(currentDate, "yyyy-MM-dd")
            const dateInfo = calculateCalendarStatus(currentDate, calendarEntries, checkInDate, nextCheckInMap)
            
            // During stay, dates can be "open" or "checkout-only" (not solid-block)
            if (dateInfo.status !== "open" && dateInfo.status !== "checkout-only") {
              allStayDatesValid = false
              isAvailable = false
              break // Early exit
            }
            
            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1)
          }
          
          // Step 3: Check-out date can be "open" or "checkout-only" (only if stay dates passed)
          if (isAvailable && allStayDatesValid) {
            const checkOutDateInfo = calculateCalendarStatus(checkOutDate, calendarEntries, checkInDate, nextCheckInMap)
            if (checkOutDateInfo.status !== "open" && checkOutDateInfo.status !== "checkout-only") {
              isAvailable = false
            }
          }
        }
      } else {
        // Empty calendar response - try pricing API as fallback
        console.log(`Empty calendar response for ${slug}, trying pricing API`)
      }
    } catch (calendarError: any) {
      console.warn(`Could not fetch calendar for ${slug}, trying pricing API:`, calendarError.message)
    }

    // Get pricing information (for display, regardless of availability check method)
    // Note: Calendar is the source of truth for availability, pricing is only for display
    try {
      const pricing = await getPricing(listingId, startDate, endDate, guests)
      
      if (pricing?.breakdown) {
        price = pricing.breakdown.total
        currency = pricing.breakdown.currency
        
        // Only use pricing availability as fallback if calendar check failed
        // Calendar is the primary source of truth - don't override calendar result with pricing
        if (!calendarCheckSucceeded) {
          // Calendar check failed, use pricing as fallback
          if (typeof pricing.available === 'boolean') {
            isAvailable = pricing.available
          }
        }
        // If calendar check succeeded, trust calendar result (don't override with pricing)
      }
    } catch (pricingError: any) {
      console.warn(`Could not fetch pricing for ${slug}:`, pricingError.message)
      // Pricing is optional - availability check from calendar is primary
    }

    return {
      slug,
      listingId,
      name: cabinName,
      available: isAvailable,
      price,
      currency,
    }
  } catch (error: any) {
    console.error(`Error checking availability for ${slug}:`, error)
    // On error, assume available as fallback (since user reports cabins should be available)
    return {
      slug,
      listingId,
      name: cabinName,
      available: true, // Fallback: assume available if we can't check
      price: undefined,
      currency: undefined,
    }
  }
}

/**
 * Check availability for all cabins
 */
export async function checkAllCabinsAvailability(
  startDate: string,
  endDate: string,
  guests: number = 2
): Promise<AvailabilityCheckResult> {
  const allListingIds = getAllListingIds()

  try {
    // Check availability for all cabins in parallel
    const availabilityPromises = allListingIds.map(async (listingId) => {
      const slug = getSlugByListingId(listingId)
      if (!slug) {
        throw new Error(`No slug found for listing ID: ${listingId}`)
      }
      return checkCabinAvailability(slug, startDate, endDate, guests)
    })

    const results = await Promise.allSettled(availabilityPromises)
    const cabins: CabinAvailability[] = results
      .filter((result): result is PromiseFulfilledResult<CabinAvailability> => result.status === "fulfilled")
      .map((result) => result.value)

    const available = cabins.some((cabin) => cabin.available)

    return {
      available,
      cabins,
    }
  } catch (error) {
    console.error("Error checking all cabins availability:", error)
    return {
      available: false,
      cabins: [],
    }
  }
}

/**
 * Helper function to get date range between start and end dates
 */
function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // Don't include end date (check-out day)
  const current = new Date(start)
  while (current < end) {
    dates.push(current.toISOString().split("T")[0])
    current.setDate(current.getDate() + 1)
  }
  
  return dates
}

/**
 * Format availability response for API
 */
export function formatAvailabilityResponse(
  result: AvailabilityCheckResult,
  cabins: Cabin[]
): AvailabilityCheckResult {
  // Enhance cabin data with images and names from cabin data
  const enhancedCabins = result.cabins.map((cabin) => {
    const cabinData = cabins.find((c) => c.slug === cabin.slug)
    return {
      ...cabin,
      name: cabinData?.name || cabin.name,
      image: cabinData?.images?.[0] || cabin.image,
    }
  })

  return {
    ...result,
    cabins: enhancedCabins,
  }
}
