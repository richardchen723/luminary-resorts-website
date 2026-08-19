"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageGallery } from "./image-gallery"

interface CabinHeroProps {
  image: string
  cabinName: string
  cabinId: string
  subtitle?: string // Title/subtitle from listing
  allImages: string[]
}

export function CabinHero({ image, cabinName, cabinId, subtitle, allImages }: CabinHeroProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  return (
    <>
      <section
        className="relative h-[70vh] flex items-center justify-center mt-20 overflow-hidden cursor-pointer group"
        onClick={() => setIsGalleryOpen(true)}
      >
        <div className="absolute inset-0">
          <Image
            src={image || "/placeholder.svg"}
            alt={cabinName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-foreground/40 group-hover:bg-foreground/30 transition-colors" />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto pointer-events-none">
          <div className="inline-block px-4 py-2 bg-background/20 backdrop-blur-sm rounded-full mb-4">
            <span className="text-sm font-medium">Cabin {cabinId}</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl mb-6 text-balance">{cabinName}</h1>
          {subtitle && (
            <p className="text-xl md:text-2xl max-w-2xl mx-auto text-balance opacity-95">
              {subtitle}
            </p>
          )}
        </div>
        <div className="pointer-events-none absolute right-4 bottom-4 rounded-full bg-black/50 px-4 py-2 text-sm text-white opacity-100 backdrop-blur-sm transition-opacity md:opacity-0 md:group-hover:opacity-100">
          <span className="md:hidden">Tap to view all photos</span>
          <span className="hidden md:inline">Click to view all photos</span>
        </div>
      </section>

      {isGalleryOpen && (
        <ImageGallery images={allImages} initialIndex={0} onClose={() => setIsGalleryOpen(false)} />
      )}
    </>
  )
}
