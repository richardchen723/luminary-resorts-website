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
