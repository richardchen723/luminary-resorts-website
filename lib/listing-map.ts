/**
 * Mapping of cabin slugs to Hostaway listing IDs
 */
export const LISTING_ID_MAP: Record<string, number> = {
  dew: 472341,
  sol: 472340,
  mist: 472339,
  moss: 472338,
}

/**
 * Reverse mapping: Hostaway listing ID to cabin slug
 */
export const SLUG_BY_LISTING_ID: Record<number, string> = Object.fromEntries(
  Object.entries(LISTING_ID_MAP).map(([slug, id]) => [id, slug])
)

/**
 * Get listing ID for a cabin slug
 */
export function getListingIdBySlug(slug: string): number | undefined {
  return LISTING_ID_MAP[slug]
}

/**
 * Get cabin slug for a listing ID
 */
export function getSlugByListingId(listingId: number): string | undefined {
  return SLUG_BY_LISTING_ID[listingId]
}

/**
 * Get all known listing IDs
 */
export function getAllListingIds(): number[] {
  return Object.values(LISTING_ID_MAP)
}
