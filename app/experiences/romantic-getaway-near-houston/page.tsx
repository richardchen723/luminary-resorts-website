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
import { Heart, MapPin, Calendar } from "lucide-react"

export const metadata: Metadata = generateSEOMetadata({
  title: 'Romantic Getaway Near Houston | Luxury Cabins 1 Hour Away | Luminary Resorts',
  description: 'Ultimate romantic getaway 1 hour from Houston. Private pools, floor-to-ceiling windows, complete seclusion. Perfect for anniversaries, proposals, and reconnection. Book now.',
  path: '/experiences/romantic-getaway-near-houston',
})

export default async function RomanticGetawayPage() {
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
        name: 'How far is Luminary Resorts from Houston?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Luminary Resorts is located just 1 hour (60 miles) from Houston, making it the perfect romantic getaway destination for couples seeking a quick escape from the city.',
        },
      },
      {
        '@type': 'Question',
        name: 'What makes Luminary Resorts perfect for a romantic getaway?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our four intimate cabins offer complete privacy, luxury amenities including private pools, floor-to-ceiling windows with stunning views, and a secluded hilltop setting designed for couples to reconnect and deepen their bond.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which cabin is best for a romantic getaway?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'All our cabins are perfect for romantic getaways. Dew features a private pool, Moss offers floor-to-ceiling forest views, Sol provides panoramic sunset views, and Mist offers lakefront access. Each cabin is designed for intimacy and connection.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is included in a romantic getaway stay?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Each cabin includes luxury bedding, premium bath products, coffee station, climate control, Wi-Fi, and complete privacy. Some cabins feature private pools, soaking tubs, and stargazing decks perfect for romantic moments.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can we celebrate a special occasion like an anniversary?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely! Our cabins are perfect for anniversaries, proposals, honeymoons, and other special romantic occasions. We can help make your stay extra special—contact us to discuss your needs.',
        },
      },
    ],
  }

  return (
    <div className="min-h-screen">
      <JsonLd data={faqSchema} />
      <Header />

      {/* Hero */}
      <section className="relative h-[70vh] flex items-center justify-center mt-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472341-2VoxPw1ogFm--GFueKZyM--b9BvwcrnFQxchXfq28rNto-69641991b0aab"
            alt="Romantic getaway cabin"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-foreground/40" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto text-white">
          <h1 className="font-serif text-5xl md:text-6xl mb-6">Romantic Getaway for Couples Near Houston</h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            Escape the city and reconnect in complete privacy. Just 1 hour from Houston, our luxury cabins offer the perfect setting for romance, intimacy, and deep connection.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/#booking">Check Availability</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/stays">View All Cabins</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl leading-relaxed text-muted-foreground mb-6">
              In the rush of daily life, it's easy to lose sight of what matters most—the connection between you and your partner. You long for a space where time slows down, where you can look into each other's eyes without a screen between you, where the only agenda is being present together.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground mb-6">
              Luminary Resorts at Hilltop offers exactly that. Located just 1 hour from Houston, our luxury tiny house retreat provides couples with the perfect romantic getaway—a sanctuary where you can escape the noise, reconnect with each other, and remember what it feels like to simply be together.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Our four intimate cabins are designed with one purpose: to create space for love to breathe. Each cabin offers complete privacy, luxury amenities, and stunning natural surroundings that invite you to slow down, be present, and deepen your bond.
            </p>
          </div>
        </div>
      </section>

      {/* Why This Experience */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl mb-12 text-center">Why This Experience</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">Complete Privacy</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    With only four cabins on our hilltop property, you'll experience complete seclusion. No shared walls, no crowded spaces—just you, your partner, and the natural world around you.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">Perfect Proximity</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Just 1 hour from Houston, you can escape the city without the stress of a long journey. Perfect for spontaneous weekend getaways or planned romantic retreats.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">Luxury Amenities</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Private pools, floor-to-ceiling windows, soaking tubs, and stargazing decks—every detail is designed to enhance your romantic experience and create moments you'll remember forever.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">Intimate Setting</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our hilltop location offers rare elevated views and complete tranquility. Watch sunsets together, stargaze from your private deck, and wake up to panoramic views of the forest and river valley.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Perfect For */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-serif text-4xl md:text-5xl mb-8 text-center">Perfect For</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-serif text-xl mb-2">Anniversaries</h3>
                <p className="text-muted-foreground">Celebrate your love in a setting designed for romance and connection.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-serif text-xl mb-2">Proposals</h3>
                <p className="text-muted-foreground">Create the perfect moment to ask the question that changes everything.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-serif text-xl mb-2">Reconnection</h3>
                <p className="text-muted-foreground">Step away from daily life and remember why you fell in love.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-serif text-xl mb-2">Honeymoons</h3>
                <p className="text-muted-foreground">Begin your married life in a sanctuary of intimacy and peace.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-serif text-xl mb-2">Spontaneous Escapes</h3>
                <p className="text-muted-foreground">Close enough for a last-minute weekend getaway when you need it most.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-serif text-xl mb-2">Date Nights</h3>
                <p className="text-muted-foreground">Transform an ordinary date into an extraordinary romantic experience.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Cabins */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl mb-6 text-center">Our Cabins</h2>
            <p className="text-lg text-muted-foreground mb-12 text-center leading-relaxed">
              Each of our four intimate cabins offers a unique romantic experience. All are designed for couples seeking privacy, connection, and luxury in a natural setting.
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
                <Link href="/stays">Compare All Cabins</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-serif text-4xl md:text-5xl mb-8 text-center">What's Included</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-serif text-xl mb-4">Luxury Amenities</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Premium king-size bedding</li>
                <li>• Luxury bath products</li>
                <li>• Coffee station with premium coffee</li>
                <li>• Climate control</li>
                <li>• Wi-Fi (though we encourage disconnecting)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-serif text-xl mb-4">Privacy & Comfort</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Complete seclusion (no shared walls)</li>
                <li>• Self check-in (contactless)</li>
                <li>• 24/7 guest support</li>
                <li>• Free private parking</li>
                <li>• Pet-friendly (with advance notice)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-4xl md:text-5xl mb-6">Location & Getting Here</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Luminary Resorts is located in Coldspring, Texas, just 1 hour from Houston. Our hilltop setting offers rare elevated views and complete privacy, making it the perfect romantic escape.
            </p>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/location">View Location Details</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-serif text-4xl md:text-5xl mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl mb-3">How far is Luminary Resorts from Houston?</h3>
                <p className="text-muted-foreground">
                  Luminary Resorts is located just 1 hour (60 miles) from Houston, making it the perfect romantic getaway destination for couples seeking a quick escape from the city.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl mb-3">What makes Luminary Resorts perfect for a romantic getaway?</h3>
                <p className="text-muted-foreground">
                  Our four intimate cabins offer complete privacy, luxury amenities including private pools, floor-to-ceiling windows with stunning views, and a secluded hilltop setting designed for couples to reconnect and deepen their bond.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl mb-3">Which cabin is best for a romantic getaway?</h3>
                <p className="text-muted-foreground">
                  All our cabins are perfect for romantic getaways. Dew features a private pool, Moss offers floor-to-ceiling forest views, Sol provides panoramic sunset views, and Mist offers lakefront access. Each cabin is designed for intimacy and connection.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl mb-3">What is included in a romantic getaway stay?</h3>
                <p className="text-muted-foreground">
                  Each cabin includes luxury bedding, premium bath products, coffee station, climate control, Wi-Fi, and complete privacy. Some cabins feature private pools, soaking tubs, and stargazing decks perfect for romantic moments.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl mb-3">Can we celebrate a special occasion like an anniversary?</h3>
                <p className="text-muted-foreground">
                  Absolutely! Our cabins are perfect for anniversaries, proposals, honeymoons, and other special romantic occasions. We can help make your stay extra special—contact us to discuss your needs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">Book Your Romantic Getaway</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Escape the city and reconnect with your partner. Just 1 hour from Houston, your perfect romantic retreat awaits.
          </p>
          <Button asChild size="lg" className="rounded-full bg-primary-foreground text-primary hover:opacity-90">
            <Link href="/#booking">Check Availability Now</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
