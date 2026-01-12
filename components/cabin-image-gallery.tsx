"use client"

import { useState } from "react"
import { ImageGallery } from "./image-gallery"

interface CabinImageGalleryProps {
  images: string[]
  cabinName: string
  showHero?: boolean
  heroTitle?: React.ReactNode
}

export function CabinImageGallery({ images, cabinName, showHero = false, heroTitle }: CabinImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  const handleImageClick = (galleryIndex: number) => {
    // galleryIndex is 0-based in the gallery grid (which starts from image 1)
    // So we need to add 1 to get the actual image index in the full images array
    setSelectedImageIndex(galleryIndex + 1)
  }

  const handleCloseGallery = () => {
    setSelectedImageIndex(null)
  }

  if (!images || images.length === 0) return null

  // Skip the first image (banner) - show only first 3 images in grid
  // If there's only 1 image (the banner), show it in the gallery too
  const galleryImages = images.length > 1 ? images.slice(1, 4) : images.slice(0, 3) // Only show first 3 images (indices 1, 2, 3)

  return (
    <>
      {/* Image Gallery Grid - Only show 3 images */}
      <section className="py-16 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-4">
            {galleryImages.map((image, idx) => (
              <div
                key={idx}
                className={`${idx === 0 ? "md:col-span-2 md:row-span-2" : ""} aspect-square md:aspect-auto overflow-hidden rounded-lg cursor-pointer group`}
                onClick={() => handleImageClick(idx)}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${cabinName} view ${idx + 2}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Gallery - includes all images including banner */}
      {selectedImageIndex !== null && (
        <ImageGallery
          images={images}
          initialIndex={selectedImageIndex}
          onClose={handleCloseGallery}
        />
      )}
    </>
  )
}
