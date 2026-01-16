import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { JsonLd } from "@/components/json-ld"
import { generateMetadata as generateSEOMetadata } from "@/lib/seo"
import type { Metadata } from "next"
import { getAllCabinsFromHostaway } from "@/lib/cabin-cache"
import { Home, Sparkles, MapPin } from "lucide-react"

export const metadata: Metadata = generateSEOMetadata({
  title: 'Luxury Tiny House Rentals in Texas | Private Pool Cabins | Luminary Resorts',
  description: 'Experience luxury tiny house living in Texas. Four intimate cabins with private pools, premium amenities, and stunning views. Perfect for couples seeking romance and healing.',
  path: '/experiences/luxury-tiny-house-texas',
})

export default async function LuxuryTinyHousePage() {
  const cabins = await getAllCabinsFromHostaway()

  // Define specific cover images for each cabin (same as home page)
  const coverImages: Record<string, string> = {
    dew: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-2VoxPw1ogFm--GFueKZyM--b9BvwcrnFQxchXfq28rNto-69641991b0aab", // DEW - Image 24
    moss: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472338-hladcgjUFApjH7XWC1hAtZmwJUwSp8aaE-XuD2Q--HYw-69641964c3246", // MOSS - Image 2
    mist: "https://a0.muscache.com/im/pictures/hosting/Hosting-1584455699787140211/original/3f00cc25-b6c9-43ea-a6f6-4f73bbee81f7.jpeg?aki_policy=xx_large", // MIST - Image 3
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What makes these luxury tiny houses different?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our luxury tiny houses combine the intimacy and efficiency of tiny house living with high-end amenities like private pools in each cabin, floor-to-ceiling windows with sweeping hilltop views, premium bedding, Asian Zen-inspired design, and thoughtful design. Each cabin is designed for couples seeking both luxury and connection, unlike traditional vacation rentals.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where are the luxury tiny houses located?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our luxury tiny houses are located in Coldspring, Texas, just 1 hour from Houston. The hilltop setting offers rare elevated views and complete privacy in the East Texas forest.',
        },
      },
      {
        '@type': 'Question',
        name: 'What amenities are included in the luxury tiny houses?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Each luxury tiny house includes premium king-size bedding, luxury bath products, coffee station, climate control, Wi-Fi, and unique features like private pools, soaking tubs, or lake access depending on the cabin.',
        },
      },
      {
        '@type': 'Question',
        name: 'How many people can stay in a luxury tiny house?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Each luxury tiny house accommodates 2 guests, making them perfect for couples seeking an intimate romantic getaway or healing retreat.',
        },
      },
    ],
  }

  return (
    <div className="min-h-screen">
      <JsonLd data={faqSchema} />
      <Header />

      <section className="relative h-[70vh] flex items-center justify-center mt-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://a0.muscache.com/im/pictures/hosting/Hosting-1585945257767036176/original/933ee2dc-c03a-444b-8d43-a73c02a27193.jpeg?aki_policy=xx_large"
            alt="Luxury tiny house cabin"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-foreground/40" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto text-white">
          <h1 className="font-serif text-5xl md:text-6xl mb-6">Luxury Tiny House Rentals in Texas</h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            Experience the perfect blend of tiny house living and luxury amenities. Four intimate cabins designed for couples seeking romance, healing, and connection.
          </p>
          <Button asChild size="lg" className="rounded-full">
            <Link href="/#booking">Check Availability</Link>
          </Button>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl leading-relaxed text-muted-foreground mb-6">
              Tiny house living has captured the imagination of many—the simplicity, the efficiency, the freedom from excess. But what if you could have all of that with the luxury and comfort you deserve?
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground mb-6">
              At Luminary Resorts, we've reimagined tiny house living for couples. Our four luxury tiny house cabins combine the intimacy and thoughtful design of tiny homes with premium amenities like private pools in each cabin, floor-to-ceiling windows with sweeping hilltop views, standalone bathtubs, Asian Zen-inspired design, and stunning natural settings. Unlike traditional vacation rentals, you'll experience complete privacy and luxury in a nature-immersed setting.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Located just 1 hour from Houston in Coldspring, Texas, our luxury tiny houses offer the perfect escape for couples seeking romance, healing, or simply a different way of being together. Each cabin is designed to maximize space, light, and connection—both with each other and with nature.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl mb-12 text-center">Why Choose Luxury Tiny House Living</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Home className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">Thoughtful Design</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Every square foot is intentionally designed to maximize comfort, functionality, and beauty. No wasted space, only purposeful luxury.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">Luxury Amenities</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Private pools, premium bedding, luxury bath products, and stunning views—all the amenities you expect from a luxury retreat in a tiny house format.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">Natural Setting</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Located in the East Texas forest with hilltop views, complete privacy, and easy access to Lake Livingston. Nature becomes part of your living space.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-serif text-4xl md:text-5xl mb-8 text-center">Our Luxury Tiny Houses</h2>
          <p className="text-lg text-muted-foreground mb-12 text-center leading-relaxed">
            Each of our four luxury tiny house cabins offers a unique experience with private pools, sweeping hilltop views, romantic interiors, and complete privacy. Select cabins feature skylights for stargazing, and all offer thoughtful design that maximizes space and connection with nature.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {cabins.map((cabin) => {
              const coverImage = coverImages[cabin.slug] || cabin.images?.[0] || "/placeholder.svg"
              return (
                <Card key={cabin.slug} className="overflow-hidden group hover:shadow-xl transition-shadow bg-background border-border/50">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={coverImage}
                      alt={cabin.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-serif text-2xl mb-3">
                      <Link href={`/stay/${cabin.slug}`} className="hover:text-primary transition-colors">
                        {cabin.name} Cabin
                      </Link>
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {cabin.description}
                    </p>
                    <Button asChild variant="outline" className="rounded-full w-full">
                      <Link href={`/stay/${cabin.slug}`}>View {cabin.name} Cabin</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <div className="text-center mt-8">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/#cabins">Explore Our Cabins</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">Experience Luxury Tiny House Living</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
            Discover the perfect blend of tiny house simplicity and luxury amenities. Book your stay in one of our four intimate cabins.
          </p>
          <Button asChild size="lg" className="rounded-full">
            <Link href="/#booking">Check Availability</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
