import { getAllCabinsFromHostaway } from "@/lib/cabin-cache"
import { getListing } from "@/lib/hostaway"
import { LISTING_ID_MAP } from "@/lib/listing-map"
import { IMAGE_CATEGORY_MAP, getImageCategory, getImageCabinSlug } from "@/lib/gallery-categories"
import type { Cabin } from "@/lib/cabins"
import type { HostawayListingImage } from "@/types/hostaway"

export interface GalleryImage {
  src: string
  category: "exterior" | "interior" | "nature" | "details"
  cabinName: string
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
    // Get full image data with captions from Hostaway
    const allImagesWithMetadata: Array<{
      url: string
      cabinName: string
      index: number
      caption: string | null
      bookingEngineCaption: string | null
    }> = []

    // Fetch full listing data to get image metadata
    for (const [slug, listingId] of Object.entries(LISTING_ID_MAP)) {
      try {
        const listingData = await getListing(listingId)
        const listingImages =
          listingData.listingImage || (listingData as any).listingImages || []

        // Get cabin name
        const allCabins = await getAllCabinsFromHostaway()
        const cabin = allCabins.find((c) => c.slug === slug)
        const cabinName = cabin?.name || slug

        listingImages
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          .forEach((img: HostawayListingImage, index: number) => {
            if (img.url && !img.url.includes("placeholder")) {
              allImagesWithMetadata.push({
                url: img.url,
                cabinName,
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

    if (allImagesWithMetadata.length === 0) {
      return {
        bannerImage: "",
        images: [],
      }
    }

    // Pick the most stunning banner image - prefer the first exterior image from categorized images
    // If no categorized images, fall back to first image
    let bannerImage = allImagesWithMetadata[0]?.url || ""
    const firstExterior = allImagesWithMetadata.find((img) => getImageCategory(img.url) === "exterior")
    if (firstExterior) {
      bannerImage = firstExterior.url
    }

    // Get cabin name mapping
    const cabinNameMap = new Map<string, string>()
    const allCabins = await getAllCabinsFromHostaway()
    allCabins.forEach((cabin) => {
      cabinNameMap.set(cabin.slug, cabin.name)
    })

    // Categorize images using hardcoded mapping
    const categorizedImages: GalleryImage[] = allImagesWithMetadata
      .map((img) => {
        // Get category from hardcoded map
        const category = getImageCategory(img.url)
        const cabinSlug = getImageCabinSlug(img.url) || img.cabinName.toLowerCase()
        const cabinName = cabinNameMap.get(cabinSlug) || img.cabinName

        // Only include images that have been categorized in the hardcoded map
        if (!category) {
          return null
        }

        return {
          src: img.url,
          category,
          cabinName,
        }
      })
      .filter((img): img is GalleryImage => img !== null)

    // Select best images for each category
    const exteriorImages = categorizedImages
      .filter((img) => img.category === "exterior")
      .slice(0, 10)

    const interiorImages = categorizedImages
      .filter((img) => img.category === "interior")
      .slice(0, 10)

    const natureImages = categorizedImages
      .filter((img) => img.category === "nature")
      .slice(0, 5)

    const detailsImages = categorizedImages
      .filter((img) => img.category === "details")
      .slice(0, 5)

    // If categories are not filled, redistribute from remaining images
    const selectedImages = [
      ...exteriorImages,
      ...interiorImages,
      ...natureImages,
      ...detailsImages,
    ]

    const selectedUrls = new Set(selectedImages.map((img) => img.src))
    const remainingImages = categorizedImages.filter(
      (img) => !selectedUrls.has(img.src)
    )

    // Fill up categories that need more images
    remainingImages.forEach((img) => {
      if (exteriorImages.length < 10 && img.category === "exterior") {
        exteriorImages.push(img)
      } else if (interiorImages.length < 10 && img.category === "interior") {
        interiorImages.push(img)
      } else if (natureImages.length < 5 && img.category === "nature") {
        natureImages.push(img)
      } else if (detailsImages.length < 5 && img.category === "details") {
        detailsImages.push(img)
      }
    })

    // Final combined list
    const finalImages = [
      ...exteriorImages.slice(0, 10),
      ...interiorImages.slice(0, 10),
      ...natureImages.slice(0, 5),
      ...detailsImages.slice(0, 5),
    ]

    return {
      bannerImage,
      images: finalImages,
    }
  } catch (error) {
    console.error("Error fetching gallery images from Hostaway:", error)
    return {
      bannerImage: "",
      images: [],
    }
  }
}
