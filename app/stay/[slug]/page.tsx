import { notFound } from "next/navigation"
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

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return cabins.map((cabin) => ({
    slug: cabin.slug,
  }))
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

  return (
    <div className="min-h-screen">
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
                    <img
                      src={otherCabin.images[0] || "/placeholder.svg"}
                      alt={otherCabin.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
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

