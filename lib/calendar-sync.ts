/**
 * Calendar synchronization logic
 * Fetches 3 years of calendar data from Hostaway and stores in cache
 */

import { getCalendarAvailability } from './hostaway'
import { getAllListingIds } from './listing-map'
import { upsertCalendarCache, invalidateCalendarCache } from './db/calendar-cache'

/**
 * Sync calendar for a single listing
 * Fetches 3 years of data (past 1 year + future 2 years)
 */
export async function syncCalendarForListing(listingId: number): Promise<void> {
  const today = new Date()
  const startDate = new Date(today.getFullYear() - 1, 0, 1) // 1 year ago
  const endDate = new Date(today.getFullYear() + 2, 11, 31) // 2 years ahead (end of year)
  
  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]
  
  console.log(`Syncing calendar for listing ${listingId} from ${startDateStr} to ${endDateStr}`)
  
  try {
    // Fetch calendar data from Hostaway (always use Hostaway as source of truth)
    const calendar = await getCalendarAvailability(listingId, startDateStr, endDateStr)
    
    // Cache expires in 30 minutes
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)
    
    // Store each date in cache
    const dates = Object.keys(calendar)
    let cached = 0
    
    for (const date of dates) {
      const entry = calendar[date]
      
      // Determine availability
      const isAvailable = 
        entry.isAvailable === 1 || 
        entry.available === 1 || 
        entry.status === "available"
      
      // Extract reservations from API response (always use Hostaway data)
      const reservations = entry.reservations || null
      
      // Extract minimum stay
      const minimumStay = entry.minimumStay ?? null
      
      await upsertCalendarCache(
        listingId,
        date,
        isAvailable,
        entry.price || null,
        'USD', // Default currency, could be extracted from entry if available
        expiresAt,
        minimumStay,
        reservations
      )
      
      cached++
    }
    
    console.log(`✅ Cached ${cached} dates for listing ${listingId}`)
  } catch (error: any) {
    console.error(`❌ Error syncing calendar for listing ${listingId}:`, error.message)
    throw error
  }
}

/**
 * Sync calendars for all listings
 */
export async function syncAllCalendars(): Promise<void> {
  const listings = getAllListingIds()
  console.log(`Starting calendar sync for ${listings.length} listings...`)
  
  for (const listingId of listings) {
    try {
      await syncCalendarForListing(listingId)
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error: any) {
      console.error(`Failed to sync calendar for listing ${listingId}:`, error.message)
      // Continue with other listings even if one fails
    }
  }
  
  console.log(`✅ Calendar sync completed for all listings`)
}

/**
 * Invalidate calendar cache for a date range (used when booking is created/modified/cancelled)
 */
export async function invalidateCalendarForBooking(
  listingId: number,
  arrivalDate: string,
  departureDate: string
): Promise<void> {
  // Invalidate cache for the booking dates
  await invalidateCalendarCache(listingId, arrivalDate, departureDate)
  console.log(`Invalidated calendar cache for listing ${listingId} from ${arrivalDate} to ${departureDate}`)
}
