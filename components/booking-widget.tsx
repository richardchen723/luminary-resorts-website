"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

export function BookingWidget({ className = "" }: { className?: string }) {
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState("2")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ checkIn, checkOut, guests })
  }

  return (
    <form onSubmit={handleSubmit} className={`bg-card/95 backdrop-blur-sm rounded-lg p-6 shadow-lg ${className}`}>
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
              onChange={(e) => setCheckOut(e.target.value)}
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

      <Button type="submit" size="lg" className="w-full mt-6 rounded-full">
        Check Availability
      </Button>
    </form>
  )
}
