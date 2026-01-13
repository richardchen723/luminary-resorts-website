// Hostaway API Response Types
// Based on Hostaway Public API v1 documentation

export interface HostawayApiResponse<T> {
  status: "success" | "fail"
  result: T | string // T on success, error message string on fail
  limit?: number
  offset?: number
  count?: number
  page?: number
  totalPages?: number
}

export interface HostawayListing {
  id: number
  name: string
  description: string
  houseRules?: string | null
  price: number
  lat: number
  lng: number
  guestsIncluded: number
  checkInTimeStart: number // Hour in listing's local timezone (0-23)
  checkOutTime: number // Hour in listing's local timezone (0-23)
  cancellationPolicyId: number
  propertyType: {
    id: number
    name: string
  }
  listingMap: number
  countryCode: string
  city: string
  personCapacity: number
  bathroomsNumber: number
  bedroomsNumber: number
  guestBathroomsNumber: number | null
  bedsNumber: number
  currencyCode: string
  isDepositStayCollected: boolean
  refundableDamageDeposit: number
  countryUsingCountryCode: string
}

export interface HostawayListingImage {
  id: number
  url: string
  caption: string | null
  bookingEngineCaption: string | null
  sortOrder: number
}

export interface HostawayAmenity {
  id: number
  name: string
  category: string
}

export interface HostawayListingAmenity {
  id: number
  amenity: HostawayAmenity
  isPresent: number // 0 or 1 (boolean as integer)
  description: string | null
  amenityId: number
}

export interface HostawayListingFull {
  listing: HostawayListing
  listingImage: HostawayListingImage[]
  listingAmenity: HostawayListingAmenity[]
  listingVideo: any[]
  averageNightlyPrice: number | null
  allowInstantBooking: number // 0 or 1
  totalPriceForGivenPeriod: number | null
  reviewsCount: number
}

export interface HostawayAccessTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

export interface HostawayError {
  status: "fail"
  message: string
}

// Calendar and Availability Types
export interface HostawayReservation {
  id: number
  arrivalDate: string // YYYY-MM-DD
  departureDate: string // YYYY-MM-DD
  status: string
  // Additional fields from Hostaway API that may be present
  [key: string]: any
}

export interface HostawayCalendarEntry {
  id?: number
  date: string // YYYY-MM-DD format
  isAvailable?: number // 0 or 1 (from Hostaway API)
  available?: number // 0 or 1 (alternative field name)
  status?: string // "available", "reserved", "blocked", etc.
  price?: number | null
  minimumStay?: number | null
  maximumStay?: number | null
  reservations?: HostawayReservation[]
  countReservedUnits?: number
  countBlockingReservations?: number
  // Additional fields from Hostaway API that may be present
  [key: string]: any
}

export interface HostawayCalendarResponse {
  [date: string]: HostawayCalendarEntry
}

// Calendar date status type
export type CalendarDateStatus = "solid-block" | "checkout-only" | "open"

export interface HostawayAvailabilityResponse {
  listingId: number
  calendar: HostawayCalendarResponse
}

// Pricing Types
export interface HostawayPricingBreakdown {
  nights: number
  nightlyRate: number
  subtotal: number
  taxes?: number
  fees?: number
  total: number
  currency: string
}

export interface HostawayPricingResponse {
  listingId: number
  startDate: string
  endDate: string
  guests: number
  breakdown: HostawayPricingBreakdown
  available: boolean
}

// Booking Types
export interface HostawayGuestInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  countryCode?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  specialRequests?: string
}

export interface HostawayBookingRequest {
  listingMapId: number // Use listingMapId, not listingId
  arrivalDate: string // YYYY-MM-DD (not startDate)
  departureDate: string // YYYY-MM-DD (not endDate)
  numberOfGuests: number
  adults: number
  children?: number | null
  infants?: number | null
  pets?: number | null
  guestFirstName: string
  guestLastName: string
  guestName: string // Full name
  guestEmail: string
  guestZipCode?: string
  guestAddress?: string
  guestCity?: string
  guestCountry?: string
  phone: string
  channelId: number // Channel ID (2000 for direct bookings)
  totalPrice?: number
  currency?: string
  isManuallyChecked?: number
  isInitial?: number
  // Optional fields from sample
  guestPicture?: string | null
  guestRecommendations?: number
  guestTrips?: number
  guestWork?: string | null
  isGuestIdentityVerified?: number
  isGuestVerifiedByEmail?: number
  isGuestVerifiedByWorkEmail?: number
  isGuestVerifiedByFacebook?: number
  isGuestVerifiedByGovernmentId?: number
  isGuestVerifiedByPhone?: number
  isGuestVerifiedByReviews?: number
  checkInTime?: number | null
  checkOutTime?: number | null
  hostNote?: string | null
  guestNote?: string | null
  comment?: string | null
}

export interface HostawayBookingResponse {
  id: number
  listingId: number
  startDate: string
  endDate: string
  guests: number
  status: "pending" | "confirmed" | "cancelled"
  totalPrice: number
  currency: string
  confirmationCode: string
  guest: HostawayGuestInfo
  createdAt: string
}
