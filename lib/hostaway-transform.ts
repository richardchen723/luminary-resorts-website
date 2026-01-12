import type { HostawayListingFull } from "@/types/hostaway"
import type { Cabin } from "@/lib/cabins"

/**
 * Format time from hour (0-23) to "HH:MM AM/PM" format
 */
function formatTime(hour: number): string {
  if (hour === 0) return "12:00 AM"
  if (hour < 12) return `${hour}:00 AM`
  if (hour === 12) return "12:00 PM"
  return `${hour - 12}:00 PM`
}

/**
 * Extract preview description (first part before "Breathe. Unplug. Come back to love")
 */
function extractPreviewDescription(fullDescription: string): string {
  const splitPoint = "Breathe. Unplug. Come back to love"
  const index = fullDescription.indexOf(splitPoint)
  if (index !== -1) {
    return fullDescription.substring(0, index + splitPoint.length)
  }
  // If split point not found, return first 200 characters
  return fullDescription.substring(0, 200) + (fullDescription.length > 200 ? "..." : "")
}

/**
 * Transform Hostaway listing data to Cabin interface
 */
export function transformHostawayListingToCabin(
  hostawayData: HostawayListingFull | any,
  slug: string
): Cabin {
  // The API might return the listing data directly or nested
  // Check if listing is nested or at top level
  let listing: any
  let listingImages: any[]
  let listingAmenities: any[]

  // Try multiple possible response structures
  if (hostawayData.listing) {
    // Standard structure: data is nested under 'listing'
    listing = hostawayData.listing
    listingImages = hostawayData.listingImage || hostawayData.listingImages || []
    listingAmenities = hostawayData.listingAmenity || []
  } else if ((hostawayData as any).id && (hostawayData as any).name) {
    // Alternative structure: listing data might be at top level
    listing = hostawayData
    listingImages = (hostawayData as any).listingImage || (hostawayData as any).listingImages || (hostawayData as any).images || []
    listingAmenities = (hostawayData as any).listingAmenity || (hostawayData as any).amenities || []
  } else if ((hostawayData as any).result && (hostawayData as any).result.listing) {
    // Response wrapped in a 'result' field
    listing = (hostawayData as any).result.listing
    listingImages = (hostawayData as any).result.listingImage || (hostawayData as any).result.listingImages || []
    listingAmenities = (hostawayData as any).result.listingAmenity || []
  } else {
    // Log the actual structure for debugging
    const errorInfo = {
      keys: Object.keys(hostawayData),
      sample: JSON.stringify(hostawayData, null, 2).substring(0, 3000),
    }
    console.error("Unexpected Hostaway response structure:", errorInfo)
    throw new Error(`Hostaway API response has unexpected structure. Keys: ${errorInfo.keys.join(", ")}`)
  }

  if (!listing) {
    console.error("Hostaway response structure:", {
      keys: Object.keys(hostawayData),
      fullData: JSON.stringify(hostawayData, null, 2).substring(0, 3000),
    })
    throw new Error("Hostaway API response missing listing data. Check console for response structure.")
  }

  // Log the actual structure for debugging if images are missing
  if (!listingImages || listingImages.length === 0) {
    console.warn("No listing images found in Hostaway response:", {
      keys: Object.keys(hostawayData),
      hasListing: !!listing,
      listingImageType: typeof listingImages,
    })
  }

  const images = Array.isArray(listingImages)
    ? listingImages
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map((img) => (img.url || img))
        .filter((url) => url && typeof url === "string") // Filter out any empty URLs
    : []
  const amenities = Array.isArray(listingAmenities)
    ? listingAmenities
        .filter((la) => la.isPresent === 1 || la.isPresent === true)
        .map((la) => (la.amenity?.name || la.name || la))
        .filter((name): name is string => typeof name === "string" && !!name)
        .sort()
    : []

  // Format occupancy - use personCapacity or fallback to guestsIncluded
  const personCapacity = listing.personCapacity ?? listing.guestsIncluded ?? 2
  const occupancy = `${personCapacity} guest${personCapacity !== 1 ? "s" : ""}`

  // Format check-in/check-out times - handle missing values
  const checkInHour = listing.checkInTimeStart ?? 16 // Default to 4 PM
  const checkOutHour = listing.checkOutTime ?? 11 // Default to 11 AM
  const checkIn = formatTime(checkInHour)
  const checkOut = formatTime(checkOutHour)

  // Extract description
  const fullDescription = listing.description || ""
  const previewDescription = extractPreviewDescription(fullDescription)

  // Generate cabin ID from slug (e.g., "dew" -> "02")
  // This is a simple mapping - you may want to adjust based on your needs
  const cabinIdMap: Record<string, string> = {
    dew: "02",
    sol: "03",
    mist: "04",
    moss: "01",
  }

  // Extract name and subtitle from listing name
  // Try multiple formats: "Name: Subtitle", "Name - Subtitle", or just use the full name
  // Log the listing name for debugging
  if (process.env.NODE_ENV === "development") {
    console.log(`[${slug}] Hostaway listing name:`, listing.name)
    console.log(`[${slug}] Full listing object keys:`, Object.keys(listing))
  }
  
  let cabinName: string
  let subtitle: string | undefined
  
  // Try colon separator first (most common)
  if (listing.name.includes(":")) {
    const nameParts = listing.name.split(":")
    cabinName = nameParts[0]?.trim() || listing.name
    subtitle = nameParts.length > 1 ? nameParts.slice(1).join(":").trim() : undefined
  }
  // Try dash separator
  else if (listing.name.includes(" - ")) {
    const nameParts = listing.name.split(" - ")
    cabinName = nameParts[0]?.trim() || listing.name
    subtitle = nameParts.length > 1 ? nameParts.slice(1).join(" - ").trim() : undefined
  }
  // If no separator, check if name matches known cabin names
  else {
    const knownCabins = ["Sol", "Dew", "Mist", "Moss"]
    const isKnownCabin = knownCabins.some(name => listing.name.trim().startsWith(name))
    if (isKnownCabin) {
      // If it starts with a known cabin name, use that as name and rest as subtitle
      const match = knownCabins.find(name => listing.name.trim().startsWith(name))
      if (match) {
        cabinName = match
        subtitle = listing.name.replace(match, "").trim()
        // Remove leading separators
        subtitle = subtitle.replace(/^[:\-\s]+/, "").trim() || undefined
      } else {
        cabinName = listing.name
        subtitle = undefined
      }
    } else {
      cabinName = listing.name
      subtitle = undefined
    }
  }
  
  if (process.env.NODE_ENV === "development") {
    console.log(`[${slug}] Extracted cabin name:`, cabinName, "subtitle:", subtitle)
  }

  return {
    id: cabinIdMap[slug] || slug,
    name: cabinName,
    slug: slug,
    description: previewDescription,
    fullDescription: fullDescription || undefined,
    subtitle: subtitle,
    images: images.length > 0 ? images : ["/placeholder.svg"],
    occupancy: occupancy,
    amenities: amenities.length > 0 ? amenities : [],
    checkIn: checkIn,
    checkOut: checkOut,
    minimumStay: "2 nights", // Default, can be extracted from Hostaway if available
  }
}

/**
 * Transform multiple Hostaway listings to Cabin array
 */
export function transformHostawayListingsToCabins(
  hostawayData: HostawayListingFull[],
  slugMap: Map<number, string>
): Cabin[] {
  return hostawayData
    .map((data) => {
      const slug = slugMap.get(data.listing.id)
      if (!slug) {
        console.warn(`No slug found for listing ID ${data.listing.id}`)
        return null
      }
      return transformHostawayListingToCabin(data, slug)
    })
    .filter((cabin): cabin is Cabin => cabin !== null)
}
