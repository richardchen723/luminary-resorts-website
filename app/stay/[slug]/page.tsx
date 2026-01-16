import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Users, Home } from "lucide-react"
import { getCabinBySlug, getCabinBySlugSync, cabins } from "@/lib/cabins"
import { getAllCabinsFromHostaway } from "@/lib/cabin-cache"
import { CabinImageGallery } from "@/components/cabin-image-gallery"
import { CabinHero } from "@/components/cabin-hero"
import { ExpandableDescription } from "@/components/expandable-description"
import { ExpandableAmenities } from "@/components/expandable-amenities"
import { CabinBookingWidget } from "@/components/cabin-booking-widget"
import { Suspense } from "react"
import { JsonLd } from "@/components/json-ld"
import { generateMetadata as generateSEOMetadata, getCabinSEO } from "@/lib/seo"
import type { Metadata } from "next"
import { WhyBookDirect } from "@/components/why-book-direct"
import { PageViewTracker } from "@/components/page-view-tracker"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return cabins.map((cabin) => ({
    slug: cabin.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const cabin = await getCabinBySlug(slug)
  
  if (!cabin) {
    return {
      title: 'Cabin Not Found | Luminary Resorts',
    }
  }
  
  const seo = getCabinSEO(cabin)
  
  return generateSEOMetadata({
    title: seo.title,
    description: seo.description,
    path: `/stay/${slug}`,
    image: seo.image,
  })
}

export default async function CabinDetailPage({ params }: PageProps) {
  const { slug } = await params
  const cabin = await getCabinBySlug(slug)

  if (!cabin) {
    notFound()
  }

  // Get other cabins for "Explore Other Cabins" section
  // Try to get from Hostaway, fall back to static
  let otherCabins = cabins.filter((c) => c.slug !== slug).slice(0, 3)
  try {
    const allCabins = await getAllCabinsFromHostaway()
    otherCabins = allCabins.filter((c) => c.slug !== slug).slice(0, 3)
  } catch (error) {
    // Use static data if Hostaway fails
    console.error("Error fetching other cabins, using static data:", error)
  }

  const hotelSchema = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: `${cabin.name} Cabin - Luminary Resorts`,
    description: cabin.description,
    image: cabin.images || [],
    address: {
      '@type': 'PostalAddress',
      streetAddress: '50 Snowhill Rd',
      addressLocality: 'Coldspring',
      addressRegion: 'TX',
      postalCode: '77331',
      addressCountry: 'US',
    },
    containedIn: {
      '@type': 'LodgingBusiness',
      name: 'Luminary Resorts at Hilltop',
    },
    amenityFeature: cabin.amenities?.map((amenity) => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
      value: true,
    })) || [],
    numberOfRooms: {
      '@type': 'QuantitativeValue',
      value: 1,
    },
    occupancy: {
      '@type': 'QuantitativeValue',
      value: 2,
    },
  }

  return (
    <div className="min-h-screen">
      <JsonLd data={hotelSchema} />
      <PageViewTracker cabinSlug={slug} />
      <Header />

      {/* Hero Section */}
      <CabinHero
        image={cabin.images?.[0] || "/placeholder.svg"}
        cabinName={cabin.name}
        cabinId={cabin.id}
        subtitle={cabin.subtitle}
        allImages={cabin.images || []}
      />

      {/* Image Gallery */}
      {cabin.images && cabin.images.length > 0 && (
        <CabinImageGallery images={cabin.images} cabinName={cabin.name} />
      )}

      {/* Details Section with Booking */}
      <section id="booking" className="py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="md:col-span-2">
              <h2 className="font-serif text-4xl mb-6">About {cabin.name}</h2>
              {cabin.fullDescription ? (
                <ExpandableDescription
                  fullDescription={cabin.fullDescription}
                  previewText={
                    cabin.fullDescription.includes("Breathe. Unplug. Come back to love")
                      ? cabin.fullDescription.split("Breathe. Unplug. Come back to love")[0] + "Breathe. Unplug. Come back to love"
                      : cabin.fullDescription.substring(0, 200) + (cabin.fullDescription.length > 200 ? "..." : "")
                  }
                />
              ) : (
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                    {cabin.description}
                  </p>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    Experience the perfect blend of luxury and nature in this thoughtfully designed
                    retreat. Every detail has been curated to provide an intimate, restorative
                    experience for couples seeking connection and tranquility.
                  </p>
                </div>
              )}

              {/* Unique Content Blocks */}
              {cabin.slug === "moss" && (
                <div className="mt-12">
                  <h3 className="font-serif text-3xl mb-6">Immersive Forest Experience & Contemporary Design</h3>
                  <p className="text-lg leading-relaxed text-muted-foreground mb-4">
                    Moss cabin's floor-to-ceiling windows create a unique experience where the forest becomes part of your living space. Wake up to treetops at eye level, watch the light change throughout the day, and feel completely immersed in nature while enjoying the comfort of a luxury cabin. Unlike traditional vacation rentals, you'll have a private pool, complete privacy, and contemporary design.
                  </p>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    This contemporary glass sanctuary is perfect for couples who want to feel connected to nature without sacrificing luxury or comfort. The automated blinds provide privacy when you want it, but when open, you're living in the forest. The hilltop location provides sweeping views while maintaining complete seclusion.
                  </p>
                </div>
              )}

              {cabin.slug === "dew" && (
                <div className="mt-12">
                  <h3 className="font-serif text-3xl mb-6">Private Pool & Asian Zen Design</h3>
                  <p className="text-lg leading-relaxed text-muted-foreground mb-4">
                    Dew cabin offers the ultimate luxury: your own private 18' x 9' pool set on a hilltop deck with panoramic views. The Asian Zen-inspired design creates a serene, calming atmosphere perfect for couples seeking both romance and tranquility. Unlike traditional vacation rentals, you'll have complete privacy and luxury amenities.
                  </p>
                  <p className="text-lg leading-relaxed text-muted-foreground mb-4">
                    The bamboo courtyard, skylight over the bed, and wall-to-wall windows create a space that feels both intimate and expansive. Float in your private pool, watch sunsets from the deck, and experience complete privacy in this thoughtfully designed retreat.
                  </p>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    Perfect for <Link href="/experiences/private-pool-getaway" className="text-primary hover:underline">private pool getaways</Link> and <Link href="/experiences/romantic-getaway-near-houston" className="text-primary hover:underline">romantic escapes</Link>.
                  </p>
                </div>
              )}

              {cabin.slug === "sol" && (
                <div className="mt-12">
                  <h3 className="font-serif text-3xl mb-6">Panoramic Hilltop Views & Stargazing</h3>
                  <p className="text-lg leading-relaxed text-muted-foreground mb-4">
                    Perched at the highest point of our hilltop property, Sol cabin offers the most spectacular panoramic views. Watch the sky transform during sunset from your private terrace, stargaze from the dedicated deck and through the skylight, and experience the beauty of the Texas Hill Country from an elevated perspective. Unlike traditional vacation rentals, you'll have complete privacy and luxury amenities.
                  </p>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    The freestanding soaking tub with views, combined with the stargazing deck and skylight, makes Sol perfect for couples seeking a romantic, elevated experience. This is where you come to watch the world from above and reconnect with each other under the stars.
                  </p>
                </div>
              )}

              {cabin.slug === "mist" && (
                <div className="mt-12">
                  <h3 className="font-serif text-3xl mb-6">Sweeping Hilltop Views & Romantic Interiors</h3>
                  <p className="text-lg leading-relaxed text-muted-foreground mb-4">
                    Mist cabin offers sweeping hilltop views of the East Texas forest, making it perfect for couples seeking romance and tranquility. Situated on our hilltop property, this cabin combines luxury amenities with complete privacy and stunning natural surroundings. Just 5 minutes from Lake Livingston, you can easily enjoy lake activities during day trips.
                  </p>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    Ideal for <Link href="/experiences/lake-livingston-weekend" className="text-primary hover:underline">Lake Livingston weekend getaways</Link>, Mist provides the perfect base for combining lake activities with a romantic retreat. The private pool, skylight for stargazing, and sweeping views create a serene setting for your romantic escape, unlike traditional vacation rentals.
                  </p>
                </div>
              )}

              {/* Amenities */}
              {cabin.amenities && cabin.amenities.length > 0 && (
                <div className="mt-12">
                  <h3 className="font-serif text-3xl mb-6">Amenities</h3>
                  <ExpandableAmenities
                    allAmenities={cabin.amenities}
                    topAmenities={
                      cabin.slug === "dew"
                        ? ["Swimming pool", "Kitchen", "Air conditioning", "Pets allowed", "Internet", "Wireless"]
                        : undefined
                    }
                  />
                </div>
              )}

              {/* Internal Links */}
              <div className="mt-12">
                <h3 className="font-serif text-3xl mb-6">Explore More</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-serif text-xl mb-2">
                        <Link href="/location" className="hover:text-primary transition-colors">
                          Location & Directions
                        </Link>
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Just 1 hour from Houston. Get directions and learn about our hilltop location.
                      </p>
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link href="/location">View Location</Link>
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-serif text-xl mb-2">
                        <Link href="/#cabins" className="hover:text-primary transition-colors">
                          Explore Our Cabins
                        </Link>
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Discover all our luxury cabins, each with private pools and unique design.
                      </p>
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link href="/#cabins">View All Cabins</Link>
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-serif text-xl mb-2">
                        <Link href="/experiences/romantic-getaway-near-houston" className="hover:text-primary transition-colors">
                          Romantic Getaway Experience
                        </Link>
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Perfect for couples seeking romance and connection.
                      </p>
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link href="/experiences/romantic-getaway-near-houston">Learn More</Link>
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-serif text-xl mb-2">
                        <Link href="/about" className="hover:text-primary transition-colors">
                          Our Story
                        </Link>
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Learn about Luminary Resorts and our mission to create spaces for connection.
                      </p>
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link href="/about">Read Our Story</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="sticky top-24">
                <Suspense fallback={<div className="p-6 bg-muted/50 rounded-lg">Loading booking widget...</div>}>
                  <CabinBookingWidget cabinSlug={cabin.slug} className="w-full" />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Book Direct */}
      <WhyBookDirect />

      {/* Explore Other Cabins */}
      {otherCabins.length > 0 && (
        <section className="py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="font-serif text-4xl mb-12 text-center">Explore Other Cabins</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {otherCabins.map((otherCabin) => (
                <Card
                  key={otherCabin.slug}
                  className="overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow bg-background border-border/50"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={otherCabin.images[0] || "/placeholder.svg"}
                      alt={otherCabin.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-serif text-2xl mb-2">{otherCabin.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {otherCabin.description}
                    </p>
                    <Button asChild variant="outline" className="w-full rounded-full">
                      <Link href={`/stay/${otherCabin.slug}`}>View Cabin</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}

