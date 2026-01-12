"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import type { GalleryImage } from "@/lib/gallery"

interface GalleryClientProps {
  bannerImage: string
  images: GalleryImage[]
}

export function GalleryClient({ bannerImage, images }: GalleryClientProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [filter, setFilter] = useState<string>("all")

  const filteredImages = filter === "all" ? images : images.filter((img) => img.category === filter)

  // Handle image selection and set current index
  const handleImageClick = (imageSrc: string) => {
    const index = filteredImages.findIndex((img) => img.src === imageSrc)
    setCurrentIndex(index >= 0 ? index : 0)
    setSelectedImage(imageSrc)
  }

  // Navigate to previous image
  const goToPrevious = () => {
    if (filteredImages.length === 0) return
    const newIndex = currentIndex === 0 ? filteredImages.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
    setSelectedImage(filteredImages[newIndex].src)
  }

  // Navigate to next image
  const goToNext = () => {
    if (filteredImages.length === 0) return
    const newIndex = currentIndex === filteredImages.length - 1 ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
    setSelectedImage(filteredImages[newIndex].src)
  }

  // Keyboard navigation
  useEffect(() => {
    if (!selectedImage || filteredImages.length === 0) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedImage(null)
      } else if (e.key === "ArrowLeft") {
        const newIndex = currentIndex === 0 ? filteredImages.length - 1 : currentIndex - 1
        setCurrentIndex(newIndex)
        setSelectedImage(filteredImages[newIndex].src)
      } else if (e.key === "ArrowRight") {
        const newIndex = currentIndex === filteredImages.length - 1 ? 0 : currentIndex + 1
        setCurrentIndex(newIndex)
        setSelectedImage(filteredImages[newIndex].src)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden" // Prevent body scroll when lightbox is open

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "" // Restore body scroll
    }
  }, [selectedImage, currentIndex, filteredImages])

  // Update current index when filter changes
  useEffect(() => {
    if (selectedImage) {
      const index = filteredImages.findIndex((img) => img.src === selectedImage)
      if (index >= 0) {
        setCurrentIndex(index)
      } else {
        // If current image is not in filtered list, close lightbox
        setSelectedImage(null)
      }
    }
  }, [filter, filteredImages, selectedImage])

  return (
    <>
      {/* Hero */}
      <section className="relative h-[70vh] flex items-center justify-center mt-20">
        <div className="absolute inset-0">
          {bannerImage ? (
            <img src={bannerImage} alt="Luminary Resorts Gallery" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
          <div className="absolute inset-0 bg-foreground/40" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-serif text-5xl md:text-7xl mb-6 text-balance">Gallery</h1>
          <p className="text-xl max-w-2xl mx-auto text-balance">
            Explore the beauty of Luminary Resorts through our curated collection of moments.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-12 bg-muted/30 sticky top-20 z-30 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {["all", "exterior", "interior", "nature", "details"].map((category) => (
              <Button
                key={category}
                variant={filter === category ? "default" : "outline"}
                onClick={() => setFilter(category)}
                className="rounded-full capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredImages.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-muted-foreground text-lg">No images available at this time.</p>
            </div>
          ) : filter === "nature" || filter === "interior" || filter === "details" || filter === "exterior" ? (
            // Grid layout for nature, interior, details, and exterior (top to bottom, left to right)
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredImages.map((image, idx) => (
                <div
                  key={idx}
                  className="cursor-pointer group aspect-square overflow-hidden rounded-lg"
                  onClick={() => handleImageClick(image.src)}
                >
                  <img
                    src={image.src}
                    alt={`${image.cabinName} - ${image.category}`}
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : (
            // Grid layout for "all" category as well
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredImages.map((image, idx) => (
                <div
                  key={idx}
                  className="cursor-pointer group aspect-square overflow-hidden rounded-lg"
                  onClick={() => handleImageClick(image.src)}
                >
                  <img
                    src={image.src}
                    alt={`${image.cabinName} - ${image.category}`}
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && filteredImages.length > 0 && (
        <div
          className="fixed inset-0 bg-foreground/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-background/20 hover:bg-background/30 rounded-full text-white transition-colors z-10"
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>

          {/* Previous button */}
          {filteredImages.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/30 text-white rounded-full z-10"
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </Button>
          )}

          {/* Next button */}
          {filteredImages.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/30 text-white rounded-full z-10"
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </Button>
          )}

          {/* Image */}
          <div className="relative w-full h-full max-w-screen-xl max-h-screen-xl flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt={`${filteredImages[currentIndex]?.cabinName} - ${filteredImages[currentIndex]?.category}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Image counter */}
          {filteredImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/50 text-white px-4 py-2 rounded-full text-sm z-10">
              {currentIndex + 1} / {filteredImages.length}
            </div>
          )}
        </div>
      )}
    </>
  )
}
