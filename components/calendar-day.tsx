"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CalendarDayProps {
  date: Date
  available: boolean
  isCheckoutDay: boolean
  isSelected: boolean
  isStart: boolean
  isEnd: boolean
  isInRange: boolean
  price?: number | null
  currency?: string | null
  onClick?: () => void
  disabled?: boolean
}

export function CalendarDay({
  date,
  available,
  isCheckoutDay,
  isSelected,
  isStart,
  isEnd,
  isInRange,
  price,
  currency = "USD",
  onClick,
  disabled,
}: CalendarDayProps) {
  const dayNumber = date.getDate()
  const isToday = date.toDateString() === new Date().toDateString()
  
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !available}
      className={cn(
        "relative w-full aspect-square flex flex-col items-center justify-center rounded-md transition-all duration-200",
        "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        // Base styles
        !available && !isCheckoutDay && "bg-muted text-muted-foreground opacity-50 cursor-not-allowed",
        available && !isSelected && !isInRange && "bg-background hover:bg-accent text-foreground",
        // Selected range styles
        isInRange && !isStart && !isEnd && "bg-primary/20 text-foreground",
        isStart && "bg-primary text-primary-foreground rounded-l-md rounded-r-none",
        isEnd && "bg-primary text-primary-foreground rounded-r-md rounded-l-none",
        isSelected && !isStart && !isEnd && "bg-primary text-primary-foreground",
        // Checkout day styles (half-blocked)
        isCheckoutDay && available && "relative overflow-hidden",
        // Today indicator
        isToday && !isSelected && "ring-2 ring-primary/50",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      {/* Checkout day half-block visual */}
      {isCheckoutDay && available && (
        <>
          <div className="absolute inset-0 bg-background" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-muted/60" />
        </>
      )}
      
      {/* Day number */}
      <span className={cn(
        "relative z-10 text-sm font-medium",
        isSelected && "text-primary-foreground",
        !available && !isCheckoutDay && "text-muted-foreground"
      )}>
        {dayNumber}
      </span>
      
      {/* Price on hover (if available) */}
      {available && price && (
        <span className="relative z-10 text-xs text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {currency === "USD" ? "$" : currency}
          {price.toLocaleString()}
        </span>
      )}
    </button>
  )
}
