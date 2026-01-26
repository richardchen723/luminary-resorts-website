/**
 * Calendar Status Calculation Engine
 * 
 * Determines the availability status of calendar dates based on:
 * - Reservation check-in/check-out dates
 * - Minimum stay requirements
 * - Same-day turnover rules
 */

import { format, parseISO, isAfter, isBefore, isSameDay, differenceInDays } from "date-fns"
import type { HostawayCalendarEntry, CalendarDateStatus } from "@/types/hostaway"

export type { CalendarDateStatus }

export interface CalendarDateInfo {
  status: CalendarDateStatus
  isCheckInDate: boolean
  isCheckOutDate: boolean
  isWithinStay: boolean
  minimumStay: number | null
  price: number | null
  currency: string | null
  unavailableReason: string | null // Human-readable reason why date is unavailable (for tooltips)
}

/**
 * Pre-compute a map of next check-in dates for all dates
 * This avoids O(n²) complexity in minimum stay calculations
 * @param calendarData - Full calendar entries with reservations
 * @returns Map of date string to next check-in date (or null if none)
 */
export function buildNextCheckInMap(
  calendarData: Record<string, HostawayCalendarEntry>
): Record<string, Date | null> {
  const nextCheckInMap: Record<string, Date | null> = {}
  const sortedDates = Object.keys(calendarData).sort()
  
  // Build reverse lookup: for each date, find next check-in
  for (let i = 0; i < sortedDates.length; i++) {
    const currentDateStr = sortedDates[i]
    let nextCheckIn: Date | null = null
    
    // Look forward from current date
    for (let j = i + 1; j < sortedDates.length; j++) {
      const futureDateStr = sortedDates[j]
      const entry = calendarData[futureDateStr]
      const hasCheckIn = entry?.reservations?.some(
        (res) => res.arrivalDate === futureDateStr
      )
      if (hasCheckIn) {
        nextCheckIn = parseISO(futureDateStr)
        break
      }
    }
    
    nextCheckInMap[currentDateStr] = nextCheckIn
  }
  
  return nextCheckInMap
}

/**
 * Calculate calendar status for a specific date
 * 
 * @param date - Date to evaluate
 * @param calendarData - Full calendar entries with reservations
 * @param checkInDate - Currently selected check-in date (for minimum stay logic)
 * @param nextCheckInMap - Optional pre-computed map of next check-in dates (for performance)
 * @returns CalendarDateInfo with status and metadata
 */
export function calculateCalendarStatus(
  date: Date,
  calendarData: Record<string, HostawayCalendarEntry>,
  checkInDate: Date | null = null,
  nextCheckInMap?: Record<string, Date | null>
): CalendarDateInfo {
  const dateStr = format(date, "yyyy-MM-dd")
  const entry = calendarData[dateStr]
  
  // Default values
  const defaultInfo: CalendarDateInfo = {
    status: "open",
    isCheckInDate: false,
    isCheckOutDate: false,
    isWithinStay: false,
    minimumStay: null,
    price: null,
    currency: "USD",
    unavailableReason: null,
  }
  
  // If no entry exists, assume available (optimistic availability)
  if (!entry) {
    return defaultInfo
  }
  
  // Extract reservations
  const reservations = entry.reservations || []
  
  // Check if this date is a check-in date
  const isCheckInDate = reservations.some(
    (res) => res.arrivalDate === dateStr
  )
  
  // Check if this date is a checkout date
  const isCheckOutDate = reservations.some(
    (res) => res.departureDate === dateStr
  )
  
  // Check if this date is within a stay (but not check-in or checkout)
  const isWithinStay = reservations.some((res) => {
    const arrival = parseISO(res.arrivalDate)
    const departure = parseISO(res.departureDate)
    return (
      isAfter(date, arrival) &&
      isBefore(date, departure) &&
      !isSameDay(date, arrival) &&
      !isSameDay(date, departure)
    )
  })
  
  // Determine availability from entry
  const isAvailable = 
    entry.isAvailable === 1 || 
    entry.available === 1 || 
    entry.status === "available"
  
  // Extract minimum stay (use from current date's entry)
  const minimumStay = entry.minimumStay ?? null
  
  // Rule 1: If date is both check-in AND checkout, it's solid block
  if (isCheckInDate && isCheckOutDate) {
    return {
      status: "solid-block",
      isCheckInDate: true,
      isCheckOutDate: true,
      isWithinStay: false,
      minimumStay,
      price: entry.price || null,
      currency: "USD",
      unavailableReason: "Fully booked",
    }
  }
  
  // Rule 2: If date is within a stay (not check-in or checkout), it's solid block
  if (isWithinStay) {
    return {
      status: "solid-block",
      isCheckInDate: false,
      isCheckOutDate: false,
      isWithinStay: true,
      minimumStay,
      price: entry.price || null,
      currency: "USD",
      unavailableReason: "Fully booked",
    }
  }
  
  // Rule 3: If date is reserved (isAvailable = 0) but NOT a check-in date, it's solid block
  if (!isAvailable && !isCheckInDate) {
    return {
      status: "solid-block",
      isCheckInDate: false,
      isCheckOutDate,
      isWithinStay: false,
      minimumStay,
      price: entry.price || null,
      currency: "USD",
      unavailableReason: "Fully booked",
    }
  }
  
  // Rule 4: If date is reserved (isAvailable = 0) but IS a check-in date, it's checkout-only
  if (!isAvailable && isCheckInDate && !isCheckOutDate) {
    return {
      status: "checkout-only",
      isCheckInDate: true,
      isCheckOutDate: false,
      isWithinStay: false,
      minimumStay,
      price: entry.price || null,
      currency: "USD",
      unavailableReason: "Check-in unavailable — another guest checking in",
    }
  }
  
  // Rule 5: If date is available but within minimum stay to next check-in, it's checkout-only
  if (isAvailable && minimumStay !== null && minimumStay > 0) {
    // Use pre-computed map if available, otherwise fall back to loop
    let nextCheckInDate: Date | null = null
    if (nextCheckInMap) {
      nextCheckInDate = nextCheckInMap[dateStr] || null
    } else {
      // Fallback: Find next check-in date (original O(n) logic)
      for (const [otherDateStr, otherEntry] of Object.entries(calendarData)) {
        const otherDate = parseISO(otherDateStr)
        if (isAfter(otherDate, date)) {
          const otherReservations = otherEntry?.reservations || []
          const hasCheckIn = otherReservations.some(
            (res) => res.arrivalDate === otherDateStr
          )
          if (hasCheckIn) {
            if (!nextCheckInDate || isBefore(otherDate, nextCheckInDate)) {
              nextCheckInDate = otherDate
            }
          }
        }
      }
    }
    
    if (nextCheckInDate) {
      const daysToNextCheckIn = differenceInDays(nextCheckInDate, date)
      
      // If within minimum stay, only available for checkout
      if (daysToNextCheckIn < minimumStay) {
        // Only restrict if we have a check-in date selected or if it's preventing a new check-in
        // If user has selected a check-in, this date can be used as checkout
        // If no check-in selected, this date cannot be used as check-in (checkout-only)
        return {
          status: "checkout-only",
          isCheckInDate: false,
          isCheckOutDate,
          isWithinStay: false,
          minimumStay,
          price: entry.price || null,
          currency: "USD",
          unavailableReason: `Minimum stay is ${minimumStay} ${minimumStay === 1 ? 'night' : 'nights'}`,
        }
      }
    }
  }
  
  // Rule 6: Default - open (fully available)
  return {
    status: "open",
    isCheckInDate,
    isCheckOutDate,
    isWithinStay: false,
    minimumStay,
    price: entry.price || null,
    currency: "USD",
    unavailableReason: null,
  }
}

/**
 * Calculate statuses for multiple dates efficiently
 * Useful for batch processing when rendering calendar
 */
export function calculateCalendarStatuses(
  dates: Date[],
  calendarData: Record<string, HostawayCalendarEntry>,
  checkInDate: Date | null = null,
  nextCheckInMap?: Record<string, Date | null>
): Record<string, CalendarDateInfo> {
  const statuses: Record<string, CalendarDateInfo> = {}
  
  for (const date of dates) {
    const dateStr = format(date, "yyyy-MM-dd")
    statuses[dateStr] = calculateCalendarStatus(date, calendarData, checkInDate, nextCheckInMap)
  }
  
  return statuses
}
