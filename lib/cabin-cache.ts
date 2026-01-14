import { unstable_cache } from "next/cache"
import { getListing } from "@/lib/hostaway"
import { transformHostawayListingToCabin } from "@/lib/hostaway-transform"
import { getListingIdBySlug, LISTING_ID_MAP } from "@/lib/listing-map"
import type { Cabin } from "@/lib/cabins"
import { cabins } from "@/lib/cabins"

// Cache duration: 1 hour (3600 seconds) in production, false in development to disable caching
const CACHE_DURATION = process.env.NODE_ENV === "development" ? false : 3600

/**
 * Get cabin data from Hostaway API with caching
 * Falls back to static data if API fails
 */
export async function getCabinFromHostaway(slug: string): Promise<Cabin | null> {
  const listingId = getListingIdBySlug(slug)

  if (!listingId) {
    console.warn(`No listing ID found for slug: ${slug}`)
    return null
  }

  try {
    // Use Next.js unstable_cache for server-side caching
    const cachedFetch = unstable_cache(
      async () => {
        console.log(`[${slug}] Fetching from Hostaway API for listing ID ${listingId}`)
        const hostawayData = await getListing(listingId)
        console.log(`[${slug}] Successfully fetched from Hostaway API`)
        const transformed = transformHostawayListingToCabin(hostawayData, slug)
        console.log(`[${slug}] Transformed cabin data - name: ${transformed.name}, subtitle: ${transformed.subtitle || 'none'}`)
        return transformed
      },
      [`cabin-${slug}-${listingId}`],
      {
        revalidate: CACHE_DURATION,
        tags: [`cabin-${slug}`],
      }
    )

    return await cachedFetch()
  } catch (error) {
    console.error(`[${slug}] Error fetching cabin from Hostaway:`, error)
    console.error(`[${slug}] Error details:`, error instanceof Error ? error.message : String(error))
    // Fall back to static data - ensure it has images
    const staticCabin = cabins.find((c) => c.slug === slug)
    if (staticCabin) {
      console.log(`[${slug}] Falling back to static data`)
      if (!staticCabin.images || staticCabin.images.length === 0) {
        console.warn(`[${slug}] Static cabin has no images, using placeholder`)
        staticCabin.images = ["/placeholder.svg"]
      }
      // Return a copy to avoid mutating the original
      return { ...staticCabin }
    }
    return null
  }
}

/**
 * Get all cabins from Hostaway API with caching
 * Falls back to static data if API fails
 */
export async function getAllCabinsFromHostaway(): Promise<Cabin[]> {
  const slugs = Object.entries(LISTING_ID_MAP).map(([slug, listingId]) => ({
    slug,
    listingId,
  }))

  if (slugs.length === 0) {
    console.warn("No listing IDs configured, falling back to static data")
    return cabins
  }

  try {
    // Use Next.js unstable_cache for server-side caching
    const cachedFetch = unstable_cache(
      async () => {
        const results = await Promise.allSettled(
          slugs.map(({ slug, listingId }) =>
            getListing(listingId).then((data) => transformHostawayListingToCabin(data, slug))
          )
        )

        return results
          .filter((result): result is PromiseFulfilledResult<Cabin> => result.status === "fulfilled")
          .map((result) => result.value)
      },
      ["all-cabins-hostaway"],
      {
        revalidate: CACHE_DURATION,
        tags: ["all-cabins"],
      }
    )

    const hostawayCabins = await cachedFetch()

    // If we got fewer cabins than expected, fill in with static data
    if (hostawayCabins.length < slugs.length) {
      const hostawaySlugs = new Set(hostawayCabins.map((c) => c.slug))
      const missingCabins = cabins.filter((c) => !hostawaySlugs.has(c.slug))
      return [...hostawayCabins, ...missingCabins]
    }

    return hostawayCabins
  } catch (error) {
    console.error("Error fetching all cabins from Hostaway:", error)
    // Fall back to static data
    return cabins
  }
}

/**
 * Invalidate cache for a specific cabin
 */
export function invalidateCabinCache(slug: string) {
  // Note: Next.js cache invalidation requires revalidation tags
  // This would typically be called from an API route or server action
  // For now, we rely on the revalidate time
}
