import { NextResponse } from "next/server"
import { getListing } from "@/lib/hostaway"
import { LISTING_ID_MAP } from "@/lib/listing-map"

/**
 * API route to list all images for manual categorization
 * Visit: http://localhost:3000/api/gallery/list-images
 */
export async function GET() {
  try {
    const allImages: Array<{
      url: string
      cabinSlug: string
      caption: string | null
      bookingEngineCaption: string | null
      index: number
    }> = []

    for (const [slug, listingId] of Object.entries(LISTING_ID_MAP)) {
      try {
        const listingData = await getListing(listingId)
        const listingImages = listingData.listingImage || listingData.listingImages || []

        listingImages
          .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
          .forEach((img: any, index: number) => {
            if (img.url && !img.url.includes("placeholder")) {
              allImages.push({
                url: img.url,
                cabinSlug: slug,
                caption: img.caption,
                bookingEngineCaption: img.bookingEngineCaption,
                index,
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
        return `  // ${img.cabinSlug} - Image ${img.index + 1}: ${caption}\n  { url: "${img.url}", category: "exterior", cabinSlug: "${img.cabinSlug}" },`
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
