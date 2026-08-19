import assert from "node:assert/strict"
import test from "node:test"
import { format, parseISO } from "date-fns"
import {
  calculateCalendarStatus,
  findNextAvailableCheckInDate,
  getCalendarDisabledReason,
} from "../lib/calendar-status"
import type { HostawayCalendarEntry } from "../types/hostaway"

function entry(
  date: string,
  overrides: Partial<HostawayCalendarEntry> = {}
): HostawayCalendarEntry {
  return {
    date,
    isAvailable: 1,
    status: "available",
    reservations: [],
    ...overrides,
  }
}

test("explains past and fully booked dates", () => {
  const calendarData = {
    "2026-08-20": entry("2026-08-20", { isAvailable: 0, status: "reserved" }),
  }
  const bookedDate = parseISO("2026-08-20")
  const bookedInfo = calculateCalendarStatus(bookedDate, calendarData)

  assert.equal(
    getCalendarDisabledReason(bookedDate, bookedInfo, {
      today: parseISO("2026-08-18"),
    }),
    "Fully booked"
  )

  const pastDate = parseISO("2026-08-17")
  const pastInfo = calculateCalendarStatus(pastDate, calendarData)
  assert.equal(
    getCalendarDisabledReason(pastDate, pastInfo, {
      today: parseISO("2026-08-18"),
    }),
    "This date has already passed"
  )
})

test("allows checkout-only dates after a check-in but not as a new check-in", () => {
  const date = parseISO("2026-08-22")
  const calendarData = {
    "2026-08-22": entry("2026-08-22", {
      isAvailable: 0,
      status: "reserved",
      reservations: [
        {
          id: 1,
          arrivalDate: "2026-08-22",
          departureDate: "2026-08-25",
          status: "confirmed",
        },
      ],
    }),
  }
  const dateInfo = calculateCalendarStatus(date, calendarData)

  assert.match(getCalendarDisabledReason(date, dateInfo) || "", /Check-in unavailable/)
  assert.equal(
    getCalendarDisabledReason(date, dateInfo, {
      checkInDate: parseISO("2026-08-20"),
    }),
    null
  )
})

test("explains minimum-stay and next-reservation boundaries", () => {
  const calendarData = {
    "2026-08-20": entry("2026-08-20", { minimumStay: 3 }),
    "2026-08-21": entry("2026-08-21"),
  }
  const checkInDate = parseISO("2026-08-20")
  const checkoutDate = parseISO("2026-08-21")
  const checkoutInfo = calculateCalendarStatus(checkoutDate, calendarData, checkInDate)

  assert.equal(
    getCalendarDisabledReason(checkoutDate, checkoutInfo, { checkInDate }),
    "Minimum stay is 3 nights"
  )

  const laterDate = parseISO("2026-08-24")
  const laterInfo = calculateCalendarStatus(laterDate, calendarData, checkInDate)
  assert.equal(
    getCalendarDisabledReason(laterDate, laterInfo, {
      checkInDate,
      nextCheckInMap: { "2026-08-20": parseISO("2026-08-23") },
    }),
    "This stay must end by Aug 23"
  )
})

test("finds the next calendar-backed available check-in", () => {
  const calendarData = {
    "2026-08-20": entry("2026-08-20", { isAvailable: 0, status: "reserved" }),
    "2026-08-21": entry("2026-08-21", { isAvailable: 0, status: "reserved" }),
    "2026-08-22": entry("2026-08-22"),
  }

  assert.equal(
    format(
      findNextAvailableCheckInDate(calendarData, parseISO("2026-08-18"))!,
      "yyyy-MM-dd"
    ),
    "2026-08-22"
  )
})
