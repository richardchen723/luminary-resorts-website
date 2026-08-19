"use client"

import { CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OPEN_BOOKING_CALENDAR_EVENT } from "@/lib/booking-events"
import { trackBookingCalendarOpened } from "@/lib/analytics"

export function MobileBookingBar() {
  const openBookingCalendar = () => {
    trackBookingCalendarOpened("mobile_sticky_bar")
    window.dispatchEvent(new Event(OPEN_BOOKING_CALENDAR_EVENT))
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
      <Button
        type="button"
        size="lg"
        className="w-full rounded-full"
        onClick={openBookingCalendar}
      >
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        Check dates &amp; price
      </Button>
    </div>
  )
}
