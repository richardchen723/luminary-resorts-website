"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar as CalendarIcon, Users, Loader2, DollarSign, AlertCircle, X, XCircle } from "lucide-react"
import { getListingIdBySlug } from "@/lib/listing-map"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isSameDay, addMonths, startOfMonth, endOfMonth, isBefore, startOfDay, eachDayOfInterval, parseISO } from "date-fns"
import type { DateRange } from "react-day-picker"
import type { HostawayCalendarEntry } from "@/types/hostaway"
import { calculateCalendarStatus, buildNextCheckInMap } from "@/lib/calendar-status"
import { cn } from "@/lib/utils"
import { roundToTwoDecimals } from "@/lib/utils"
import { DayButton } from "react-day-picker"
import { InquiryModal } from "@/components/inquiry-modal"

interface CabinBookingWidgetProps {
  cabinSlug: string
  className?: string
}

export function CabinBookingWidget({ cabinSlug, className = "" }: CabinBookingWidgetProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Get listing ID from slug
  const listingId = getListingIdBySlug(cabinSlug)
  if (!listingId) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-destructive">Invalid cabin</div>
      </Card>
    )
  }
  
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
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [calendarData, setCalendarData] = useState<Record<string, HostawayCalendarEntry>>({})
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false)
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false)
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false)
  const [inquiryError, setInquiryError] = useState<string | null>(null)

  // Fetch calendar data for availability
  useEffect(() => {
    async function fetchCalendar() {
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

  // Load pricing when dates change or calendar data is available
  useEffect(() => {
    if (checkIn && checkOut && checkIn < checkOut) {
      loadPricing()
    } else {
      setPricing(null)
    }
  }, [checkIn, checkOut, guests, pets, listingId, calendarData])

  const loadPricing = async () => {
    if (!listingId) {
      setError("Invalid cabin")
      return
    }

    setIsLoadingPricing(true)
    setError(null)

    try {
      // Calculate number of nights
      const start = new Date(checkIn)
      const end = new Date(checkOut)
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
      
      // If we successfully calculated from calendar, use it
      if (subtotalFromCalendar !== null && subtotalFromCalendar > 0) {
        const cleaningFee = 100
        const tax = roundToTwoDecimals(subtotalFromCalendar * 0.12)
        const channelFee = roundToTwoDecimals(subtotalFromCalendar * 0.02)
        const petFee = roundToTwoDecimals(parseInt(pets, 10) > 0 ? 50 : 0) // $50 flat fee
        const total = roundToTwoDecimals(subtotalFromCalendar + cleaningFee + tax + channelFee + petFee)
        const nightlyRate = nights > 0 ? roundToTwoDecimals(subtotalFromCalendar / nights) : 0
        
        setPricing({
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
        })
        setIsLoadingPricing(false)
        return
      }

      // Call pricing API directly
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

                setPricing({
                  nightlyRate: roundToTwoDecimals(basePrice),
                  nights,
                  subtotal,
                  cleaningFee,
                  tax,
                  channelFee,
                  total,
                  currency,
                  available: true,
                })
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

                setPricing({
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
                })
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
        setPricing({
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
        })
        return
      }
      
      if (pricingData.available && pricingData.breakdown) {
        const breakdown = pricingData.breakdown
        // Use fees and taxes from API if provided, otherwise calculate
        const cleaningFee = breakdown.fees || 100
        const tax = breakdown.taxes ? roundToTwoDecimals(breakdown.taxes) : roundToTwoDecimals(breakdown.subtotal * 0.12)
        const channelFee = roundToTwoDecimals(breakdown.subtotal * 0.02)
        const petFee = roundToTwoDecimals(parseInt(pets, 10) > 0 ? 50 : 0) // $50 flat fee
        
        // If API provides total, use it; otherwise calculate
        const calculatedTotal = roundToTwoDecimals(breakdown.subtotal + cleaningFee + tax + channelFee + petFee)
        const total = breakdown.total ? roundToTwoDecimals(breakdown.total + petFee) : calculatedTotal

        setPricing({
          nightlyRate: breakdown.nightlyRate ? roundToTwoDecimals(breakdown.nightlyRate) : (breakdown.nights > 0 ? roundToTwoDecimals(breakdown.subtotal / breakdown.nights) : 0),
          nights: breakdown.nights || nights,
          subtotal: roundToTwoDecimals(breakdown.subtotal),
          cleaningFee,
          tax,
          channelFee,
          petFee,
          total,
          currency: breakdown.currency || "USD",
          available: true,
        })
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

        setPricing({
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
        })
      } else {
        // available: false - use hardcoded base price as last resort
        const basePrice = 200
        const subtotal = roundToTwoDecimals(basePrice * nights)
        const cleaningFee = 100
        const tax = roundToTwoDecimals(subtotal * 0.12)
        const channelFee = roundToTwoDecimals(subtotal * 0.02)
        const petFee = roundToTwoDecimals(parseInt(pets, 10) > 0 ? 50 : 0) // $50 flat fee
        const total = roundToTwoDecimals(subtotal + cleaningFee + tax + channelFee + petFee)
        setPricing({
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
        })
      }
    } catch (err: any) {
      console.error("Error loading pricing:", err)
      setError(err.message || "Failed to load pricing")
      setPricing(null)
    } finally {
      setIsLoadingPricing(false)
    }
  }

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
    // Open inquiry modal instead of navigating to contact page
    if (checkIn && checkOut) {
      setIsInquiryModalOpen(true)
      setInquiryError(null)
    }
  }

  const handleInquirySubmit = async (data: {
    firstName: string
    lastName: string
    email: string
    phone: string
    countryCode: string
    message: string
  }) => {
    setIsSubmittingInquiry(true)
    setInquiryError(null)

    try {
      if (!checkIn || !checkOut) {
        throw new Error("Check-in and check-out dates are required")
      }

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'components/cabin-booking-widget.tsx:482',message:'Widget - message in API request body',data:{message:data.message,messageLength:data.message?.length||0,messageType:typeof data.message,hasMessage:!!data.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      const response = await fetch("/api/inquiry/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: cabinSlug,
          checkIn,
          checkOut,
          guests: parseInt(guests) || 2,
          pets: pets !== "0" ? parseInt(pets) : undefined,
          infants: infants !== "0" ? parseInt(infants) : undefined,
          guestInfo: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            countryCode: data.countryCode,
          },
          message: data.message,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to send inquiry")
      }

      // Success - modal will handle closing and showing success message
    } catch (err: any) {
      console.error("Error sending inquiry:", err)
      setInquiryError(err.message || "Failed to send inquiry. Please try again.")
      throw err // Re-throw so modal can handle it
    } finally {
      setIsSubmittingInquiry(false)
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
    const checkInDate = (checkIn && !checkOut) ? new Date(checkIn + 'T00:00:00') : null
    
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

  // Custom DayButton component with three-state rendering
  // Extends the default CalendarDayButton with status-based styling
  const CustomDayButton = useCallback((props: React.ComponentProps<typeof DayButton>) => {
    const { day, modifiers, className, ...restProps } = props
    
    // Extract the actual date from day object (react-day-picker uses day.date)
    const date = (day as any)?.date || day
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      // Fallback to default button if date is invalid
      return <CalendarDayButton {...props} />
    }
    
    const dateStr = format(date, "yyyy-MM-dd")
    let dateInfo = dateStatuses[dateStr]
    
    // If not in cache (outside visible range), calculate on-demand
    if (!dateInfo) {
      const checkInDate = (checkIn && !checkOut) ? new Date(checkIn + 'T00:00:00') : null
      dateInfo = calculateCalendarStatus(date, calendarData, checkInDate, nextCheckInMap)
    }

    // Determine additional styling based on status
    // Use data attributes for CSS targeting instead of complex overlays
    const statusClassNames = {
      "solid-block": "bg-muted/50 text-muted-foreground opacity-50",
      "checkout-only": checkIn 
        ? "opacity-75" 
        : "bg-muted/30 text-muted-foreground opacity-50",
      "open": "",
    }
    
    const statusClassName = dateInfo?.status ? statusClassNames[dateInfo.status] : ""

    return (
      <CalendarDayButton
        {...restProps}
        day={day}
        modifiers={modifiers}
        className={cn(
          statusClassName,
          // Add data attributes for potential CSS styling
          dateInfo?.status === "solid-block" && "data-solid-block",
          dateInfo?.status === "checkout-only" && "data-checkout-only",
          dateInfo?.status === "open" && "data-open",
          className
        )}
        data-status={dateInfo?.status || "open"}
      />
    )
  }, [dateStatuses, checkIn, checkOut, calendarData, nextCheckInMap])

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0]
  
  // Calculate fromDate for calendar (prevent past dates)
  const calendarFromDate = useMemo(() => {
    return startOfDay(new Date())
  }, [])

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-2xl font-semibold mb-6">Book Your Stay</h3>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Dates
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn && checkOut ? (
                  <>
                    {format(new Date(checkIn), "MMM d")} - {format(new Date(checkOut), "MMM d, yyyy")}
                  </>
                ) : (
                  "Select dates"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" side="bottom">
              <Calendar
                mode="range"
                fromDate={calendarFromDate} // Prevent navigation to past months and block dates before today
                defaultMonth={new Date()} // Start calendar on current month
                selected={
                  checkIn && checkOut
                    ? {
                        from: checkIn ? new Date(checkIn + 'T00:00:00') : undefined,
                        to: checkOut ? new Date(checkOut + 'T00:00:00') : undefined,
                      }
                    : checkIn
                    ? {
                        from: new Date(checkIn + 'T00:00:00'),
                      }
                    : undefined
                }
                onSelect={(range) => {
                  if (!range?.from) {
                    // Selection cleared
                    setCheckIn("")
                    setCheckOut("")
                    setIsSelectingNewRange(false)
                    return
                  }
                  
                  // Check if this is a single-date click (same date for from and to, or no to)
                  const isSingleDateClick = !range.to || (
                    range.from.getFullYear() === range.to.getFullYear() &&
                    range.from.getMonth() === range.to.getMonth() &&
                    range.from.getDate() === range.to.getDate()
                  )
                  
                  // CRITICAL: If we have a complete selection (both checkIn and checkOut set),
                  // and user clicks ANY new date, completely clear and start fresh
                  if (checkIn && checkOut && !isSelectingNewRange && previousSelection) {
                    // When react-day-picker has a range selected and you click a new date,
                    // it modifies the range. We need to detect which date was actually clicked.
                    // Compare the new range with the previous selection to determine the clicked date.
                    const fromYear = range.from.getFullYear()
                    const fromMonth = String(range.from.getMonth() + 1).padStart(2, '0')
                    const fromDay = String(range.from.getDate()).padStart(2, '0')
                    const newFromStr = `${fromYear}-${fromMonth}-${fromDay}`
                    
                    const toYear = range.to?.getFullYear()
                    const toMonth = range.to ? String(range.to.getMonth() + 1).padStart(2, '0') : ''
                    const toDay = range.to ? String(range.to.getDate()).padStart(2, '0') : ''
                    const newToStr = range.to ? `${toYear}-${toMonth}-${toDay}` : ''
                    
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
                  
                  // Convert range dates to local date strings for normal flow
                  const fromYear = range.from.getFullYear()
                  const fromMonth = String(range.from.getMonth() + 1).padStart(2, '0')
                  const fromDay = String(range.from.getDate()).padStart(2, '0')
                  const newCheckInStr = `${fromYear}-${fromMonth}-${fromDay}`
                  
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
                    const toYear = range.to.getFullYear()
                    const toMonth = String(range.to.getMonth() + 1).padStart(2, '0')
                    const toDay = String(range.to.getDate()).padStart(2, '0')
                    const newCheckOutStr = `${toYear}-${toMonth}-${toDay}`
                    setCheckIn(newCheckInStr)
                    setCheckOut(newCheckOutStr)
                    setIsSelectingNewRange(false) // Selection complete
                    setIsCalendarOpen(false) // Close the calendar popover
                  }
                }}
                disabled={(date) => {
                  // CRITICAL: Block all dates before today - this must be the first check
                  // Use startOfDay to normalize to midnight and isBefore for reliable comparison
                  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
                    return true // Invalid dates are disabled
                  }
                  
                  const today = startOfDay(new Date())
                  const dateToCheck = startOfDay(date)
                  
                  // Block dates before today (not including today)
                  // This check must happen first before any other logic
                  if (isBefore(dateToCheck, today)) {
                    return true
                  }
                  
                  // If check-in is selected, block all dates on or before it
                  // This ensures checkout date must be after check-in date
                  if (checkIn) {
                    const checkInDateObj = new Date(checkIn + 'T00:00:00')
                    // Block dates on or before check-in (use <= to include the check-in date itself)
                    if (date <= checkInDateObj) {
                      return true
                    }
                    
                    // Block all dates beyond the next check-in date
                    // When check-in is selected, checkout must be before next guest checks in
                    if (!checkOut) {
                      const checkInDateStr = format(checkInDateObj, "yyyy-MM-dd")
                      const nextCheckIn = nextCheckInMap[checkInDateStr]
                      
                      if (nextCheckIn) {
                        // Block dates after the next check-in date
                        // The next check-in date itself may be available as checkout (checkout-only)
                        if (date > nextCheckIn) {
                          return true
                        }
                      }
                    }
                  }
                  
                  // Use cached dateStatuses instead of recalculating
                  const dateStr = format(date, "yyyy-MM-dd")
                  let dateInfo = dateStatuses[dateStr]
                  
                  // If not in cache (outside visible range), calculate on-demand
                  if (!dateInfo) {
                    const checkInDate = (checkIn && !checkOut) ? new Date(checkIn + 'T00:00:00') : null
                    dateInfo = calculateCalendarStatus(date, calendarData, checkInDate, nextCheckInMap)
                  }
                  
                  // Solid block is always disabled
                  if (dateInfo.status === "solid-block") {
                    return true
                  }
                  
                  // Checkout-only is disabled for check-in selection
                  // But enabled if we're selecting checkout and have a check-in (but not checkOut)
                  if (dateInfo.status === "checkout-only") {
                    // If both checkIn and checkOut are set, we're selecting a new check-in
                    // So checkout-only dates should be blocked
                    if (checkIn && checkOut) {
                      return true
                    }
                    // If we have a check-in but no checkOut, allow this date as checkout
                    // (only if it's after check-in, which is already checked above)
                    if (checkIn) {
                      // Date is already validated to be after check-in above, so allow it
                      return false
                    }
                    // No check-in selected, disable for check-in selection
                    return true
                  }
                  
                  // Open dates are always enabled
                  return false
                }}
                numberOfMonths={2}
                initialFocus
              />
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
          <Button
            type="button"
            onClick={handleSendInquiry}
            disabled={!checkIn || !checkOut}
            size="lg"
            className="w-full rounded-full"
            variant="outline"
            title={!checkIn || !checkOut ? "Please select check-in and check-out dates" : ""}
          >
            Send Inquiry
          </Button>

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

      {/* Inquiry Modal */}
      <InquiryModal
        open={isInquiryModalOpen}
        onOpenChange={setIsInquiryModalOpen}
        cabinName={cabinSlug.charAt(0).toUpperCase() + cabinSlug.slice(1)}
        checkIn={checkIn || ""}
        checkOut={checkOut || ""}
        guests={guests}
        pets={pets}
        infants={infants}
        onSubmit={handleInquirySubmit}
      />
    </Card>
  )
}
