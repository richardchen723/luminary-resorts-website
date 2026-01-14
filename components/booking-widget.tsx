"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Loader2 } from "lucide-react"
import { AvailabilityResults } from "@/components/availability-results"
import type { CabinAvailability } from "@/lib/availability"

export function BookingWidget({ className = "" }: { className?: string }) {
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState("2")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<CabinAvailability[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Calculate minimum date (today) for check-in input
  const minCheckInDate = (() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today.toISOString().split("T")[0]
  })()

  // Clear checkout date if check-in is changed to a date after checkout
  useEffect(() => {
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn)
      const checkOutDate = new Date(checkOut)
      // If check-in is on or after checkout, clear checkout
      if (checkInDate >= checkOutDate) {
        setCheckOut("")
      }
    }
  }, [checkIn, checkOut])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setResults(null)

    // Client-side validation: check-out must be after check-in
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn)
      const checkOutDate = new Date(checkOut)
      if (checkOutDate <= checkInDate) {
        setError("Check-out date must be after check-in date")
        setIsLoading(false)
        return
      }
    }

    try {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: checkIn,
          endDate: checkOut,
          guests: parseInt(guests, 10),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to check availability")
      }

      const data = await response.json()
      setResults(data.cabins || [])
    } catch (err: any) {
      setError(err.message || "An error occurred while checking availability")
      console.error("Error checking availability:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="bg-card/95 backdrop-blur-sm rounded-lg p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="check-in" className="block text-sm font-medium mb-2">
              Check In
            </label>
            <div className="relative">
              <input
                type="date"
                id="check-in"
                value={checkIn}
                min={minCheckInDate}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                required
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="check-out" className="block text-sm font-medium mb-2">
              Check Out
            </label>
            <div className="relative">
              <input
                type="date"
                id="check-out"
                value={checkOut}
                onChange={(e) => {
                  const selectedDate = e.target.value
                  // Validate that checkout is after check-in
                  if (checkIn && selectedDate) {
                    const checkInDate = new Date(checkIn)
                    const checkOutDate = new Date(selectedDate)
                    if (checkOutDate <= checkInDate) {
                      setError("Check-out date must be after check-in date")
                      return
                    }
                  }
                  setError(null)
                  setCheckOut(selectedDate)
                }}
                min={checkIn ? (() => {
                  // Set min to day after check-in
                  const minDate = new Date(checkIn)
                  minDate.setDate(minDate.getDate() + 1)
                  return minDate.toISOString().split("T")[0]
                })() : undefined}
                className="w-full px-4 py-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                required
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="guests" className="block text-sm font-medium mb-2">
              Guests
            </label>
            <select
              id="guests"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none"
            >
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
            </select>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full mt-6 rounded-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Checking Availability...
            </>
          ) : (
            "Check Availability"
          )}
        </Button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}

      {results && (
        <AvailabilityResults
          cabins={results}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={parseInt(guests, 10)}
          onClose={() => setResults(null)}
        />
      )}
    </div>
  )
}
