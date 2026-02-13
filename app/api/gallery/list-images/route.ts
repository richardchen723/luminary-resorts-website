import { NextResponse } from "next/server"
import { getListing } from "@/lib/hostaway"
import { LISTING_ID_MAP } from "@/lib/listing-map"
import { IMAGE_CATEGORY_MAP } from "@/lib/gallery-categories"

type ImageCategory = "exterior" | "interior" | "nature" | "details"

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

/**
 * API route to list all images for manual categorization
 * Visit: http://localhost:3000/api/gallery/list-images
 */
export async function GET() {
  try {
    const categoryByNormalizedUrl = new Map<string, ImageCategory>()
    const categoryByUuid = new Map<string, ImageCategory>()
    const categoryByCabinIndex = new Map<string, Map<number, ImageCategory>>()
    const categoryByCabinSequence = new Map<string, ImageCategory[]>()

    IMAGE_CATEGORY_MAP.forEach((mapping) => {
      const normalized = normalizeImageUrl(mapping.url)
      if (!categoryByNormalizedUrl.has(normalized)) {
        categoryByNormalizedUrl.set(normalized, mapping.category)
      }

      const uuid = extractImageUuid(mapping.url)
      if (uuid && !categoryByUuid.has(uuid)) {
        categoryByUuid.set(uuid, mapping.category)
      }

      if (typeof mapping.index === "number") {
        const byIndex = categoryByCabinIndex.get(mapping.cabinSlug) || new Map<number, ImageCategory>()
        if (!byIndex.has(mapping.index)) {
          byIndex.set(mapping.index, mapping.category)
        }
        categoryByCabinIndex.set(mapping.cabinSlug, byIndex)
      } else {
        const sequence = categoryByCabinSequence.get(mapping.cabinSlug) || []
        sequence.push(mapping.category)
        categoryByCabinSequence.set(mapping.cabinSlug, sequence)
      }
    })

    const allImages: Array<{
      url: string
      cabinSlug: string
      caption: string | null
      bookingEngineCaption: string | null
      index: number
      category: ImageCategory | null
    }> = []

    for (const [slug, listingId] of Object.entries(LISTING_ID_MAP)) {
      try {
        const listingData = await getListing(listingId)
        const listingImages =
          listingData.listingImage ||
          (listingData as any).listingImages ||
          (listingData as any).listing?.listingImage ||
          []

        listingImages
          .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
          .forEach((img: any, index: number) => {
            if (img.url && !img.url.includes("placeholder")) {
              const normalizedUrl = normalizeImageUrl(img.url)
              const uuid = extractImageUuid(img.url)
              const category =
                categoryByNormalizedUrl.get(normalizedUrl) ||
                (uuid ? categoryByUuid.get(uuid) : undefined) ||
                categoryByCabinIndex.get(slug)?.get(index) ||
                categoryByCabinSequence.get(slug)?.[index] ||
                null

              allImages.push({
                url: img.url,
                cabinSlug: slug,
                caption: img.caption,
                bookingEngineCaption: img.bookingEngineCaption,
                index,
                category,
              })
            }
          })
      } catch (error) {
        console.error(`Error fetching images for ${slug}:`, error)
      }
    }

    // Generate TypeScript code for the hardcoded mapping
    const codeOutput = allImages
      .map((img) => {
        const caption = img.caption || img.bookingEngineCaption || "No caption"
        const category = img.category || "exterior"
        return `  // ${img.cabinSlug} - Image ${img.index + 1}: ${caption}\n  { url: "${img.url}", category: "${category}", cabinSlug: "${img.cabinSlug}" },`
      })
      .join("\n")

    return NextResponse.json(
      {
        totalImages: allImages.length,
        images: allImages,
        codeOutput: `export const IMAGE_CATEGORY_MAP: ImageCategoryMapping[] = [\n${codeOutput}\n]`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error listing images:", error)
    return NextResponse.json({ error: "Failed to list images" }, { status: 500 })
  }
}
