"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar as CalendarIcon, Loader2, DollarSign, AlertCircle, X, XCircle } from "lucide-react"
import { getListingIdBySlug } from "@/lib/listing-map"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { format, isSameDay, addMonths, startOfMonth, endOfMonth, isBefore, startOfDay, eachDayOfInterval, parseISO } from "date-fns"
import type { DateRange } from "react-day-picker"
import type { HostawayCalendarEntry } from "@/types/hostaway"
import {
  calculateCalendarStatus,
  buildNextCheckInMap,
  findNextAvailableCheckInDate,
  getCalendarDisabledReason,
} from "@/lib/calendar-status"
import { cn } from "@/lib/utils"
import { roundToTwoDecimals } from "@/lib/utils"
import { DayButton } from "react-day-picker"
import { useGuestChat } from "@/components/guest-chat/guest-chat-provider"
import {
  trackBookingCalendarOpened,
  trackNextAvailableViewed,
  trackSelectDates,
  trackStartCheckout,
  trackUnavailableDateTapped,
  trackViewPricing,
} from "@/lib/analytics"
import { useIsMobile } from "@/hooks/use-mobile"
import { OPEN_BOOKING_CALENDAR_EVENT } from "@/lib/booking-events"

interface CabinBookingWidgetProps {
  cabinSlug: string
  className?: string
}

export function CabinBookingWidget({ cabinSlug, className = "" }: CabinBookingWidgetProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isMobile = useIsMobile()
  const { openTextInquiry, textMessagingEnabled, setLauncherSuppressed } = useGuestChat()
  
  // Get listing ID from slug
  const listingId = getListingIdBySlug(cabinSlug)
  
  // Get initial values from URL params if available
  const initialCheckIn = searchParams.get("checkIn") || ""
  const initialCheckOut = searchParams.get("checkOut") || ""
  const initialGuests = searchParams.get("guests") || "2"
  const initialPets = searchParams.get("pets") || "0"
  const initialInfants = searchParams.get("infants") || "0"

  const [checkIn, setCheckIn] = useState(initialCheckIn)
  const [checkOut, setCheckOut] = useState(initialCheckOut)
  const [guests, setGuests] = useState(initialGuests)
  const [pets, setPets] = useState(initialPets)
  const [infants, setInfants] = useState(initialInfants)
  const [isSelectingNewRange, setIsSelectingNewRange] = useState(false) // Track if we're starting a fresh selection
  const [previousSelection, setPreviousSelection] = useState<{checkIn: string, checkOut: string} | null>(null) // Track previous complete selection
  const [isCalendarOpen, setIsCalendarOpen] = useState(false) // Control calendar popover visibility
  const [calendarFeedback, setCalendarFeedback] = useState<string | null>(null)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const parsedInitialCheckIn = initialCheckIn ? parseISO(initialCheckIn) : null
    return parsedInitialCheckIn && !Number.isNaN(parsedInitialCheckIn.getTime())
      ? startOfMonth(parsedInitialCheckIn)
      : startOfMonth(new Date())
  })

  useEffect(() => {
    let openTimer: number | null = null
    const openCalendar = () => {
      document.getElementById("booking-widget")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
      openTimer = window.setTimeout(() => {
        setCalendarFeedback(null)
        setIsCalendarOpen(true)
      }, 250)
    }

    window.addEventListener(OPEN_BOOKING_CALENDAR_EVENT, openCalendar)
    return () => {
      window.removeEventListener(OPEN_BOOKING_CALENDAR_EVENT, openCalendar)
      if (openTimer) window.clearTimeout(openTimer)
    }
  }, [])

  useEffect(() => {
    const suppressionKey = `booking-calendar:${cabinSlug}`
    setLauncherSuppressed(suppressionKey, isCalendarOpen)
    return () => setLauncherSuppressed(suppressionKey, false)
  }, [cabinSlug, isCalendarOpen, setLauncherSuppressed])
  
  // Update previousSelection when we have a complete selection
  useEffect(() => {
    if (checkIn && checkOut && !isSelectingNewRange) {
      setPreviousSelection({checkIn, checkOut})
    } else if (!checkIn || !checkOut) {
      setPreviousSelection(null)
    }
  }, [checkIn, checkOut, isSelectingNewRange])
  
  const [isLoadingPricing, setIsLoadingPricing] = useState(false)
  const [pricing, setPricing] = useState<{
    nightlyRate: number
    nights: number
    subtotal: number
    cleaningFee: number
    tax: number
    channelFee: number
    petFee: number
    total: number
    currency: string
    available: boolean
    discount?: {
      type: "percent" | "fixed"
      value: number
      amount: number
      source?: "referral" | "coupon"
      code?: string
      name?: string
    }
    discounted_subtotal?: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [calendarData, setCalendarData] = useState<Record<string, HostawayCalendarEntry>>({})
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false)

  // Fetch calendar data for availability
  useEffect(() => {
    async function fetchCalendar() {
      if (!listingId) {
        setCalendarData({})
        setIsLoadingCalendar(false)
        return
      }

      setIsLoadingCalendar(true)
      try {
        const response = await fetch(`/api/calendar/${listingId}`)
        if (response.ok) {
          const data = await response.json()
          setCalendarData(data.calendar || {})
        }
      } catch (err) {
        console.error("Error fetching calendar:", err)
      } finally {
        setIsLoadingCalendar(false)
      }
    }
    fetchCalendar()
  }, [listingId])

  const loadPricing = useCallback(async () => {
    if (!listingId) {
      setError("Invalid cabin")
      return
    }

    setIsLoadingPricing(true)
    setError(null)

    try {
      // Calculate number of nights
      // Use parseISO from date-fns to properly parse date strings (handles timezone correctly)
      const start = parseISO(checkIn)
      const end = parseISO(checkOut)
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      
      // Calculate pricing from calendar data (preferred method)
      // Sum prices from each calendar date in the range
      let subtotalFromCalendar: number | null = null
      let currencyFromCalendar: string = "USD"
      
      if (calendarData && Object.keys(calendarData).length > 0) {
        try {
          // Get all dates in the range (check-in to check-out, excluding check-out day)
          // eachDayOfInterval includes both start and end, so we need to exclude the end date
          const checkOutDate = parseISO(checkOut)
          checkOutDate.setDate(checkOutDate.getDate() - 1) // Day before check-out
          const dateRange = eachDayOfInterval({
            start: parseISO(checkIn),
            end: checkOutDate
          })
          
          let totalPrice = 0
          let datesWithPrice = 0
          
          for (const date of dateRange) {
            const dateStr = format(date, "yyyy-MM-dd")
            const entry = calendarData[dateStr]
            
            if (entry && entry.price !== null && entry.price !== undefined) {
              totalPrice += entry.price
              datesWithPrice++
              // Get currency from first entry (assuming all dates use same currency)
              if (datesWithPrice === 1) {
                currencyFromCalendar = "USD" // Default, could be extracted from entry if available
              }
            }
          }
          
          // If we have prices for all dates, use calendar-based pricing
          if (datesWithPrice === dateRange.length && totalPrice > 0) {
            subtotalFromCalendar = totalPrice
          }
        } catch (calendarPricingError) {
          console.warn("Error calculating pricing from calendar:", calendarPricingError)
          // Continue to API pricing fallback
        }
      }
      
      // Always call pricing API to get discount if referral cookie is present
      // The API will apply discounts and return the correct pricing
      // Calendar pricing is only used as a fallback if API fails
      const requestBody = {
        listingId,
        startDate: checkIn,
        endDate: checkOut,
        guests: parseInt(guests, 10),
      }
      const response = await fetch("/api/pricing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        // If pricing API fails, get listing data to use base price
        try {
          const listingResponse = await fetch(`/api/listing/${listingId}`)
          
          if (listingResponse.ok) {
            const listingData = await listingResponse.json()
            const basePrice = listingData.basePrice || 200
            const currency = listingData.currency || "USD"
            
            // Check availability first
            const availabilityResponse = await fetch("/api/availability", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                slug: cabinSlug,
                startDate: checkIn,
                endDate: checkOut,
                guests: parseInt(guests, 10),
              }),
            })

            if (availabilityResponse.ok) {
              const data = await availabilityResponse.json()
              const cabin = data.cabins?.[0]

              if (cabin && cabin.available) {
                // Calculate pricing using base price
                const subtotal = roundToTwoDecimals(basePrice * nights)
                const cleaningFee = 100
                const tax = roundToTwoDecimals(subtotal * 0.12) // ~12% tax
                const channelFee = roundToTwoDecimals(subtotal * 0.02) // ~2% channel fee
                const total = roundToTwoDecimals(subtotal + cleaningFee + tax + channelFee)

                const pricingData = {
                  nightlyRate: roundToTwoDecimals(basePrice),
                  nights,
                  subtotal,
                  cleaningFee,
                  tax,
                  channelFee,
                  petFee: 0,
                  total,
                  currency,
                  available: true,
                }
                setPricing(pricingData)
                // Track pricing view
                trackViewPricing(cabinSlug, nights)
                return
              }
            }
          }

          throw new Error("Failed to load pricing")
        } catch (fallbackError: any) {
          console.error("Fallback pricing failed:", fallbackError)
          throw new Error("Failed to load pricing")
        }
      }

      const pricingData = await response.json()
      
      // If API returns available:false with invalid breakdown (zero values), use calendar pricing with discount
      const hasValidBreakdown = pricingData.breakdown && pricingData.breakdown.subtotal > 0 && pricingData.breakdown.nightlyRate > 0
      
      // If API returns available:false without valid breakdown, use calendar pricing with discount
      if (!pricingData.available && !hasValidBreakdown && subtotalFromCalendar !== null && subtotalFromCalendar > 0) {
        // Use calendar pricing but still apply discount via API call
        const discountResponse = await fetch("/api/pricing/discount", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subtotal: subtotalFromCalendar,
          }),
        })
        
        let discount = null
        if (discountResponse.ok) {
          const discountData = await discountResponse.json()
          discount = discountData.discount || null
        }
        
        const subtotalToUse = discount ? discount.discounted_subtotal : subtotalFromCalendar
        const cleaningFee = 100
        const tax = roundToTwoDecimals(subtotalToUse * 0.12)
        const channelFee = roundToTwoDecimals(subtotalToUse * 0.02)
        const petFee = roundToTwoDecimals(parseInt(pets, 10) > 0 ? 50 : 0)
        const total = roundToTwoDecimals(subtotalToUse + cleaningFee + tax + channelFee + petFee)
        const nightlyRate = nights > 0 ? roundToTwoDecimals(subtotalFromCalendar / nights) : 0
        
        const pricingData = {
          nightlyRate,
          nights,
          subtotal: roundToTwoDecimals(subtotalFromCalendar),
          cleaningFee,
          tax,
          channelFee,
          petFee,
          total,
          currency: currencyFromCalendar,
          available: true,
          discount: discount ? {
            type: discount.discount_type,
            value: discount.discount_value,
            amount: discount.discount_amount,
            source: discount.source,
            code: discount.code,
            name: discount.name,
          } : undefined,
          discounted_subtotal: discount ? discount.discounted_subtotal : undefined,
        }
        setPricing(pricingData)
        trackViewPricing(cabinSlug, nights)
        setIsLoadingPricing(false)
        return
      }
      
      // If API returns available:false without breakdown, use fallback pricing
      if (!pricingData.available && !pricingData.breakdown) {
        try {
          const listingResponse = await fetch(`/api/listing/${listingId}`)
          
          if (listingResponse.ok) {
            const listingData = await listingResponse.json()
            const basePrice = listingData.basePrice || 200
            const currency = listingData.currency || "USD"
            
            // Check availability
            const availabilityResponse = await fetch("/api/availability", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                slug: cabinSlug,
                startDate: checkIn,
                endDate: checkOut,
                guests: parseInt(guests, 10),
              }),
            })

            if (availabilityResponse.ok) {
              const data = await availabilityResponse.json()
              const cabin = data.cabins?.[0]

              if (cabin && cabin.available) {
                // Calculate pricing using base price
                const subtotal = roundToTwoDecimals(basePrice * nights)
                const cleaningFee = 100
                const tax = roundToTwoDecimals(subtotal * 0.12)
                const channelFee = roundToTwoDecimals(subtotal * 0.02)
                const petFee = roundToTwoDecimals(parseInt(pets, 10) > 0 ? 50 : 0) // $50 flat fee
                const total = roundToTwoDecimals(subtotal + cleaningFee + tax + channelFee + petFee)

                const pricingData = {
                  nightlyRate: roundToTwoDecimals(basePrice),
                  nights,
                  subtotal,
                  cleaningFee,
                  tax,
                  channelFee,
                  petFee,
                  total,
                  currency,
                  available: true,
                }
                setPricing(pricingData)
                trackViewPricing(cabinSlug, nights)
                return
              }
            }
          }
        } catch (fallbackError: any) {
          console.error("Fallback pricing failed:", fallbackError)
        }
        // If fallback didn't set pricing, use hardcoded base price as last resort
        const basePrice = 200
        const subtotal = roundToTwoDecimals(basePrice * nights)
        const cleaningFee = 100
        const tax = roundToTwoDecimals(subtotal * 0.12)
        const channelFee = roundToTwoDecimals(subtotal * 0.02)
        const petFee = roundToTwoDecimals(parseInt(pets, 10) > 0 ? 50 : 0) // $50 flat fee
        const total = roundToTwoDecimals(subtotal + cleaningFee + tax + channelFee + petFee)
        const pricingData = {
          nightlyRate: roundToTwoDecimals(basePrice),
          nights,
          subtotal,
          cleaningFee,
          tax,
          channelFee,
          petFee,
          total,
          currency: "USD",
          available: true,
        }
        setPricing(pricingData)
        trackViewPricing(cabinSlug, nights)
        return
      }
      
      // Use API breakdown if it's valid (has non-zero values), otherwise fall back to calendar pricing
      if (hasValidBreakdown && pricingData.breakdown) {
        const breakdown = pricingData.breakdown
        // Use fees and taxes from API if provided, otherwise calculate
        const cleaningFee = breakdown.fees || 100
        
        // Use discounted subtotal if discount was applied, otherwise use regular subtotal
        const subtotalToUse = breakdown.discounted_subtotal ?? breakdown.subtotal
        const tax = breakdown.taxes ? roundToTwoDecimals(breakdown.taxes) : roundToTwoDecimals(subtotalToUse * 0.12)
        // Use channelFee from API if provided (may be recalculated for discount), otherwise calculate
        const channelFee = breakdown.channelFee ? roundToTwoDecimals(breakdown.channelFee) : roundToTwoDecimals(subtotalToUse * 0.02)
        const petFee = roundToTwoDecimals(parseInt(pets, 10) > 0 ? 50 : 0) // $50 flat fee
        
        // If API provides total, use it; otherwise calculate
        const calculatedTotal = roundToTwoDecimals(subtotalToUse + cleaningFee + tax + channelFee + petFee)
        const total = breakdown.total ? roundToTwoDecimals(breakdown.total + petFee) : calculatedTotal

        const finalPricingData = {
          nightlyRate: breakdown.nightlyRate ? roundToTwoDecimals(breakdown.nightlyRate) : (breakdown.nights > 0 ? roundToTwoDecimals((breakdown.discounted_subtotal ?? breakdown.subtotal) / breakdown.nights) : 0),
          nights: breakdown.nights || nights,
          subtotal: roundToTwoDecimals(breakdown.subtotal),
          cleaningFee,
          tax,
          channelFee,
          petFee,
          total,
          currency: breakdown.currency || "USD",
          available: true,
          discount: breakdown.discount,
          discounted_subtotal: breakdown.discounted_subtotal,
        }
        setPricing(finalPricingData)
        trackViewPricing(cabinSlug, finalPricingData.nights)
      } else if (pricingData.available) {
        // API says available but no breakdown - use fallback calculation
        // This shouldn't happen, but handle gracefully
        const basePrice = 200 // Fallback
        const subtotal = roundToTwoDecimals(basePrice * nights)
        const cleaningFee = 100
        const tax = roundToTwoDecimals(subtotal * 0.12)
        const channelFee = roundToTwoDecimals(subtotal * 0.02)
        const petFee = roundToTwoDecimals(parseInt(pets, 10) > 0 ? 50 : 0) // $50 flat fee
        const total = roundToTwoDecimals(subtotal + cleaningFee + tax + channelFee + petFee)

        const pricingData = {
          nightlyRate: roundToTwoDecimals(basePrice),
          nights,
          subtotal,
          cleaningFee,
          tax,
          channelFee,
          petFee,
          total,
          currency: "USD",
          available: true,
        }
        setPricing(pricingData)
        trackViewPricing(cabinSlug, nights)
      } else {
        // available: false - use hardcoded base price as last resort
        const basePrice = 200
        const subtotal = roundToTwoDecimals(basePrice * nights)
        const cleaningFee = 100
        const tax = roundToTwoDecimals(subtotal * 0.12)
        const channelFee = roundToTwoDecimals(subtotal * 0.02)
        const petFee = roundToTwoDecimals(parseInt(pets, 10) > 0 ? 50 : 0) // $50 flat fee
        const total = roundToTwoDecimals(subtotal + cleaningFee + tax + channelFee + petFee)
        const pricingData = {
          nightlyRate: roundToTwoDecimals(basePrice),
          nights,
          subtotal,
          cleaningFee,
          tax,
          channelFee,
          petFee,
          total,
          currency: "USD",
          available: true,
        }
        setPricing(pricingData)
        trackViewPricing(cabinSlug, nights)
      }
    } catch (err: any) {
      console.error("Error loading pricing:", err)
      setError(err.message || "Failed to load pricing")
      setPricing(null)
    } finally {
      setIsLoadingPricing(false)
    }
  }, [calendarData, cabinSlug, checkIn, checkOut, guests, listingId, pets])

  // Load pricing when dates change or calendar data is available
  useEffect(() => {
    if (checkIn && checkOut && checkIn < checkOut) {
      loadPricing()
      // Track date selection
      trackSelectDates(cabinSlug, checkIn)
    } else {
      setPricing(null)
    }
  }, [checkIn, checkOut, guests, pets, listingId, calendarData, cabinSlug, loadPricing])

  const handleBookNow = () => {
    if (!checkIn || !checkOut) {
      setError("Please select check-in and check-out dates")
      return
    }

    if (!pricing || !pricing.available || pricing.total === 0) {
      setError("This cabin is not available for the selected dates")
      return
    }

    // Store pricing in sessionStorage to ensure exact same price on booking page
    const pricingKey = `pricing_${cabinSlug}_${checkIn}_${checkOut}_${guests}_${pets}_${infants}`
    try {
      sessionStorage.setItem(pricingKey, JSON.stringify({
        ...pricing,
        checkIn,
        checkOut,
        guests,
        pets,
        infants,
        timestamp: Date.now()
      }))
    } catch (e) {
      console.warn("Failed to store pricing in sessionStorage:", e)
    }

    // Track checkout start
    trackStartCheckout(cabinSlug, pricing.total)

    // Navigate to booking page with pre-filled data
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests,
      ...(pets !== "0" && { pets }),
      ...(infants !== "0" && { infants }),
    })
    router.push(`/booking/${cabinSlug}?${params.toString()}`)
  }

  const handleSendInquiry = () => {
    if (checkIn && checkOut) {
      const cabinName = cabinSlug
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")

      openTextInquiry({
        initialIntent: "availability",
        context: {
          listingSlug: cabinSlug,
          cabinName,
          checkIn,
          checkOut,
          guests: parseInt(guests, 10) || 2,
          pets: pets !== "0" ? parseInt(pets, 10) : 0,
          infants: infants !== "0" ? parseInt(infants, 10) : 0,
          sourcePath: `/stay/${cabinSlug}`,
          sourceType: "stay_page",
        },
      })
    }
  }

  // Pre-compute next check-in map once (O(n) operation, done once per calendarData change)
  const nextCheckInMap = useMemo(() => {
    if (Object.keys(calendarData).length === 0) return {}
    return buildNextCheckInMap(calendarData)
  }, [calendarData])

  // Memoize status calculations for visible dates only
  const dateStatuses = useMemo(() => {
    const statuses: Record<string, ReturnType<typeof calculateCalendarStatus>> = {}
    // When checkOut is set, we're in "new check-in selection" mode
    // So calculate statuses as if no check-in is selected (checkout-only dates should be blocked)
    const checkInDate = (checkIn && !checkOut) ? parseISO(checkIn) : null
    
    // Calculate visible date range: 2 months before today to 4 months ahead (covers 2-month calendar view)
    const today = new Date()
    const visibleStart = startOfMonth(addMonths(today, -1))
    let visibleEnd = endOfMonth(addMonths(today, 3)) // 4 months ahead (0-indexed)
    
    // If check-in is selected, extend range to next check-in date + buffer (30 days)
    if (checkInDate) {
      // Find next check-in date after selected check-in
      let nextCheckIn: Date | null = null
      const checkInDateStr = format(checkInDate, "yyyy-MM-dd")
      
      // Use pre-computed map if available
      if (nextCheckInMap[checkInDateStr]) {
        nextCheckIn = nextCheckInMap[checkInDateStr]
      } else {
        // Fallback: search for next check-in
        for (const dateStr of Object.keys(calendarData)) {
          try {
            const date = new Date(dateStr + 'T00:00:00')
            if (date > checkInDate) {
              const entry = calendarData[dateStr]
              const hasCheckIn = entry?.reservations?.some(
                (res) => res.arrivalDate === dateStr
              )
              if (hasCheckIn) {
                if (!nextCheckIn || date < nextCheckIn) {
                  nextCheckIn = date
                }
              }
            }
          } catch (e) {
            // Skip invalid dates
          }
        }
      }
      
      // Extend calculation range to next check-in + 30 day buffer
      if (nextCheckIn) {
        const bufferDate = new Date(nextCheckIn)
        bufferDate.setDate(bufferDate.getDate() + 30)
        if (bufferDate > visibleEnd) {
          visibleEnd = bufferDate
        }
      }
    }
    
    // Calculate status only for dates in visible range
    for (const dateStr of Object.keys(calendarData)) {
      try {
        const date = new Date(dateStr + 'T00:00:00')
        // Skip dates outside visible range
        if (date < visibleStart || date > visibleEnd) {
          continue
        }
        statuses[dateStr] = calculateCalendarStatus(date, calendarData, checkInDate, nextCheckInMap)
      } catch (e) {
        // Skip invalid dates
      }
    }
    
    return statuses
  }, [calendarData, checkIn, checkOut, nextCheckInMap])

  const getDateInfo = useCallback((date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    const cachedDateInfo = dateStatuses[dateStr]
    if (cachedDateInfo) return cachedDateInfo

    const checkInDate = checkIn && !checkOut ? parseISO(checkIn) : null
    return calculateCalendarStatus(date, calendarData, checkInDate, nextCheckInMap)
  }, [calendarData, checkIn, checkOut, dateStatuses, nextCheckInMap])

  const getDisabledReason = useCallback((date: Date) => {
    const checkInDate = checkIn ? parseISO(checkIn) : null
    const checkOutDate = checkOut ? parseISO(checkOut) : null
    return getCalendarDisabledReason(date, getDateInfo(date), {
      checkInDate,
      checkOutDate,
      nextCheckInMap,
    })
  }, [checkIn, checkOut, getDateInfo, nextCheckInMap])

  // Custom DayButton component with three-state rendering. Unavailable days
  // keep their visual treatment, but a transparent touch target now explains
  // why the date cannot be selected instead of producing a dead click.
  const CustomDayButton = useCallback((props: React.ComponentProps<typeof DayButton>) => {
    const { day, modifiers, className, ...restProps } = props
    
    // Extract the actual date from day object (react-day-picker uses day.date)
    const date = (day as any)?.date || day
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      // Fallback to default button if date is invalid
      return <CalendarDayButton {...props} />
    }
    
    const dateInfo = getDateInfo(date)
    const disabledReason = getDisabledReason(date)

    // Check if date is in the past
    const today = startOfDay(new Date())
    const dateToCheck = startOfDay(date)
    const isPastDate = isBefore(dateToCheck, today)
    
    const isMinStayBlocked = !!checkIn && !checkOut && !!dateInfo?.violatesSelectedMinimumStay
    // Determine if date is booked (solid-block) vs ineligible due to check-in/checkout rules
    const isBooked = dateInfo?.status === "solid-block"
    const isIneligible = (dateInfo?.status === "checkout-only" && !checkIn) || isMinStayBlocked
    // Determine additional styling based on status
    // Booked dates: grayed out with lower opacity
    // Ineligible dates: grayed out but slightly higher opacity
    const statusClassNames = {
      "solid-block": "bg-muted/50 text-muted-foreground opacity-50 relative",
      "checkout-only": checkIn 
        ? "opacity-75" 
        : "bg-muted/30 text-muted-foreground opacity-60",
      "open": "",
    }
    
    const statusClassName = isMinStayBlocked
      ? "bg-muted/30 text-muted-foreground opacity-60"
      : dateInfo?.status
      ? statusClassNames[dateInfo.status]
      : ""

    // Create the button with overlay for booked dates
    // Note: CalendarDayButton doesn't accept children, so we wrap it for the X icon overlay
    const buttonElement = (
      <CalendarDayButton
        {...restProps}
        day={day}
        modifiers={modifiers}
        className={cn(
          statusClassName,
          // Add data attributes for potential CSS styling
          dateInfo?.status === "solid-block" && "data-solid-block data-booked",
          dateInfo?.status === "checkout-only" && "data-checkout-only",
          isMinStayBlocked && "data-minimum-stay-blocked",
          isIneligible && "data-ineligible",
          dateInfo?.status === "open" && "data-open",
          className
        )}
        data-status={dateInfo?.status || "open"}
      />
    )

    const shouldShowXIcon = isBooked || isPastDate

    if (disabledReason) {
      return (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <span className="relative inline-flex h-full w-full">
              {buttonElement}
              {shouldShowXIcon && (
                <X
                  className="pointer-events-none absolute inset-0 z-10 m-auto h-4 w-4 text-muted-foreground opacity-70"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              )}
              <button
                type="button"
                tabIndex={-1}
                className="absolute inset-0 z-20 rounded-md"
                aria-label={`${format(date, "MMMM d")}: ${disabledReason}`}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  setCalendarFeedback(disabledReason)
                  trackUnavailableDateTapped(cabinSlug, disabledReason)
                }}
              />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={5} className="z-[100]">
            <p>{disabledReason}</p>
          </TooltipContent>
        </Tooltip>
      )
    }
    
    return buttonElement
  }, [cabinSlug, checkIn, checkOut, getDateInfo, getDisabledReason])

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0]
  
  // Calculate fromDate for calendar (prevent past dates)
  const calendarFromDate = useMemo(() => {
    return startOfDay(new Date())
  }, [])

  const nextAvailableCheckIn = useMemo(
    () => findNextAvailableCheckInDate(calendarData, calendarFromDate),
    [calendarData, calendarFromDate]
  )

  const calendarInstruction = calendarFeedback
    ? calendarFeedback
    : checkIn && !checkOut
    ? `Now choose a checkout date after ${format(parseISO(checkIn), "MMM d")}.`
    : "Choose an available check-in date, then choose your checkout date."

  const hasSelectedDates = Boolean(checkIn && checkOut)
  const priceHintTitle = !hasSelectedDates
    ? "Select dates to see the total price"
    : isLoadingPricing
    ? "Calculating the price for these dates"
    : pricing?.available && pricing.total > 0
    ? "Total price is shown below"
    : "Dates selected"
  const priceHintDescription = !hasSelectedDates
    ? "Choose check-in and check-out dates and this box will show the nightly rate, fees, taxes, and total."
    : "Nightly rate, fees, taxes, and total update automatically for your selected stay."

  if (!listingId) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-destructive">Invalid cabin</div>
      </Card>
    )
  }

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-2xl font-semibold mb-6">Book Your Stay</h3>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Dates
          </label>
          <Popover
            open={isCalendarOpen}
            onOpenChange={(open) => {
              setIsCalendarOpen(open)
              if (open) {
                setCalendarFeedback(null)
                trackBookingCalendarOpened("booking_widget")
              }
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn && checkOut ? (
                  <>
                    {format(parseISO(checkIn), "MMM d")} - {format(parseISO(checkOut), "MMM d, yyyy")}
                  </>
                ) : (
                  "Select dates"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="max-h-[min(80vh,42rem)] w-auto overflow-y-auto p-0"
              align="start"
              side="bottom"
            >
              <Calendar
                mode="range"
                fromDate={calendarFromDate} // Prevent navigation to past months and block dates before today
                month={calendarMonth}
                onMonthChange={setCalendarMonth}
                selected={
                  checkIn && checkOut
                    ? {
                        from: parseISO(checkIn),
                        to: parseISO(checkOut),
                      }
                    : checkIn
                    ? {
                        from: parseISO(checkIn),
                      }
                    : undefined
                }
                onSelect={(range) => {
                  setCalendarFeedback(null)
                  if (!range?.from) {
                    // Selection cleared
                    setCheckIn("")
                    setCheckOut("")
                    setIsSelectingNewRange(false)
                    return
                  }
                  
                  // Check if this is a single-date click (same date for from and to, or no to)
                  // Use isSameDay from date-fns to properly compare dates
                  const isSingleDateClick = !range.to || isSameDay(range.from, range.to)
                  
                  // CRITICAL: If we have a complete selection (both checkIn and checkOut set),
                  // and user clicks ANY new date, completely clear and start fresh
                  if (checkIn && checkOut && !isSelectingNewRange && previousSelection) {
                    // When react-day-picker has a range selected and you click a new date,
                    // it modifies the range. We need to detect which date was actually clicked.
                    // Compare the new range with the previous selection to determine the clicked date.
                    // Use format() to avoid timezone issues
                    const newFromStr = format(range.from, "yyyy-MM-dd")
                    const newToStr = range.to ? format(range.to, "yyyy-MM-dd") : ''
                    
                    // Determine which date was clicked by comparing with previous selection
                    let clickedDateStr: string
                    if (newFromStr !== previousSelection.checkIn) {
                      // range.from changed - user clicked before the old check-in
                      clickedDateStr = newFromStr
                    } else if (newToStr && newToStr !== previousSelection.checkOut) {
                      // range.to changed - user clicked after the old check-out
                      clickedDateStr = newToStr
                    } else {
                      // Fallback: use range.from (shouldn't happen, but just in case)
                      clickedDateStr = newFromStr
                    }
                    
                    // ALWAYS clear the old selection completely and start fresh with ONLY the clicked date as checkIn
                    // Don't set checkOut even if range.to exists - let the user click again to set checkOut
                    setCheckOut("")
                    setCheckIn(clickedDateStr)
                    setIsSelectingNewRange(true) // Mark that we're in a new selection
                    // Keep calendar open so user can select check-out date
                    return
                  }
                  
                  // Convert range dates to local date strings using date-fns format to avoid timezone issues
                  // Use format() which properly handles local timezone dates
                  const newCheckInStr = format(range.from, "yyyy-MM-dd")
                  
                  // Normal selection flow (no complete selection exists, or we're in the middle of selecting)
                  if (isSingleDateClick) {
                    // User clicked a single date (start of new selection or extending current)
                    setCheckIn(newCheckInStr)
                    if (!checkIn || isSelectingNewRange) {
                      // Starting fresh or continuing new selection - clear checkOut
                      setCheckOut("")
                    }
                    setIsSelectingNewRange(true)
                  } else if (range.to) {
                    // Complete range selected
                    const newCheckOutStr = format(range.to, "yyyy-MM-dd")
                    setCheckIn(newCheckInStr)
                    setCheckOut(newCheckOutStr)
                    setIsSelectingNewRange(false) // Selection complete
                    setIsCalendarOpen(false) // Close the calendar popover
                  }
                }}
                disabled={(date) => {
                  if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) {
                    return true
                  }
                  return Boolean(getDisabledReason(date))
                }}
                components={{
                  DayButton: CustomDayButton,
                }}
                numberOfMonths={isMobile ? 1 : 2}
                initialFocus
              />
              <div className="space-y-2 border-t px-3 py-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-primary" aria-hidden="true" />
                    Available
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-muted ring-1 ring-border" aria-hidden="true" />
                    Booked
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-muted/40 ring-1 ring-border" aria-hidden="true" />
                    Checkout only
                  </span>
                </div>
                <p
                  role="status"
                  aria-live="polite"
                  className={cn(
                    "text-xs leading-relaxed",
                    calendarFeedback ? "font-medium text-foreground" : "text-muted-foreground"
                  )}
                >
                  {isLoadingCalendar ? "Loading live availability…" : calendarInstruction}
                </p>
                {!checkIn && nextAvailableCheckIn && !isLoadingCalendar && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto px-0 py-1 text-xs text-primary hover:bg-transparent hover:text-primary/80"
                    onClick={() => {
                      setCalendarMonth(startOfMonth(nextAvailableCheckIn))
                      setCalendarFeedback(
                        `The next available check-in is ${format(nextAvailableCheckIn, "MMM d")}.`
                      )
                      trackNextAvailableViewed(cabinSlug)
                    }}
                  >
                    Next available check-in: {format(nextAvailableCheckIn, "MMM d")}
                  </Button>
                )}
              </div>
              {(checkIn || checkOut) && (
                <div className="border-t p-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCheckIn("")
                      setCheckOut("")
                      setIsSelectingNewRange(false)
                      setPreviousSelection(null)
                      setPricing(null)
                      setError(null)
                    }}
                    className="w-full text-xs text-muted-foreground hover:text-foreground"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Clear dates
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <div className="mt-3 flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm">
            {isLoadingPricing ? (
              <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden="true" />
            ) : (
              <DollarSign className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            )}
            <div className="space-y-0.5">
              <p className="font-medium leading-none">{priceHintTitle}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{priceHintDescription}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="cabin-guests" className="block text-sm font-medium mb-2">
              Guests
            </label>
            <select
              id="cabin-guests"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full px-4 py-3.5 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none text-base"
            >
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
            </select>
          </div>

          <div>
            <label htmlFor="cabin-pets" className="block text-sm font-medium mb-2">
              Pets
            </label>
            <select
              id="cabin-pets"
              value={pets}
              onChange={(e) => setPets(e.target.value)}
              className="w-full px-4 py-3.5 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none text-base"
            >
              <option value="0">No Pets</option>
              <option value="1">1 Pet</option>
              <option value="2">2 Pets</option>
              <option value="3">3 Pets</option>
            </select>
          </div>

          <div>
            <label htmlFor="cabin-infants" className="block text-sm font-medium mb-2">
              Infants
            </label>
            <select
              id="cabin-infants"
              value={infants}
              onChange={(e) => setInfants(e.target.value)}
              className="w-full px-4 py-3.5 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none text-base"
            >
              <option value="0">No Infants</option>
              <option value="1">1 Infant</option>
              <option value="2">2 Infants</option>
            </select>
          </div>
        </div>

        {pricing && pricing.nightlyRate > 0 && (
          <div className="p-5 bg-muted/50 rounded-lg border border-border space-y-4">
            {/* Nightly Rate */}
            <div className="pb-3 border-b border-border">
              <div className="text-3xl font-bold text-primary">
                {pricing.currency === "USD" ? "$" : pricing.currency}
                {pricing.nightlyRate.toFixed(2)} <span className="text-lg font-normal text-foreground">/ Night</span>
              </div>
            </div>

            {/* Price Breakdown */}
            {pricing.available && pricing.nights > 0 && pricing.total > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {pricing.currency === "USD" ? "$" : pricing.currency}
                    {pricing.nightlyRate.toFixed(2)} × {pricing.nights} {pricing.nights === 1 ? "night" : "nights"}
                  </span>
                  <span className="font-medium">
                    {pricing.currency === "USD" ? "$" : pricing.currency}
                    {pricing.subtotal.toFixed(2)}
                  </span>
                </div>

                {pricing.discount && pricing.discount.amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="text-muted-foreground">
                      Discount {pricing.discount.type === "percent" ? `(${pricing.discount.value}%)` : ""}
                    </span>
                    <span className="font-medium">
                      -{pricing.currency === "USD" ? "$" : pricing.currency}
                      {pricing.discount.amount.toFixed(2)}
                    </span>
                  </div>
                )}

                {pricing.discounted_subtotal && pricing.discounted_subtotal !== pricing.subtotal && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal (after discount)</span>
                    <span className="font-medium">
                      {pricing.currency === "USD" ? "$" : pricing.currency}
                      {pricing.discounted_subtotal.toFixed(2)}
                    </span>
                  </div>
                )}

                {pricing.cleaningFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cleaning Fee</span>
                    <span className="font-medium">
                      {pricing.currency === "USD" ? "$" : pricing.currency}
                      {pricing.cleaningFee.toFixed(2)}
                    </span>
                  </div>
                )}

                {pricing.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lodging Tax</span>
                    <span className="font-medium">
                      {pricing.currency === "USD" ? "$" : pricing.currency}
                      {pricing.tax.toFixed(2)}
                    </span>
                  </div>
                )}

                {pricing.channelFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Guest Channel Fee</span>
                    <span className="font-medium">
                      {pricing.currency === "USD" ? "$" : pricing.currency}
                      {pricing.channelFee.toFixed(2)}
                    </span>
                  </div>
                )}

                {parseInt(pets, 10) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pet Fee</span>
                    <span className="font-medium">
                      {pricing.currency === "USD" ? "$" : pricing.currency}
                      {(pricing.petFee || 0).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {pricing.currency === "USD" ? "$" : pricing.currency}
                      {pricing.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {!pricing.available && (
              <div className="text-sm font-medium text-destructive text-center py-2">
                Not Available
              </div>
            )}
          </div>
        )}

        {isLoadingPricing && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading pricing...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2">
          {textMessagingEnabled && (
            <Button
              type="button"
              onClick={handleSendInquiry}
              disabled={!checkIn || !checkOut}
              size="lg"
              className="w-full rounded-full"
              variant="outline"
              title={!checkIn || !checkOut ? "Please select check-in and check-out dates" : ""}
            >
              Text with us
            </Button>
          )}

          <Button
            type="button"
            onClick={handleBookNow}
            disabled={!pricing?.available || isLoadingPricing || !pricing || pricing.total === 0}
            size="lg"
            className="w-full rounded-full"
          >
            Book Now
          </Button>
        </div>
      </div>
    </Card>
  )
}
