"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import { format, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import type { DateRange } from "react-day-picker"
import type { HostawayCalendarEntry } from "@/types/hostaway"
import { calculateCalendarStatus, type CalendarDateInfo } from "@/lib/calendar-status"

interface CabinCalendarProps {
  listingId: number
  selected?: DateRange
  onSelect?: (range: DateRange | undefined) => void
  disabled?: boolean
  className?: string
}

export function CabinCalendar({
  listingId,
  selected,
  onSelect,
  disabled,
  className,
}: CabinCalendarProps) {
  const [calendarData, setCalendarData] = useState<Record<string, HostawayCalendarEntry>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Preload calendar data on mount
  useEffect(() => {
    async function fetchCalendar() {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/calendar/${listingId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch calendar data")
        }
        
        const data = await response.json()
        setCalendarData(data.calendar || {})
      } catch (err: any) {
        console.error("Error fetching calendar:", err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCalendar()
  }, [listingId])

  // Memoize status calculations for all dates
  // Recalculate when calendar data or check-in date changes
  const dateStatuses = useMemo(() => {
    const statuses: Record<string, CalendarDateInfo> = {}
    const checkInDate = selected?.from || null
    
    // Calculate status for all dates in calendar data
    for (const dateStr of Object.keys(calendarData)) {
      try {
        const date = new Date(dateStr + 'T00:00:00')
        statuses[dateStr] = calculateCalendarStatus(date, calendarData, checkInDate)
      } catch (e) {
        // Skip invalid dates
        console.warn(`Invalid date in calendar data: ${dateStr}`, e)
      }
    }
    
    return statuses
  }, [calendarData, selected?.from])

  // Determine if a date is disabled
  const isDateDisabled = (date: Date): boolean => {
    const dateStr = format(date, "yyyy-MM-dd")
    const dateInfo = dateStatuses[dateStr]
    
    // If no status calculated, assume available (might be outside cached range)
    if (!dateInfo) return false
    
    // Solid block is always disabled
    if (dateInfo.status === "solid-block") {
      return true
    }
    
    // Checkout-only is disabled if no check-in is selected
    if (dateInfo.status === "checkout-only" && !selected?.from) {
      return true
    }
    
    return false
  }


  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-muted-foreground">Loading calendar...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-destructive">Error loading calendar: {error}</div>
      </div>
    )
  }

  // Custom DayButton component with three-state rendering
  const CustomDayButton = React.useCallback(({ day, ...props }: any) => {
    // Validate day is a valid Date object
    if (!day || !(day instanceof Date) || isNaN(day.getTime())) {
      // Return default button if day is invalid
      return <button {...props} disabled className={cn("relative w-full aspect-square", props.className)} />
    }
    
    const dateStr = format(day, "yyyy-MM-dd")
    const dateInfo = dateStatuses[dateStr]
    const entry = calendarData[dateStr]

    const isSelected = selected?.from && isSameDay(day, selected.from) ||
                      selected?.to && isSameDay(day, selected.to)
    const isInRange = selected?.from && selected?.to &&
                      day >= selected.from && day <= selected.to
    const isStart = selected?.from && isSameDay(day, selected.from)
    const isEnd = selected?.to && isSameDay(day, selected.to)
    const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
    
    // Determine if date should be disabled
    const isDisabled = dateInfo?.status === "solid-block" ||
                      (dateInfo?.status === "checkout-only" && !selected?.from) ||
                      disabled

    // Determine styling based on status
    const statusStyles = {
      "solid-block": "bg-muted/50 text-muted-foreground opacity-50 cursor-not-allowed",
      "checkout-only": selected?.from 
        ? "bg-background hover:bg-accent text-foreground opacity-75" 
        : "bg-muted/30 text-muted-foreground opacity-50 cursor-not-allowed",
      "open": "bg-background hover:bg-accent text-foreground",
    }
    
    const statusStyle = dateInfo?.status ? statusStyles[dateInfo.status] : statusStyles["open"]

    return (
      <button
        {...props}
        disabled={isDisabled}
        className={cn(
          "relative w-full aspect-square flex flex-col items-center justify-center rounded-md transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          // Base status styles
          statusStyle,
          // Selected range
          isInRange && !isStart && !isEnd && "bg-primary/20 text-foreground",
          isStart && "bg-primary text-primary-foreground rounded-l-md rounded-r-none",
          isEnd && "bg-primary text-primary-foreground rounded-r-md rounded-l-none",
          // Today
          isToday && !isSelected && "ring-2 ring-primary/50",
          isDisabled && "cursor-not-allowed",
          props.className
        )}
      >
        {/* Solid block indicator */}
        {dateInfo?.status === "solid-block" && (
          <X className="absolute inset-0 m-auto w-4 h-4 text-muted-foreground opacity-50" />
        )}
        
        {/* Checkout-only indicator (half-block visual) */}
        {dateInfo?.status === "checkout-only" && !selected?.from && (
          <>
            <div className="absolute inset-0 bg-background" />
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-muted/60" />
          </>
        )}
        
        <span className={cn(
          "relative z-10 text-sm font-medium",
          isSelected && "text-primary-foreground",
          dateInfo?.status === "solid-block" && "opacity-30"
        )}>
          {day.getDate()}
        </span>
        
        {/* Price tooltip on hover */}
        {dateInfo?.status !== "solid-block" && dateInfo?.price && (
          <span className="relative z-10 text-[10px] text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {dateInfo.currency === "USD" ? "$" : dateInfo.currency}
            {dateInfo.price.toLocaleString()}
          </span>
        )}
      </button>
    )
  }, [dateStatuses, calendarData, selected, disabled])

  return (
    <div className={cn("w-full", className)}>
      <Calendar
        mode="range"
        selected={selected}
        onSelect={onSelect}
        disabled={isDateDisabled}
        numberOfMonths={2}
        className="rounded-lg border p-4"
        components={{
          DayButton: CustomDayButton,
        }}
        classNames={{
          day: "group",
        }}
      />
    </div>
  )
}
