import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { getAllCabinsFromHostaway } from "@/lib/cabin-cache"
import { generateMetadata as generateSEOMetadata } from "@/lib/seo"
import type { Metadata } from "next"
import { Check } from "lucide-react"

export const metadata: Metadata = generateSEOMetadata({
  title: 'Luxury Tiny House Rentals in Texas | Private Pool Cabins Near Houston | Luminary Resorts',
  description: 'Four luxury tiny house cabins in Coldspring, Texas. Each with unique features: private pools, forest views, lake access. Perfect for couples. Compare cabins and book your romantic getaway.',
  path: '/stays',
})

export default async function StaysPage() {
  const cabins = await getAllCabinsFromHostaway()

  // Define specific cover images for each cabin
  const coverImages: Record<string, string> = {
    dew: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-2VoxPw1ogFm--GFueKZyM--b9BvwcrnFQxchXfq28rNto-69641991b0aab",
    moss: "https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472338-hladcgjUFApjH7XWC1hAtZmwJUwSp8aaE-XuD2Q--HYw-69641964c3246",
    mist: "https://a0.muscache.com/im/pictures/hosting/Hosting-1584455699787140211/original/3f00cc25-b6c9-43ea-a6f6-4f73bbee81f7.jpeg?aki_policy=xx_large",
  }

  const cabinFeatures: Record<string, string[]> = {
    moss: ['Floor-to-ceiling windows', 'Forest views', 'Contemporary design', 'Private deck'],
    dew: ['Private pool', 'Asian Zen design', 'Skylight over bed', 'Bamboo courtyard', 'EV charger'],
    sol: ['Panoramic views', 'Sunset terrace', 'Freestanding soaking tub', 'Stargazing deck'],
    mist: ['Lakefront access', 'Private dock', 'Waterfront views', 'Morning mist views'],
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative h-[50vh] flex items-center justify-center mt-20">
        <div className="absolute inset-0 bg-muted/50" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-serif text-5xl md:text-6xl mb-6">Four Intimate Cabins, Each Designed for Connection</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Compare our luxury tiny house cabins and find the perfect romantic getaway near Houston.
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl mb-4">Compare Our Cabins</h2>
            <p className="text-lg text-muted-foreground">
              Each cabin offers unique features perfect for couples seeking romance, healing, and connection.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left p-4 font-serif text-xl">Cabin</th>
                  <th className="text-left p-4 font-serif text-xl">Key Features</th>
                  <th className="text-left p-4 font-serif text-xl">Best For</th>
                  <th className="text-center p-4 font-serif text-xl">View</th>
                </tr>
              </thead>
              <tbody>
                {cabins.map((cabin) => {
                  const features = cabinFeatures[cabin.slug] || []
                  const bestFor: Record<string, string> = {
                    moss: 'Nature immersion, forest lovers',
                    dew: 'Romantic getaways, private pool',
                    sol: 'Sunset views, stargazing',
                    mist: 'Lake activities, waterfront',
                  }
                  return (
                    <tr key={cabin.slug} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="font-serif text-2xl mb-2">{cabin.name}</div>
                        <p className="text-sm text-muted-foreground">{cabin.occupancy}</p>
                      </td>
                      <td className="p-4">
                        <ul className="space-y-1">
                          {features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                              <Check className="w-4 h-4 text-primary flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {bestFor[cabin.slug] || 'Romantic getaways'}
                      </td>
                      <td className="p-4 text-center">
                        <Button asChild variant="outline" className="rounded-full">
                          <Link href={`/stay/${cabin.slug}`}>View Details</Link>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Cabin Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl mb-4">Explore Each Cabin</h2>
            <p className="text-lg text-foreground/60">Four unique sanctuaries, each designed for intimacy</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
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
                    <h3 className="font-serif text-3xl mb-3">{cabin.name}</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {cabin.description}
                    </p>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-muted-foreground">{cabin.occupancy}</span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{cabin.minimumStay}</span>
                    </div>
                    <Button asChild className="w-full rounded-full">
                      <Link href={`/stay/${cabin.slug}`}>View {cabin.name} Cabin</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">Ready to Book Your Stay?</h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            All our cabins are perfect for couples seeking romance, healing, and connection. 
            Compare features above or explore individual cabin pages to find your perfect match.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/#booking">Check Availability</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/location">View Location</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
