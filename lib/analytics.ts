// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
    dataLayer?: any[]
  }
}

// Track SEO-relevant events for GA4
export function trackSEOEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
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

export function trackReservationConfirmed(cabinSlug: string, bookingId: string) {
  trackSEOEvent('reservation_confirmed', {
    cabin_slug: cabinSlug,
    booking_id: bookingId,
  })
}
