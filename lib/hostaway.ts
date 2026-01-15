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
 * Create an inquiry in Hostaway
 * @param inquiryData - Inquiry request data
 * Note: Uses listingMapId (not listingId) and arrivalDate/departureDate (not startDate/endDate)
 * Status must be lowercase "inquiry" (not "Inquiry")
 */
export async function createInquiry(inquiryData: {
  listingId: number
  checkIn: string // YYYY-MM-DD
  checkOut: string // YYYY-MM-DD
  guests: number
  adults: number
  pets?: number
  infants?: number
  guestInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  message: string // Required - will be posted to Hostaway inbox
}): Promise<{ id: number; hostawayReservationId: string; messageId?: number }> {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/hostaway.ts:257',message:'createInquiry - message received in function',data:{message:inquiryData.message,messageLength:inquiryData.message?.length||0,messageType:typeof inquiryData.message,hasMessage:!!inquiryData.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    // Get listingMapId from listingId
    const listingMapId = await getListingMapId(inquiryData.listingId)

    // Normalize phone number (ensure it has country code prefix)
    const normalizePhoneNumber = (phone: string): string => {
      if (!phone) return ""
      
      // Remove all formatting except + and digits
      const cleaned = phone.replace(/[^\d+]/g, "")
      
      // If it already starts with +, return as is (international format)
      if (cleaned.startsWith("+")) {
        return cleaned
      }
      
      // If it's 10 digits, assume US/Canada and add +1
      if (/^\d{10}$/.test(cleaned)) {
        return `+1${cleaned}`
      }
      
      // If it's 11 digits starting with 1, add +
      if (/^1\d{10}$/.test(cleaned)) {
        return `+${cleaned}`
      }
      
      // Otherwise, try to add +1 as default (US)
      return `+1${cleaned}`
    }

    const normalizedPhone = normalizePhoneNumber(inquiryData.guestInfo.phone)

    // Build inquiry payload
    const inquiryPayload: any = {
      channelId: 2000, // Direct booking channel
      listingMapId,
      arrivalDate: inquiryData.checkIn,
      departureDate: inquiryData.checkOut,
      numberOfGuests: inquiryData.guests,
      adults: inquiryData.adults,
      children: null,
      infants: inquiryData.infants || null,
      pets: inquiryData.pets || null,
      guestFirstName: inquiryData.guestInfo.firstName,
      guestLastName: inquiryData.guestInfo.lastName,
      guestName: `${inquiryData.guestInfo.firstName} ${inquiryData.guestInfo.lastName}`,
      guestEmail: inquiryData.guestInfo.email,
      guestZipCode: inquiryData.guestInfo.zipCode || "",
      guestAddress: inquiryData.guestInfo.address || "",
      guestCity: inquiryData.guestInfo.city || "",
      guestCountry: inquiryData.guestInfo.country || "US",
      phone: normalizedPhone,
      totalPrice: 0, // Inquiries don't have pricing
      currency: "USD",
      isPaid: 0, // Not paid for inquiry
      isManuallyChecked: 0,
      isInitial: 0,
      status: "inquiry", // Lowercase "inquiry" is required
      comment: inquiryData.message ? inquiryData.message.trim() : "", // Always include comment field
      guestNote: inquiryData.message ? inquiryData.message.trim() : "", // Also set guestNote for UI display
    }

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/hostaway.ts:320',message:'createInquiry - comment and guestNote fields in payload before API call',data:{comment:inquiryPayload.comment,commentLength:inquiryPayload.comment.length,guestNote:inquiryPayload.guestNote,guestNoteLength:inquiryPayload.guestNote.length,hasComment:!!inquiryPayload.comment,hasGuestNote:!!inquiryPayload.guestNote,originalMessage:inquiryData.message,messageTrimmed:inquiryData.message?.trim()},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'H'})}).catch(()=>{});
    // #endregion

    // Log the payload to debug (excluding sensitive data)
    console.log("Creating inquiry with payload:", {
      ...inquiryPayload,
      phone: inquiryPayload.phone ? `${inquiryPayload.phone.substring(0, 4)}...` : "",
      comment: inquiryPayload.comment ? `"${inquiryPayload.comment.substring(0, 50)}${inquiryPayload.comment.length > 50 ? '...' : ''}"` : "(empty)",
    })
    const result = await makeRequest<any>("/reservations?forceOverbooking=1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inquiryPayload),
    })

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/hostaway.ts:338',message:'createInquiry - Hostaway API response received',data:{inquiryId:result.id,hostawayReservationId:result.hostawayReservationId,responseComment:result.comment,responseCommentLength:result.comment?.length||0,responseGuestNote:result.guestNote,responseGuestNoteLength:result.guestNote?.length||0,hasResponseComment:!!result.comment,hasResponseGuestNote:!!result.guestNote,responseKeys:Object.keys(result)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'I'})}).catch(()=>{});
    // #endregion

    console.log(`✅ Successfully created inquiry for ${inquiryData.guestInfo.email}`)
    
    const reservationId = typeof result.id === 'number' ? result.id : parseInt(result.hostawayReservationId || result.id?.toString() || "0")
    
    // Add message to conversation if message is provided
    let messageId: number | null = null
    if (inquiryData.message && inquiryData.message.trim()) {
      try {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/hostaway.ts:348',message:'createInquiry - Attempting to add message to conversation',data:{reservationId,message:inquiryData.message.trim(),messageLength:inquiryData.message.trim().length},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'J'})}).catch(()=>{});
        // #endregion
        
        const messageResult = await addMessageToConversation(
          reservationId,
          inquiryData.message.trim(),
          1 // isIncoming: 1 = from guest
        )
        messageId = messageResult.messageId
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/hostaway.ts:360',message:'createInquiry - Message added to conversation successfully',data:{messageId,reservationId},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'K'})}).catch(()=>{});
        // #endregion
        
        console.log(`✅ Message added to conversation (Message ID: ${messageId})`)
      } catch (messageError: any) {
        // Log error but don't fail the inquiry creation
        console.warn(`⚠️  Failed to add message to conversation: ${messageError.message}`)
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/hostaway.ts:367',message:'createInquiry - Failed to add message to conversation',data:{error:messageError.message,reservationId},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'L'})}).catch(()=>{});
        // #endregion
      }
    }
    
    return {
      id: typeof result.id === 'number' ? result.id : parseInt(result.hostawayReservationId || result.id?.toString() || "0"),
      hostawayReservationId: (result.id || result.hostawayReservationId)?.toString() || "",
      messageId: messageId || undefined,
    }
  } catch (error: any) {
    console.error(`❌ Failed to create inquiry: ${error.message}`)
    throw error
  }
}

/**
 * Add a message to a Hostaway conversation
 * @param reservationId - The reservation/inquiry ID
 * @param message - The message text
 * @param isIncoming - 1 for messages from guest, 0 for messages from host (default: 1)
 * @returns Message ID
 */
export async function addMessageToConversation(
  reservationId: number,
  message: string,
  isIncoming: number = 1
): Promise<{ messageId: number }> {
  // Wait for conversation to be created (may take 1-2 seconds)
  let conversationId: number | null = null
  let attempts = 0
  const maxAttempts = 10
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/hostaway.ts:388',message:'addMessageToConversation - Starting conversation lookup',data:{reservationId,messageLength:message.length,isIncoming,maxAttempts},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'M'})}).catch(()=>{});
  // #endregion
  
  while (attempts < maxAttempts && !conversationId) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    attempts++
    
    try {
      const conversations = await makeRequest<any[]>(
        `/conversations?reservationId=${reservationId}`,
        { method: "GET" }
      )
      
      if (conversations.length > 0) {
        conversationId = conversations[0].id
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/hostaway.ts:402',message:'addMessageToConversation - Conversation found',data:{conversationId,reservationId,attempts},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'N'})}).catch(()=>{});
        // #endregion
        break
      }
    } catch (error: any) {
      // Continue retrying
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/hostaway.ts:410',message:'addMessageToConversation - Retry attempt',data:{attempts,error:error.message,reservationId},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'O'})}).catch(()=>{});
      // #endregion
    }
  }
  
  if (!conversationId) {
    const error = new Error(`No conversation found for reservation ${reservationId} after ${maxAttempts} attempts`)
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/hostaway.ts:417',message:'addMessageToConversation - Conversation not found',data:{reservationId,maxAttempts},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'P'})}).catch(()=>{});
    // #endregion
    throw error
  }
  
  // Add message to conversation
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/hostaway.ts:423',message:'addMessageToConversation - Creating message',data:{conversationId,reservationId,messageLength:message.length,isIncoming},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'Q'})}).catch(()=>{});
  // #endregion
  
  try {
    const messageResult = await makeRequest<any>(
      `/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: message,
          isIncoming: isIncoming,
        }),
      }
    )
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/hostaway.ts:442',message:'addMessageToConversation - Message created successfully',data:{messageId:messageResult.id,conversationId,reservationId,status:messageResult.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'R'})}).catch(()=>{});
    // #endregion
    
    return {
      messageId: messageResult.id,
    }
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/hostaway.ts:450',message:'addMessageToConversation - Failed to create message',data:{error:error.message,conversationId,reservationId},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'S'})}).catch(()=>{});
    // #endregion
    throw new Error(`Failed to add message to conversation: ${error.message}`)
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
