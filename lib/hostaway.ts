import type {
  HostawayApiResponse,
  HostawayListingFull,
  HostawayAccessTokenResponse,
  HostawayError,
  HostawayCalendarResponse,
  HostawayPricingResponse,
} from "@/types/hostaway"

const HOSTAWAY_API_BASE = "https://api.hostaway.com/v1"
const HOSTAWAY_TOKEN_URL = "https://api.hostaway.com/v1/accessTokens"

// In-memory token cache
let cachedToken: { token: string; expiresAt: number } | null = null

/**
 * Get OAuth access token from Hostaway API
 * Uses client credentials flow
 */
async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token
  }

  const clientId = process.env.HOSTAWAY_CLIENT_ID
  const clientSecret = process.env.HOSTAWAY_CLIENT_SECRET
  const preGeneratedToken = process.env.HOSTAWAY_ACCESS_TOKEN

  // If pre-generated token is provided, use it
  if (preGeneratedToken) {
    return preGeneratedToken
  }

  if (!clientId || !clientSecret) {
    throw new Error(
      "Hostaway API credentials not configured. Please set HOSTAWAY_CLIENT_ID and HOSTAWAY_CLIENT_SECRET environment variables."
    )
  }

  try {
    // Hostaway API expects form-encoded data, not JSON
    const formData = new URLSearchParams()
    formData.append("grant_type", "client_credentials")
    formData.append("client_id", clientId)
    formData.append("client_secret", clientSecret)
    formData.append("scope", "general")

    const response = await fetch(HOSTAWAY_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: formData.toString(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Hostaway token request failed:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const data: HostawayAccessTokenResponse = await response.json()

    // Cache token with 5 minute buffer before expiration
    const expiresIn = (data.expires_in - 300) * 1000 // Convert to milliseconds and subtract 5 min
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + expiresIn,
    }

    return data.access_token
  } catch (error) {
    console.error("Error getting Hostaway access token:", error)
    throw error
  }
}

/**
 * Make an authenticated request to Hostaway API
 */
export async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken()

  const response = await fetch(`${HOSTAWAY_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Cache-control": "no-cache",
      Accept: "application/json",
    },
  })

  if (response.status === 429) {
    // Rate limit exceeded - wait and retry once
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return makeRequest<T>(endpoint, options)
  }

  if (!response.ok) {
    const errorData: HostawayError = await response.json().catch(() => ({
      status: "fail",
      message: `HTTP ${response.status}: ${response.statusText}`,
    }))
    throw new Error(errorData.message || `API request failed: ${response.statusText}`)
  }

  const data: HostawayApiResponse<T> = await response.json()

  if (data.status === "fail") {
    throw new Error(typeof data.result === "string" ? data.result : "API request failed")
  }

  // Log the response structure for debugging (only in development)
  if (process.env.NODE_ENV === "development" && endpoint.includes("/listings/")) {
    const result = data.result as any
    console.log("Hostaway API response structure:", {
      hasResult: !!result,
      resultKeys: result && typeof result === "object" ? Object.keys(result) : "not an object",
      hasListing: !!result?.listing,
      hasListingImage: !!result?.listingImage,
      hasListingImages: !!result?.listingImages,
      listingImageType: Array.isArray(result?.listingImage) ? "array" : typeof result?.listingImage,
      fullResult: JSON.stringify(result, null, 2), // Full result for debugging
    })
  }

  return data.result as T
}

/**
 * Fetch a single listing by ID
 */
export async function getListing(listingId: number): Promise<HostawayListingFull> {
  try {
    return await makeRequest<HostawayListingFull>(`/listings/${listingId}`)
  } catch (error) {
    console.error(`Error fetching listing ${listingId}:`, error)
    throw error
  }
}

/**
 * Fetch multiple listings by IDs
 */
export async function getListings(listingIds: number[]): Promise<HostawayListingFull[]> {
  try {
    // Hostaway API might support batch requests, but for now we'll fetch individually
    // with rate limiting awareness
    const results = await Promise.allSettled(
      listingIds.map((id) => getListing(id))
    )

    return results
      .filter((result): result is PromiseFulfilledResult<HostawayListingFull> => result.status === "fulfilled")
      .map((result) => result.value)
  } catch (error) {
    console.error("Error fetching listings:", error)
    throw error
  }
}

/**
 * Get listing images (already included in getListing, but kept for API completeness)
 */
export async function getListingImages(listingId: number) {
  const listing = await getListing(listingId)
  return listing.listingImage
}

/**
 * Get listing amenities (already included in getListing, but kept for API completeness)
 */
export async function getListingAmenities(listingId: number) {
  const listing = await getListing(listingId)
  return listing.listingAmenity
}

/**
 * Get listingMapId from listing ID
 * Helper function to get listingMapId needed for reservation creation
 */
export async function getListingMapId(listingId: number): Promise<number> {
  try {
    const listingData = await getListing(listingId)
    const listingMapId = (listingData as any).listing?.listingMap || (listingData as any).listingMap
    if (!listingMapId) {
      // Fallback: use listingId as listingMapId (they might be the same)
      return listingId
    }
    return listingMapId
  } catch (error) {
    console.error(`Error fetching listingMapId for listing ${listingId}:`, error)
    // Fallback: use listingId as listingMapId
    return listingId
  }
}

/**
 * Create a booking/reservation
 * @param bookingData - Booking request data
 * Note: Uses listingMapId (not listingId) and arrivalDate/departureDate (not startDate/endDate)
 */
export async function createBooking(bookingData: any): Promise<any> {
  try {
    // Use /reservations endpoint with forceOverbooking=1 query parameter
    const result = await makeRequest<any>("/reservations?forceOverbooking=1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    })
    console.log(`✅ Successfully created reservation`)
    return result
  } catch (error: any) {
    console.error(`❌ Failed to create reservation: ${error.message}`)
    throw error
  }
}

/**
 * Delete a booking/reservation
 * @param bookingId - The Hostaway booking/reservation ID
 */
export async function deleteBooking(bookingId: number): Promise<void> {
  try {
    // Try DELETE endpoint first
    try {
      await makeRequest<any>(`/reservations/${bookingId}`, {
        method: "DELETE",
      })
      console.log(`✅ Successfully deleted reservation ${bookingId}`)
      return
    } catch (error: any) {
      // If DELETE doesn't work, try updating status to cancelled
      console.log(`DELETE method failed, trying to cancel reservation: ${error.message}`)
      await makeRequest<any>(`/reservations/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "cancelled",
        }),
      })
      console.log(`✅ Successfully cancelled reservation ${bookingId}`)
    }
  } catch (error: any) {
    console.error(`❌ Failed to delete/cancel reservation ${bookingId}: ${error.message}`)
    throw error
  }
}

/**
 * Get calendar availability for a listing
 * @param listingId - The Hostaway listing ID
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 */
export async function getCalendarAvailability(
  listingId: number,
  startDate: string,
  endDate: string
): Promise<HostawayCalendarResponse> {
  try {
    const params = new URLSearchParams({
      startDate,
      endDate,
    })
    
    // Try the listing-specific calendar endpoint first
    try {
      const result = await makeRequest<any>(`/listings/${listingId}/calendar?${params.toString()}`)
      
      
      // If result is an array, convert it to object keyed by date
      if (Array.isArray(result)) {
        const calendarObj: HostawayCalendarResponse = {}
        for (const entry of result) {
          if (entry && entry.date) {
            
            // Hostaway API returns isAvailable field, not available
            // Map isAvailable to available for our internal format
            const mappedEntry = {
              ...entry,
              available: entry.isAvailable !== undefined ? entry.isAvailable : (entry.available !== undefined ? entry.available : 1)
            }
            calendarObj[entry.date] = mappedEntry
          }
        }
        return calendarObj
      }
      
      
      return result
    } catch (error: any) {
      // If that fails, try the general calendar endpoint
      console.warn(`Listing-specific calendar endpoint failed, trying general calendar endpoint:`, error.message)
      const generalParams = new URLSearchParams({
        listingId: listingId.toString(),
        startDate,
        endDate,
      })
      const result = await makeRequest<HostawayCalendarResponse>(`/calendar?${generalParams.toString()}`)
      
      // If result is an array, convert it to object keyed by date
      if (Array.isArray(result)) {
        const calendarObj: HostawayCalendarResponse = {}
        for (const entry of result) {
          if (entry && entry.date) {
            calendarObj[entry.date] = entry
          }
        }
        return calendarObj
      }
      
      return result
    }
  } catch (error: any) {
    console.error(`Error fetching calendar for listing ${listingId}:`, error.message)
    // Return empty calendar object instead of throwing, so caller can handle gracefully
    return {}
  }
}

/**
 * Get pricing for a listing
 * @param listingId - The Hostaway listing ID
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @param guests - Number of guests
 */
export async function getPricing(
  listingId: number,
  startDate: string,
  endDate: string,
  guests: number
): Promise<HostawayPricingResponse> {
  try {
    // Try listing-specific pricing endpoint first
    const params = new URLSearchParams({
      startDate,
      endDate,
      guests: guests.toString(),
    })
    
    try {
      const result = await makeRequest<HostawayPricingResponse>(`/listings/${listingId}/pricing?${params.toString()}`)
      return result
    } catch (error: any) {
      // If that fails, try the general pricing endpoint
      console.warn(`Listing-specific pricing endpoint failed, trying general pricing endpoint:`, error.message)
      const generalParams = new URLSearchParams({
        listingId: listingId.toString(),
        startDate,
        endDate,
        guests: guests.toString(),
      })
      return await makeRequest<HostawayPricingResponse>(`/pricing?${generalParams.toString()}`)
    }
  } catch (error: any) {
    console.error(`Error fetching pricing for listing ${listingId}:`, error.message)
    // Return a response indicating unavailable
    return {
      listingId,
      startDate,
      endDate,
      guests,
      available: false,
      breakdown: {
        nights: 0,
        nightlyRate: 0,
        subtotal: 0,
        total: 0,
        currency: 'USD',
      },
    }
  }
}
