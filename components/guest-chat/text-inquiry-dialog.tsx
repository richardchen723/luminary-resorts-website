"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Loader2,
  MessageSquare,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react"
import {
  addDays,
  addYears,
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isValid,
  parseISO,
  startOfDay,
  startOfMonth,
} from "date-fns"
import { DayButton, type DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { trackTextInquiryCreated, trackTextInquiryStarted } from "@/lib/analytics"
import { buildNextCheckInMap, calculateCalendarStatus } from "@/lib/calendar-status"
import { getListingIdBySlug } from "@/lib/listing-map"
import { cn } from "@/lib/utils"
import type { GuestChatContext } from "@/types/guest-chat"
import type { HostawayCalendarEntry } from "@/types/hostaway"

const CABIN_OPTIONS = [
  { slug: "dew", name: "Dew" },
  { slug: "mist", name: "Mist" },
  { slug: "moss", name: "Moss" },
  { slug: "sol", name: "Sol" },
]

const COUNTRY_CALLING_CODES = [
  { value: "+1", label: "US/CA +1" },
  { value: "+44", label: "UK +44" },
  { value: "+52", label: "Mexico +52" },
  { value: "+55", label: "Brazil +55" },
  { value: "+60", label: "Malaysia +60" },
  { value: "+61", label: "Australia +61" },
  { value: "+65", label: "Singapore +65" },
  { value: "+81", label: "Japan +81" },
  { value: "+91", label: "India +91" },
  { value: "+971", label: "UAE +971" },
]

interface TextInquiryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  context?: Partial<GuestChatContext> | null
  initialGuestName?: string
  initialGuestPhone?: string
  initialMessage?: string
}

function createIdempotencyKey(): string {
  return window.crypto.randomUUID()
}

function getStayAvailabilityIssue(
  checkIn: string,
  checkOut: string,
  calendarData: Record<string, HostawayCalendarEntry>,
  nextCheckInMap: Record<string, Date | null>
): string | null {
  const checkInDate = parseISO(checkIn)
  const checkOutDate = parseISO(checkOut)

  if (!isValid(checkInDate) || !isValid(checkOutDate) || !isAfter(checkOutDate, checkInDate)) {
    return "Select a check-out date after your check-in date."
  }

  if (isBefore(startOfDay(checkInDate), startOfDay(new Date()))) {
    return "Check-in must be today or later."
  }

  const checkInInfo = calculateCalendarStatus(checkInDate, calendarData, null, nextCheckInMap)
  if (checkInInfo.status !== "open") {
    return "That check-in date is not available for this cabin."
  }

  const checkOutInfo = calculateCalendarStatus(
    checkOutDate,
    calendarData,
    checkInDate,
    nextCheckInMap
  )
  if (checkOutInfo.violatesSelectedMinimumStay) {
    return checkOutInfo.unavailableReason || "The selected stay does not meet the minimum stay."
  }
  if (checkOutInfo.status === "solid-block") {
    return "That check-out date is unavailable."
  }

  const nextCheckIn = nextCheckInMap[checkIn]
  if (nextCheckIn && isAfter(checkOutDate, nextCheckIn)) {
    return "Those dates overlap another stay."
  }

  const lastNight = addDays(checkOutDate, -1)
  const stayNights = eachDayOfInterval({ start: checkInDate, end: lastNight })
  const hasUnavailableNight = stayNights.some((date) => {
    const dateInfo = calculateCalendarStatus(date, calendarData, checkInDate, nextCheckInMap)
    return (
      dateInfo.status === "solid-block" ||
      (dateInfo.isCheckInDate && !isSameDay(date, checkInDate))
    )
  })

  if (hasUnavailableNight) {
    return "One or more nights in that range are unavailable."
  }

  return null
}

export function TextInquiryDialog({
  open,
  onOpenChange,
  context,
  initialGuestName,
  initialGuestPhone,
  initialMessage,
}: TextInquiryDialogProps) {
  const pathname = usePathname() || "/"
  const inferredListingSlug = pathname.startsWith("/stay/")
    ? pathname.split("/")[2] || ""
    : ""
  const [guestName, setGuestName] = useState("")
  const [countryCallingCode, setCountryCallingCode] = useState("+1")
  const [guestPhone, setGuestPhone] = useState("")
  const [listingSlug, setListingSlug] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState("2")
  const [message, setMessage] = useState("")
  const [website, setWebsite] = useState("")
  const [idempotencyKey, setIdempotencyKey] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [completedInquiryId, setCompletedInquiryId] = useState<string | null>(null)
  const [calendarData, setCalendarData] = useState<Record<string, HostawayCalendarEntry>>({})
  const [loadedCalendarListingId, setLoadedCalendarListingId] = useState<number | null>(null)
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false)
  const [calendarError, setCalendarError] = useState<string | null>(null)
  const [dateNotice, setDateNotice] = useState<string | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const listingId = getListingIdBySlug(listingSlug)
  const todayDate = useMemo(() => startOfDay(new Date()), [])
  const calendarEndDate = useMemo(() => addYears(todayDate, 2), [todayDate])

  useEffect(() => {
    if (!open) return

    const searchParams = new URLSearchParams(window.location.search)
    const queryGuests = Number.parseInt(searchParams.get("guests") || "", 10)
    const matchingCallingCode = [...COUNTRY_CALLING_CODES]
      .sort((left, right) => right.value.length - left.value.length)
      .find((option) => initialGuestPhone?.trim().startsWith(option.value))?.value

    setGuestName(initialGuestName || "")
    setCountryCallingCode(matchingCallingCode || "+1")
    setGuestPhone(
      matchingCallingCode
        ? initialGuestPhone?.trim().slice(matchingCallingCode.length).trim() || ""
        : initialGuestPhone || ""
    )
    setListingSlug(context?.listingSlug || inferredListingSlug)
    setCheckIn(context?.checkIn || searchParams.get("checkIn") || "")
    setCheckOut(context?.checkOut || searchParams.get("checkOut") || "")
    setGuests(
      String(context?.guests || (Number.isInteger(queryGuests) && queryGuests > 0 ? queryGuests : 2))
    )
    setMessage(initialMessage || "")
    setIdempotencyKey(createIdempotencyKey())
    setError(null)
    setDateNotice(null)
    setCompletedInquiryId(null)
  }, [
    open,
    context?.listingSlug,
    context?.checkIn,
    context?.checkOut,
    context?.guests,
    inferredListingSlug,
    initialGuestName,
    initialGuestPhone,
    initialMessage,
  ])

  useEffect(() => {
    const controller = new AbortController()

    async function fetchCalendar() {
      if (!open) return

      if (!listingId) {
        setCalendarData({})
        setLoadedCalendarListingId(null)
        setIsLoadingCalendar(false)
        setCalendarError(null)
        return
      }

      setCalendarData({})
      setLoadedCalendarListingId(null)
      setIsLoadingCalendar(true)
      setCalendarError(null)

      try {
        const params = new URLSearchParams({
          startDate: format(todayDate, "yyyy-MM-dd"),
          endDate: format(calendarEndDate, "yyyy-MM-dd"),
        })
        const response = await fetch(`/api/calendar/${listingId}?${params.toString()}`, {
          signal: controller.signal,
        })
        const data = await response.json().catch(() => null)

        if (!response.ok || !data?.calendar || Object.keys(data.calendar).length === 0) {
          throw new Error(data?.error || "We couldn't load this cabin's availability.")
        }

        setCalendarData(data.calendar)
        setLoadedCalendarListingId(listingId)
      } catch (calendarFetchError: any) {
        if (calendarFetchError.name !== "AbortError") {
          console.error("Error fetching text inquiry availability:", calendarFetchError)
          setCalendarError(
            calendarFetchError.message || "We couldn't load this cabin's availability."
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingCalendar(false)
        }
      }
    }

    void fetchCalendar()
    return () => controller.abort()
  }, [calendarEndDate, listingId, open, todayDate])

  const nextCheckInMap = useMemo(() => {
    if (Object.keys(calendarData).length === 0) return {}
    return buildNextCheckInMap(calendarData)
  }, [calendarData])

  const selectedDates = useMemo<DateRange | undefined>(() => {
    if (!checkIn) return undefined
    return {
      from: parseISO(checkIn),
      to: checkOut ? parseISO(checkOut) : undefined,
    }
  }, [checkIn, checkOut])

  useEffect(() => {
    if (
      !listingId ||
      loadedCalendarListingId !== listingId ||
      !checkIn ||
      !checkOut ||
      Object.keys(calendarData).length === 0
    ) {
      return
    }

    const issue = getStayAvailabilityIssue(checkIn, checkOut, calendarData, nextCheckInMap)
    if (issue) {
      setCheckIn("")
      setCheckOut("")
      setDateNotice(`${issue} Please choose new dates.`)
    }
  }, [
    calendarData,
    checkIn,
    checkOut,
    listingId,
    loadedCalendarListingId,
    nextCheckInMap,
  ])

  const isDateDisabled = useCallback(
    (date: Date) => {
      const normalizedDate = startOfDay(date)
      if (isBefore(normalizedDate, todayDate)) return true

      const isSelectingCheckout = Boolean(checkIn && !checkOut)
      const selectedCheckIn = isSelectingCheckout ? parseISO(checkIn) : null

      if (selectedCheckIn) {
        if (isBefore(normalizedDate, selectedCheckIn)) return true
        if (isSameDay(normalizedDate, selectedCheckIn)) return false

        return Boolean(
          getStayAvailabilityIssue(
            checkIn,
            format(normalizedDate, "yyyy-MM-dd"),
            calendarData,
            nextCheckInMap
          )
        )
      }

      const dateInfo = calculateCalendarStatus(
        normalizedDate,
        calendarData,
        selectedCheckIn,
        nextCheckInMap
      )

      if (dateInfo.status === "solid-block") return true
      if (dateInfo.status === "checkout-only") return true

      const earliestCheckout = addDays(normalizedDate, Math.max(dateInfo.minimumStay ?? 1, 1))
      if (isAfter(earliestCheckout, calendarEndDate)) return true

      return Boolean(
        getStayAvailabilityIssue(
          format(normalizedDate, "yyyy-MM-dd"),
          format(earliestCheckout, "yyyy-MM-dd"),
          calendarData,
          nextCheckInMap
        )
      )
    },
    [calendarData, calendarEndDate, checkIn, checkOut, nextCheckInMap, todayDate]
  )

  const CustomDayButton = useCallback(
    (props: React.ComponentProps<typeof DayButton>) => {
      const date = props.day.date
      const selectedCheckIn = checkIn && !checkOut ? parseISO(checkIn) : null
      const dateInfo = calculateCalendarStatus(
        date,
        calendarData,
        selectedCheckIn,
        nextCheckInMap
      )
      const isSelectedCheckIn = Boolean(selectedCheckIn && isSameDay(date, selectedCheckIn))
      const isUnavailable = isDateDisabled(date) && !isSelectedCheckIn
      const isCheckoutOnly = dateInfo.status === "checkout-only" && !selectedCheckIn

      return (
        <div className="relative h-full w-full">
          <CalendarDayButton
            {...props}
            className={cn(
              props.className,
              (isUnavailable || isCheckoutOnly) && "bg-muted/40 text-muted-foreground",
              isUnavailable && "opacity-50"
            )}
            data-availability={dateInfo.status}
          />
          {isUnavailable && (
            <X
              className="pointer-events-none absolute inset-0 z-10 m-auto h-4 w-4 text-muted-foreground/70"
              strokeWidth={2.5}
              aria-hidden="true"
            />
          )}
        </div>
      )
    },
    [calendarData, checkIn, checkOut, isDateDisabled, nextCheckInMap]
  )

  function handleCabinChange(nextListingSlug: string) {
    if (nextListingSlug !== listingSlug) {
      setListingSlug(nextListingSlug)
      setCheckIn("")
      setCheckOut("")
      setDateNotice(null)
      setError(null)
      setIsCalendarOpen(false)
    }
  }

  function handleDateSelect(range: DateRange | undefined, selectedDay: Date) {
    setDateNotice(null)
    setError(null)

    if (checkIn && checkOut) {
      setCheckIn(format(selectedDay, "yyyy-MM-dd"))
      setCheckOut("")
      return
    }

    if (!range?.from) {
      setCheckIn("")
      setCheckOut("")
      return
    }

    setCheckIn(format(range.from, "yyyy-MM-dd"))
    if (range.to && !isSameDay(range.from, range.to)) {
      const nextCheckIn = format(range.from, "yyyy-MM-dd")
      const nextCheckOut = format(range.to, "yyyy-MM-dd")
      const issue = getStayAvailabilityIssue(
        nextCheckIn,
        nextCheckOut,
        calendarData,
        nextCheckInMap
      )
      if (issue) {
        setDateNotice(issue)
        return
      }

      setCheckOut(nextCheckOut)
      setIsCalendarOpen(false)
    } else {
      setCheckOut("")
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!guestName.trim() || !guestPhone.trim() || !listingSlug || !checkIn || !checkOut) {
      setError("Add your name, mobile number, cabin, and stay dates.")
      return
    }
    if (checkOut <= checkIn) {
      setError("Check-out must be after check-in.")
      return
    }
    if (isLoadingCalendar || loadedCalendarListingId !== listingId || calendarError) {
      setError("Wait for this cabin's availability to load, then choose your dates.")
      return
    }

    const availabilityIssue = getStayAvailabilityIssue(
      checkIn,
      checkOut,
      calendarData,
      nextCheckInMap
    )
    if (availabilityIssue) {
      setError(availabilityIssue)
      return
    }

    setIsSubmitting(true)
    trackTextInquiryStarted(listingSlug, pathname)

    try {
      const requestIdempotencyKey = idempotencyKey || createIdempotencyKey()
      if (!idempotencyKey) {
        setIdempotencyKey(requestIdempotencyKey)
      }

      const response = await fetch("/api/inquiry/text", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: requestIdempotencyKey,
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim(),
          countryCallingCode,
          listingSlug,
          checkIn,
          checkOut,
          guests: Number.parseInt(guests, 10),
          pets: context?.pets || 0,
          infants: context?.infants || 0,
          message: message.trim(),
          sourcePath: context?.sourcePath || pathname,
          website,
        }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok || !data?.textMessageSent) {
        throw new Error(data?.error || "We couldn't send your text. Please try again.")
      }

      const inquiryId = String(data.inquiryId)
      setCompletedInquiryId(inquiryId)
      trackTextInquiryCreated(inquiryId, listingSlug, data.smsStatus || null)
    } catch (submitError: any) {
      setError(submitError.message || "We couldn't send your text. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        {completedInquiryId ? (
          <div className="space-y-6 py-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <DialogTitle>Check your text messages</DialogTitle>
              <DialogDescription>
                We sent a text to the mobile number you provided. Reply to continue the
                conversation with the Luminary Resorts team.
              </DialogDescription>
              <p className="text-xs text-muted-foreground">Inquiry #{completedInquiryId}</p>
            </div>
            <Button
              type="button"
              className="w-full rounded-full"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageSquare className="h-5 w-5" />
              </div>
              <DialogTitle>Text with us</DialogTitle>
              <DialogDescription>
                Share a few details and we&apos;ll text the number you provide. Reply to that text to
                connect directly with the Luminary Resorts team.
              </DialogDescription>
            </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="text-guest-name">Name</Label>
              <Input
                id="text-guest-name"
                autoComplete="name"
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
                placeholder="Your name"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="text-guest-phone">Mobile number</Label>
              <div className="flex gap-2">
                <select
                  aria-label="Country calling code"
                  value={countryCallingCode}
                  onChange={(event) => setCountryCallingCode(event.target.value)}
                  disabled={isSubmitting}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {COUNTRY_CALLING_CODES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Input
                  id="text-guest-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={guestPhone}
                  onChange={(event) => setGuestPhone(event.target.value)}
                  placeholder="555 123 4567"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Use a mobile number that can receive SMS. Two-way texting is most reliable in the
                US, Canada, and UK.
              </p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="text-cabin">Cabin</Label>
              <select
                id="text-cabin"
                value={listingSlug}
                onChange={(event) => handleCabinChange(event.target.value)}
                disabled={isSubmitting}
                required
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select a cabin</option>
                {CABIN_OPTIONS.map((cabin) => (
                  <option key={cabin.slug} value={cabin.slug}>
                    {cabin.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="text-stay-dates">Stay dates</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="text-stay-dates"
                    type="button"
                    variant="outline"
                    disabled={
                      isSubmitting ||
                      !listingId ||
                      isLoadingCalendar ||
                      loadedCalendarListingId !== listingId ||
                      Boolean(calendarError)
                    }
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkIn && "text-muted-foreground"
                    )}
                  >
                    {isLoadingCalendar ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CalendarIcon className="mr-2 h-4 w-4" />
                    )}
                    {isLoadingCalendar ? (
                      `Loading ${CABIN_OPTIONS.find((cabin) => cabin.slug === listingSlug)?.name || "cabin"} availability…`
                    ) : checkIn && checkOut ? (
                      <>
                        {format(parseISO(checkIn), "MMM d")} –{" "}
                        {format(parseISO(checkOut), "MMM d, yyyy")}
                      </>
                    ) : checkIn ? (
                      `${format(parseISO(checkIn), "MMM d, yyyy")} – Select check-out`
                    ) : listingId ? (
                      "Select available dates"
                    ) : (
                      "Choose a cabin first"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start" side="bottom">
                  <Calendar
                    mode="range"
                    startMonth={startOfMonth(todayDate)}
                    endMonth={startOfMonth(calendarEndDate)}
                    defaultMonth={selectedDates?.from || todayDate}
                    selected={selectedDates}
                    onSelect={handleDateSelect}
                    disabled={isDateDisabled}
                    components={{ DayButton: CustomDayButton }}
                    numberOfMonths={1}
                    initialFocus
                  />
                  <div className="space-y-2 border-t px-3 py-2.5 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                      Crossed-out dates are unavailable for this cabin.
                    </p>
                    {(checkIn || checkOut) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-full text-xs"
                        onClick={() => {
                          setCheckIn("")
                          setCheckOut("")
                          setDateNotice(null)
                        }}
                      >
                        <XCircle className="mr-1 h-3.5 w-3.5" />
                        Clear dates
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              {calendarError ? (
                <p className="text-xs text-destructive" role="alert">
                  {calendarError} Choose the cabin again to retry.
                </p>
              ) : dateNotice ? (
                <p className="text-xs text-amber-700" role="status">
                  {dateNotice}
                </p>
              ) : listingId ? (
                <p className="text-xs text-muted-foreground" aria-live="polite">
                  {isLoadingCalendar
                    ? "Syncing current availability…"
                    : "Availability and minimum-stay rules are synced for the selected cabin."}
                </p>
              ) : null}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="text-guests">Guests</Label>
              <select
                id="text-guests"
                value={guests}
                onChange={(event) => setGuests(event.target.value)}
                disabled={isSubmitting}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {Array.from({ length: 8 }, (_, index) => index + 1).map((count) => (
                  <option key={count} value={count}>
                    {count} guest{count === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="text-message">How can we help? (optional)</Label>
              <Textarea
                id="text-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Availability, a special request, or anything else…"
                rows={3}
                maxLength={1000}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="absolute -left-[9999px]" aria-hidden="true">
            <Label htmlFor="text-website">Website</Label>
            <Input
              id="text-website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Your details are shared securely with the Luminary Resorts team so we can help with
              the right cabin, dates, and request.
            </p>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full rounded-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending text…
                </>
              ) : (
                "Send me a text"
              )}
            </Button>
          </DialogFooter>
          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            By continuing, you agree to receive a transactional text about this inquiry. Message
            and data rates may apply. Reply STOP to opt out.
          </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
