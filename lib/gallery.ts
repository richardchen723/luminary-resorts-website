import { getAllCabinsFromHostaway } from "@/lib/cabin-cache"
import { getListing } from "@/lib/hostaway"
import { LISTING_ID_MAP } from "@/lib/listing-map"
import { IMAGE_CATEGORY_MAP } from "@/lib/gallery-categories"
import type { Cabin } from "@/lib/cabins"
import type { HostawayListingImage } from "@/types/hostaway"

export interface GalleryImage {
  src: string
  category: "exterior" | "interior" | "nature" | "details"
  cabinName: string
}

type GalleryCategory = GalleryImage["category"]

const CATEGORY_LIMITS: Record<GalleryCategory, number> = {
  exterior: 10,
  interior: 10,
  nature: 5,
  details: 5,
}

const CATEGORY_KEYWORDS: Record<GalleryCategory, string[]> = {
  exterior: ["exterior", "outside", "front", "backyard", "patio", "deck", "sunset", "view", "outdoor"],
  interior: ["interior", "inside", "bedroom", "bathroom", "kitchen", "living", "sofa", "shower", "tub"],
  nature: ["nature", "forest", "trees", "lake", "river", "mountain", "landscape", "bird", "greenery"],
  details: ["detail", "amenity", "coffee", "decor", "closeup", "close-up", "feature"],
}

function normalizeImageUrl(url: string): string {
  try {
    const parsed = new URL(url)
    return `${parsed.origin}${parsed.pathname}`.toLowerCase()
  } catch {
    return url.split("?")[0].toLowerCase()
  }
}

function extractImageUuid(url: string): string | null {
  const match = url.toLowerCase().match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)
  return match ? match[0] : null
}

function inferCategoryFromText(text: string): GalleryCategory {
  const value = text.toLowerCase()

  const categoryPriority: GalleryCategory[] = ["nature", "interior", "details", "exterior"]
  for (const category of categoryPriority) {
    if (CATEGORY_KEYWORDS[category].some((keyword) => value.includes(keyword))) {
      return category
    }
  }

  // Exterior is the safest default for hero/gallery composition.
  return "exterior"
}

function dedupeImages(images: GalleryImage[]): GalleryImage[] {
  const seen = new Set<string>()
  const deduped: GalleryImage[] = []

  images.forEach((img) => {
    const key = normalizeImageUrl(img.src)
    if (seen.has(key)) return
    seen.add(key)
    deduped.push(img)
  })

  return deduped
}

function selectBalancedImages(images: GalleryImage[]): GalleryImage[] {
  const grouped: Record<GalleryCategory, GalleryImage[]> = {
    exterior: [],
    interior: [],
    nature: [],
    details: [],
  }

  images.forEach((img) => {
    grouped[img.category].push(img)
  })

  const selected = Object.entries(CATEGORY_LIMITS).flatMap(([category, limit]) =>
    grouped[category as GalleryCategory].slice(0, limit)
  )

  const selectedKeys = new Set(selected.map((img) => normalizeImageUrl(img.src)))
  const remaining = images.filter((img) => !selectedKeys.has(normalizeImageUrl(img.src)))

  remaining.forEach((img) => {
    const category = img.category
    if (grouped[category].length < CATEGORY_LIMITS[category]) {
      grouped[category].push(img)
    }
  })

  return [
    ...grouped.exterior.slice(0, CATEGORY_LIMITS.exterior),
    ...grouped.interior.slice(0, CATEGORY_LIMITS.interior),
    ...grouped.nature.slice(0, CATEGORY_LIMITS.nature),
    ...grouped.details.slice(0, CATEGORY_LIMITS.details),
  ]
}

function buildFallbackImagesFromCabins(allCabins: Cabin[]): GalleryImage[] {
  const fallbackImages: GalleryImage[] = []

  allCabins.forEach((cabin) => {
    cabin.images
      .filter((src) => src && !src.includes("placeholder"))
      .forEach((src) => {
        const category = inferCategoryFromText(`${cabin.name} ${src}`)
        fallbackImages.push({
          src,
          category,
          cabinName: cabin.name,
        })
      })
  })

  if (fallbackImages.length > 0) {
    return dedupeImages(fallbackImages)
  }

  return dedupeImages(
    IMAGE_CATEGORY_MAP.map((img) => ({
      src: img.url,
      category: img.category,
      cabinName: img.cabinSlug,
    }))
  )
}

/**
 * Get all images from Hostaway for the gallery
 * Uses image captions when available for accurate categorization
 */
export async function getGalleryImages(): Promise<{
  bannerImage: string
  images: GalleryImage[]
}> {
  try {
    const allCabins = await getAllCabinsFromHostaway()
    const cabinNameMap = new Map<string, string>()
    allCabins.forEach((cabin) => {
      cabinNameMap.set(cabin.slug, cabin.name)
    })

    const categoryByNormalizedUrl = new Map<string, { category: GalleryCategory; cabinSlug: string }>()
    const categoryByUuid = new Map<string, { category: GalleryCategory; cabinSlug: string }>()
    const categoryByCabinIndex = new Map<string, Map<number, GalleryCategory>>()
    const categoryByCabinSequence = new Map<string, GalleryCategory[]>()

    IMAGE_CATEGORY_MAP.forEach((mapping) => {
      const normalized = normalizeImageUrl(mapping.url)
      if (!categoryByNormalizedUrl.has(normalized)) {
        categoryByNormalizedUrl.set(normalized, {
          category: mapping.category,
          cabinSlug: mapping.cabinSlug,
        })
      }

      const uuid = extractImageUuid(mapping.url)
      if (uuid && !categoryByUuid.has(uuid)) {
        categoryByUuid.set(uuid, {
          category: mapping.category,
          cabinSlug: mapping.cabinSlug,
        })
      }

      if (typeof mapping.index === "number") {
        const byIndex = categoryByCabinIndex.get(mapping.cabinSlug) || new Map<number, GalleryCategory>()
        if (!byIndex.has(mapping.index)) {
          byIndex.set(mapping.index, mapping.category)
        }
        categoryByCabinIndex.set(mapping.cabinSlug, byIndex)
      } else {
        // Legacy mappings without index use order as fallback.
        const sequence = categoryByCabinSequence.get(mapping.cabinSlug) || []
        sequence.push(mapping.category)
        categoryByCabinSequence.set(mapping.cabinSlug, sequence)
      }
    })

    // Get full image data with captions from Hostaway
    const allImagesWithMetadata: Array<{
      url: string
      cabinName: string
      cabinSlug: string
      index: number
      caption: string | null
      bookingEngineCaption: string | null
    }> = []

    // Fetch full listing data to get image metadata
    for (const [slug, listingId] of Object.entries(LISTING_ID_MAP)) {
      try {
        const listingData = await getListing(listingId)
        const listingImages =
          listingData.listingImage ||
          (listingData as any).listingImages ||
          (listingData as any).listing?.listingImage ||
          []

        // Get cabin name
        const cabinName = cabinNameMap.get(slug) || slug

        listingImages
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          .forEach((img: HostawayListingImage, index: number) => {
            if (img.url && !img.url.includes("placeholder")) {
              allImagesWithMetadata.push({
                url: img.url,
                cabinName,
                cabinSlug: slug,
                index,
                caption: img.caption,
                bookingEngineCaption: img.bookingEngineCaption,
              })
            }
          })
      } catch (error) {
        console.error(`Error fetching images for ${slug}:`, error)
      }
    }

    // Categorize images using explicit mappings only (URL/UUID/index).
    // This keeps the website categories aligned with the categorization tool.
    const categorizedImages = dedupeImages(
      allImagesWithMetadata
      .map((img) => {
        const normalizedUrl = normalizeImageUrl(img.url)
        const uuid = extractImageUuid(img.url)

        const mapped =
          categoryByNormalizedUrl.get(normalizedUrl) ||
          (uuid ? categoryByUuid.get(uuid) : undefined)
        const categoryFromIndex = categoryByCabinIndex.get(img.cabinSlug)?.get(img.index)
        const categoryFromSequence = categoryByCabinSequence.get(img.cabinSlug)?.[img.index]

        const category = mapped?.category || categoryFromIndex || categoryFromSequence
        if (!category) {
          return null
        }

        const cabinSlug = mapped?.cabinSlug || img.cabinSlug
        const cabinName = cabinNameMap.get(cabinSlug) || img.cabinName

        return {
          src: img.url,
          category,
          cabinName,
        }
      })
      .filter((img): img is GalleryImage => img !== null)
    )

    let finalImages = selectBalancedImages(categorizedImages)

    if (finalImages.length === 0) {
      finalImages = selectBalancedImages(buildFallbackImagesFromCabins(allCabins))
    }

    const bannerImage =
      finalImages.find((img) => img.category === "exterior")?.src ||
      finalImages[0]?.src ||
      ""

    return {
      bannerImage,
      images: finalImages,
    }
  } catch (error) {
    console.error("Error fetching gallery images from Hostaway:", error)
    const fallbackImages = selectBalancedImages(
      dedupeImages(
        IMAGE_CATEGORY_MAP.map((img) => ({
          src: img.url,
          category: img.category,
          cabinName: img.cabinSlug,
        }))
      )
    )

    return {
      bannerImage:
        fallbackImages.find((img) => img.category === "exterior")?.src ||
        fallbackImages[0]?.src ||
        "",
      images: fallbackImages,
    }
  }
}
