"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const HERO_IMAGES = [
  {
    src: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-2VoxPw1ogFm--GFueKZyM--b9BvwcrnFQxchXfq28rNto-69641991b0aab",
    alt: "DEW - Image 24",
  },
  {
    src: "https://a0.muscache.com/im/pictures/hosting/Hosting-1585945257767036176/original/933ee2dc-c03a-444b-8d43-a73c02a27193.jpeg?aki_policy=xx_large",
    alt: "SOL - Image 4",
  },
  {
    src: "https://a0.muscache.com/im/pictures/hosting/Hosting-1585945257767036176/original/7dd4c75a-f44c-4b7d-8b1a-8026666dbafd.jpeg?aki_policy=xx_large",
    alt: "SOL - Image 1",
  },
]

const ROTATION_INTERVAL = 6000 // 6 seconds per image

export function HomeHero() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length)
    }, ROTATION_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        {HERO_IMAGES.map((image, index) => (
          <Image
            key={image.src}
            src={image.src}
            alt={image.alt}
            fill
            className={`object-cover transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            sizes="100vw"
            priority={index === 0}
          />
        ))}
        <div className="absolute inset-0 atmospheric-overlay" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto text-white">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl tracking-[0.2em] mb-3 text-balance animate-fade-in-up font-light">
            LUMINARY
          </h1>
          <p className="text-xl md:text-2xl tracking-[0.3em] opacity-90 animate-fade-in-up font-light">RESORTS</p>
        </div>

        <p className="text-lg md:text-xl mb-6 text-balance leading-relaxed opacity-95 font-normal italic">
          Where silence reflects love
        </p>

        <p className="text-base md:text-lg mb-8 text-balance leading-relaxed opacity-85 font-light max-w-2xl mx-auto">
          A mirror-house retreat nestled in nature,
          <br />
          offering couples private, healing, and ritual-rich escapes.
        </p>
        <p className="text-sm md:text-base opacity-80 mb-12 font-light tracking-wide">
          Mirror Cabins • Forest • Lakeside • Natural Healing
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="rounded-full text-lg px-8 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/30"
          >
            <Link href="#cabins">Book Now</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full text-lg px-8 bg-transparent border-white/50 hover:bg-white/10"
          >
            <Link href="#cabins">Explore the Retreat</Link>
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  )
}
