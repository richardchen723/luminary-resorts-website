// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
    dataLayer?: any[]
    clarity?: (command: "event", value: string) => void
  }
}

// Track SEO-relevant events for GA4
export function trackSEOEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
  }
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('event', eventName)
  }
}

// Specific event tracking functions
export function trackViewStay(cabinSlug: string, pagePath: string) {
  trackSEOEvent('view_stay', {
    cabin_slug: cabinSlug,
    page_path: pagePath,
  })
}

export function trackSelectDates(cabinSlug: string, checkIn: string) {
  trackSEOEvent('select_dates', {
    cabin_slug: cabinSlug,
    check_in: checkIn,
  })
}

export function trackViewPricing(cabinSlug: string, nights: number) {
  trackSEOEvent('view_pricing', {
    cabin_slug: cabinSlug,
    nights: nights,
  })
}

export function trackStartCheckout(cabinSlug: string, total: number) {
  trackSEOEvent('start_checkout', {
    cabin_slug: cabinSlug,
    total: total,
  })
}

export function trackBookingCalendarOpened(source: "mobile_sticky_bar" | "booking_widget") {
  trackSEOEvent('booking_calendar_opened', { source })
}

export function trackUnavailableDateTapped(cabinSlug: string, reason: string) {
  trackSEOEvent('calendar_unavailable_date_tapped', {
    cabin_slug: cabinSlug,
    reason,
  })
}

export function trackNextAvailableViewed(cabinSlug: string) {
  trackSEOEvent('calendar_next_available_viewed', {
    cabin_slug: cabinSlug,
  })
}

export function trackReservationConfirmed(cabinSlug: string, bookingId: string) {
  trackSEOEvent('reservation_confirmed', {
    cabin_slug: cabinSlug,
    booking_id: bookingId,
  })
}

export function trackChatOpened(sourcePath: string) {
  trackSEOEvent('chat_opened', {
    source_path: sourcePath,
  })
}

export function trackChatStarted(threadId: string) {
  trackSEOEvent('chat_started', {
    thread_id: threadId,
  })
}

export function trackChatMessageSent(threadId: string) {
  trackSEOEvent('chat_message_sent', {
    thread_id: threadId,
  })
}

export function trackChatReplyReceived(threadId: string) {
  trackSEOEvent('chat_reply_received', {
    thread_id: threadId,
  })
}

export function trackChatConvertedToInquiry(threadId: string) {
  trackSEOEvent('chat_converted_to_inquiry', {
    thread_id: threadId,
  })
}

export function trackTextInquiryStarted(cabinSlug: string, sourcePath: string) {
  trackSEOEvent('text_inquiry_started', {
    cabin_slug: cabinSlug,
    source_path: sourcePath,
  })
}

export function trackTextInquiryCreated(
  inquiryId: string,
  cabinSlug: string,
  smsStatus: string | null
) {
  trackSEOEvent('text_inquiry_created', {
    inquiry_id: inquiryId,
    cabin_slug: cabinSlug,
    sms_status: smsStatus,
  })
}
