/**
 * Helper script to list all images from Hostaway for manual categorization
 * Run with: npx tsx scripts/list-gallery-images.ts
 */

import { getListing } from "../lib/hostaway"
import { LISTING_ID_MAP } from "../lib/listing-map"

async function listAllImages() {
  console.log("Fetching all images from Hostaway...\n")
  console.log("Copy the output below and categorize each image in lib/gallery-categories.ts\n")
  console.log("=" .repeat(80))
  console.log()

  for (const [slug, listingId] of Object.entries(LISTING_ID_MAP)) {
    try {
      console.log(`\n## ${slug.toUpperCase()} (Listing ID: ${listingId})`)
      console.log("-".repeat(80))

      const listingData = await getListing(listingId)
      const listingImages = listingData.listingImage || listingData.listingImages || []

      listingImages
        .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .forEach((img: any, index: number) => {
          if (img.url && !img.url.includes("placeholder")) {
            const caption = img.caption || img.bookingEngineCaption || "No caption"
            console.log(`// Image ${index + 1}: ${caption}`)
            console.log(`{ url: "${img.url}", category: "exterior", cabinSlug: "${slug}" },`)
            console.log()
          }
        })
    } catch (error) {
      console.error(`Error fetching images for ${slug}:`, error)
    }
  }

  console.log("=" .repeat(80))
  console.log("\nDone! Review each image and update the category in lib/gallery-categories.ts")
}

listAllImages().catch(console.error)
