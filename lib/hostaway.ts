import type {
  HostawayApiResponse,
  HostawayListingFull,
  HostawayAccessTokenResponse,
  HostawayError,
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
async function makeRequest<T>(
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
