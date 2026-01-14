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
        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Click to view all photos
        </div>
      </section>

      {isGalleryOpen && (
        <ImageGallery images={allImages} initialIndex={0} onClose={() => setIsGalleryOpen(false)} />
      )}
    </>
  )
}
