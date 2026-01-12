import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BookingWidget } from "@/components/booking-widget"
import { HomeHero } from "@/components/home-hero"
import { Button } from "@/components/ui/button"
import { getAllCabinsFromHostaway } from "@/lib/cabin-cache"

export default async function HomePage() {
  // Fetch real cabin data from Hostaway (with static fallback)
  const cabins = await getAllCabinsFromHostaway()

  // Define specific cover images for each cabin
  const coverImages: Record<string, string> = {
    dew: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-2VoxPw1ogFm--GFueKZyM--b9BvwcrnFQxchXfq28rNto-69641991b0aab", // DEW - Image 24
    moss: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472338-hladcgjUFApjH7XWC1hAtZmwJUwSp8aaE-XuD2Q--HYw-69641964c3246", // MOSS - Image 2
    mist: "https://a0.muscache.com/im/pictures/hosting/Hosting-1584455699787140211/original/3f00cc25-b6c9-43ea-a6f6-4f73bbee81f7.jpeg?aki_policy=xx_large", // MIST - Image 3
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Announcement Bar */}
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm mt-20">
        <p>Now accepting reservations • Call (404) 590-8346</p>
      </div>

      {/* Hero Section */}
      <HomeHero />

      {/* Booking Widget Section */}
      <section id="booking" className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <BookingWidget className="max-w-4xl mx-auto" />
        </div>
      </section>

      {/* Brand Promise */}
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="text-xl md:text-2xl leading-relaxed text-foreground/70 font-light text-balance">
            Hidden in nature, our four intimate cabins offer a sanctuary for couples seeking privacy and connection.
            Here, time slows. Healing begins. And love deepens in the stillness of the Texas Hill Country.
          </p>
        </div>
      </section>

      {/* Cabins Preview */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4 text-balance font-medium">Our Cabins</h2>
            <p className="text-lg text-foreground/60">Four unique sanctuaries, each designed for intimacy</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {cabins.map((cabin) => {
              // Use specific cover image if defined, otherwise use first image from cabin
              const coverImage = coverImages[cabin.slug] || cabin.images?.[0] || "/placeholder.svg"
              return (
                <Link
                  key={cabin.slug}
                  href={`/stay/${cabin.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-background border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500">
                    {/* Image */}
                    <div className="absolute inset-0">
                      <img
                        src={coverImage}
                        alt={cabin.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                    </div>
                    
                    {/* Cabin name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                      <h3 className="font-serif text-3xl md:text-4xl text-white font-light tracking-wide mb-2">
                        {cabin.name}
                      </h3>
                      <div className="w-12 h-px bg-white/60 group-hover:w-16 transition-all duration-500" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Sticky Mobile Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border p-4 z-40">
        <Button asChild size="lg" className="w-full rounded-full">
          <Link href="#booking">Check Availability</Link>
        </Button>
      </div>

      <Footer />
    </div>
  )
}
