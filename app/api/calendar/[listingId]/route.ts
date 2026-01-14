/**
 * GET /api/calendar/[listingId]
 * Get calendar data for a listing (3-year window)
 * Returns cached calendar data with availability and pricing
 */

import { NextResponse } from "next/server"
import { isDatabaseAvailable } from "@/lib/db/client"
import { getCalendarCache } from "@/lib/db/calendar-cache"
import { syncCalendarForListing } from "@/lib/calendar-sync"
import { getCalendarAvailability } from "@/lib/hostaway"
import type { HostawayCalendarEntry } from "@/types/hostaway"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params
    const listingIdNum = parseInt(listingId, 10)
    
    if (isNaN(listingIdNum)) {
      return NextResponse.json(
        { error: "Invalid listing ID" },
        { status: 400 }
      )
    }
    
    // Get query parameters for date range (optional, defaults to 3-year window)
    const url = new URL(request.url)
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")
    
    // Default to 3-year window if not specified
    const today = new Date()
    const defaultStartDate = new Date(today.getFullYear() - 1, 0, 1)
    const defaultEndDate = new Date(today.getFullYear() + 2, 11, 31)
    
    const startDateStr = startDate || defaultStartDate.toISOString().split('T')[0]
    const endDateStr = endDate || defaultEndDate.toISOString().split('T')[0]
    
    // If database is not available, fetch directly from Hostaway
    if (!isDatabaseAvailable()) {
      try {
        const calendar = await getCalendarAvailability(listingIdNum, startDateStr, endDateStr)
        
        // Return full calendar entries (preserve all fields including reservations, minimumStay)
        const calendarFormatted: Record<string, HostawayCalendarEntry> = {}
        
        // Handle both array and object formats
        if (Array.isArray(calendar)) {
          for (const entry of calendar) {
            if (entry && entry.date) {
              calendarFormatted[entry.date] = entry as HostawayCalendarEntry
            }
          }
        } else {
          for (const [date, entry] of Object.entries(calendar)) {
            // Skip numeric keys (array indices that got converted to object keys)
            if (date.match(/^\d+$/)) {
              // This is likely an array index, check if entry has a date property
              if (entry && typeof entry === 'object' && 'date' in entry) {
                const actualDate = (entry as any).date
                calendarFormatted[actualDate] = entry as HostawayCalendarEntry
              }
            } else {
              // This is a date string key
              calendarFormatted[date] = entry as HostawayCalendarEntry
            }
          }
        }
        
        return NextResponse.json({
          listingId: listingIdNum,
          calendar: calendarFormatted,
          cached: false,
          dateRange: {
            startDate: startDateStr,
            endDate: endDateStr,
          },
        })
      } catch (error: any) {
        console.error('Error fetching calendar from Hostaway:', error)
        return NextResponse.json(
          {
            error: 'Failed to fetch calendar data',
          },
          { status: 500 }
        )
      }
    }
    
    // Always fetch directly from Hostaway first (source of truth)
    // Cache is only used as fallback if Hostaway fetch fails
    let calendarData = await getCalendarCache(listingIdNum, startDateStr, endDateStr)
    
    // Always fetch directly from Hostaway (source of truth)
    try {
      const calendar = await getCalendarAvailability(listingIdNum, startDateStr, endDateStr)
      
      // Return full calendar entries (preserve all fields)
      const calendarFormatted: Record<string, HostawayCalendarEntry> = {}
      
      // Handle both array and object formats
      if (Array.isArray(calendar)) {
        for (const entry of calendar) {
          if (entry && entry.date) {
            calendarFormatted[entry.date] = entry as HostawayCalendarEntry
          }
        }
      } else {
        for (const [date, entry] of Object.entries(calendar)) {
          if (date.match(/^\d+$/)) {
            if (entry && typeof entry === 'object' && 'date' in entry) {
              const actualDate = (entry as any).date
              calendarFormatted[actualDate] = entry as HostawayCalendarEntry
            }
          } else {
            calendarFormatted[date] = entry as HostawayCalendarEntry
          }
        }
      }
      
      // Trigger sync in background to update cache
      syncCalendarForListing(listingIdNum).catch((error) => {
        console.error(`Background sync failed for listing ${listingIdNum}:`, error)
      })
      
      return NextResponse.json({
        listingId: listingIdNum,
        calendar: calendarFormatted,
        cached: false,
        dateRange: {
          startDate: startDateStr,
          endDate: endDateStr,
        },
      })
    } catch (error: any) {
      console.error(`[CALENDAR API] Error fetching from Hostaway for listing ${listingIdNum}:`, error)
      // If Hostaway fetch fails, fall back to cache if available
      if (calendarData.length > 0) {
        console.warn(`[CALENDAR API] Hostaway fetch failed, using cache as fallback for listing ${listingIdNum}`)
        // Continue to cache conversion below
      } else {
        return NextResponse.json({
          listingId: listingIdNum,
          calendar: {},
          cached: false,
          error: error.message,
        })
      }
    }
    
    // Convert cache entries to calendar format (only used as fallback if Hostaway fetch failed)
    const calendar: Record<string, HostawayCalendarEntry> = {}
    
    for (const entry of calendarData) {
      calendar[entry.date] = {
        date: entry.date,
        isAvailable: entry.available ? 1 : 0,
        available: entry.available ? 1 : 0,
        status: entry.available ? "available" : "reserved",
        price: entry.price,
        minimumStay: entry.minimum_stay,
        reservations: entry.reservations || undefined,
      }
    }
    
    return NextResponse.json({
      listingId: listingIdNum,
      calendar,
      cached: true,
      dateRange: {
        startDate: startDateStr,
        endDate: endDateStr,
      },
    })
  } catch (error: any) {
    console.error("Error getting calendar data:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to get calendar data",
      },
      { status: 500 }
    )
  }
}
