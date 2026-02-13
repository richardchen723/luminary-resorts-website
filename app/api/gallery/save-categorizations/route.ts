import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"

/**
 * API endpoint to save image categorizations and automatically update gallery-categories.ts
 * POST /api/gallery/save-categorizations
 */
export async function POST(request: Request) {
  try {
    const categorizations = await request.json()

    // Save to a temporary file that we can read
    const filePath = join(process.cwd(), "tmp", "image-categorizations.json")
    
    // Ensure tmp directory exists
    const fs = require("fs")
    const tmpDir = join(process.cwd(), "tmp")
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true })
    }

    await writeFile(filePath, JSON.stringify(categorizations, null, 2))

    // Automatically update gallery-categories.ts
    try {
      const imageMappings = categorizations
        .map(([url, data]: [string, any]) => {
          if (!data || !data.category) return null
          const indexPart = typeof data.index === "number" ? `, index: ${data.index}` : ""
          return `  { url: "${url}", category: "${data.category}", cabinSlug: "${data.cabinSlug}"${indexPart} },`
        })
        .filter((line: string | null): line is string => line !== null)
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
  index?: number
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

      const outputPath = join(process.cwd(), "lib", "gallery-categories.ts")
      await writeFile(outputPath, code, "utf-8")

      const categorizedCount = categorizations.filter(([_, data]: [string, any]) => data?.category).length
      return NextResponse.json({ 
        success: true, 
        message: `Categorizations saved and gallery file updated! ${categorizedCount} images categorized.` 
      })
    } catch (updateError) {
      console.error("Error updating gallery file:", updateError)
      return NextResponse.json({ 
        success: true, 
        message: "Categorizations saved, but failed to update gallery file. Please run the update script manually.",
        error: String(updateError)
      })
    }
  } catch (error) {
    console.error("Error saving categorizations:", error)
    return NextResponse.json({ error: "Failed to save categorizations" }, { status: 500 })
  }
}

/**
 * API endpoint to get saved categorizations
 * GET /api/gallery/save-categorizations
 */
export async function GET() {
  try {
    const fs = require("fs")
    const filePath = join(process.cwd(), "tmp", "image-categorizations.json")
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ categorizations: null })
    }

    const data = fs.readFileSync(filePath, "utf-8")
    const categorizations = JSON.parse(data)

    return NextResponse.json({ categorizations })
  } catch (error) {
    console.error("Error reading categorizations:", error)
    return NextResponse.json({ categorizations: null })
  }
}
