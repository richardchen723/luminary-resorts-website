/**
 * Script to read saved categorizations and update gallery-categories.ts
 * Run with: npx tsx scripts/update-gallery-categories.ts
 */

import { readFile, writeFile } from "fs/promises"
import { join } from "path"

async function updateGalleryCategories() {
  try {
    // Read saved categorizations
    const categorizationsPath = join(process.cwd(), "tmp", "image-categorizations.json")
    const data = await readFile(categorizationsPath, "utf-8")
    const categorizations: Array<[string, { url: string; category: string; cabinSlug: string }]> = JSON.parse(data)

    if (!categorizations || categorizations.length === 0) {
      console.log("No categorizations found. Please save them from the tool first.")
      return
    }

    // Convert to IMAGE_CATEGORY_MAP format
    const imageMappings = categorizations
      .map(([url, data]) => {
        if (!data.category) return null
        return `  { url: "${url}", category: "${data.category}", cabinSlug: "${data.cabinSlug}" },`
      })
      .filter((line): line is string => line !== null)
      .join("\n")

    const code = `/**
 * Hardcoded image categorization for gallery
 * This file maps image URLs to their categories.
 * Images are categorized manually to ensure accuracy.
 * 
 * Last updated: ${new Date().toISOString()}
 */

export interface ImageCategoryMapping {
  url: string
  category: "exterior" | "interior" | "nature" | "details"
  cabinSlug: string
}

/**
 * Hardcoded image category mappings
 * Format: { url: string, category: "exterior" | "interior" | "nature" | "details", cabinSlug: string }
 */
export const IMAGE_CATEGORY_MAP: ImageCategoryMapping[] = [
${imageMappings}
]

/**
 * Get category for an image URL
 */
export function getImageCategory(url: string): "exterior" | "interior" | "nature" | "details" | null {
  const mapping = IMAGE_CATEGORY_MAP.find((m) => m.url === url)
  return mapping?.category || null
}

/**
 * Get cabin slug for an image URL
 */
export function getImageCabinSlug(url: string): string | null {
  const mapping = IMAGE_CATEGORY_MAP.find((m) => m.url === url)
  return mapping?.cabinSlug || null
}
`

    // Write to gallery-categories.ts
    const outputPath = join(process.cwd(), "lib", "gallery-categories.ts")
    await writeFile(outputPath, code, "utf-8")

    console.log(`✅ Successfully updated gallery-categories.ts with ${categorizations.length} categorizations!`)
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.log("❌ No saved categorizations found.")
      console.log("Please:")
      console.log("1. Go to http://localhost:3000/tools/categorize-images")
      console.log("2. Click 'Save to Server' button")
      console.log("3. Run this script again")
    } else {
      console.error("Error updating gallery categories:", error)
    }
  }
}

updateGalleryCategories()
