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
import { Heart, Sparkles, Calendar } from "lucide-react"

export const metadata: Metadata = generateSEOMetadata({
  title: 'Anniversary Weekend Getaway | Romantic Cabins Near Houston | Luminary Resorts',
  description: 'Celebrate your anniversary at a luxury cabin retreat near Houston. Private pools, romantic settings, and complete privacy. Make your special day unforgettable. Book now.',
  path: '/experiences/anniversary-weekend',
})

export default async function AnniversaryWeekendPage() {
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
        name: 'Is Luminary Resorts good for anniversary celebrations?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely! Our luxury cabins are perfect for anniversary celebrations. With complete privacy, romantic settings, luxury amenities, and stunning natural surroundings, we provide the ideal backdrop for celebrating your love.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which cabin is best for an anniversary weekend?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'All our cabins are perfect for anniversaries. Dew features a private pool perfect for romantic moments, Sol offers panoramic sunset views ideal for evening celebrations, Moss provides immersive forest views, and Mist offers lakefront serenity.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can you help make our anniversary special?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Contact us when booking to discuss how we can make your anniversary celebration extra special. We can help with recommendations and arrangements to create an unforgettable experience.',
        },
      },
    ],
  }

  return (
    <div className="min-h-screen">
      <JsonLd data={faqSchema} />
      <Header />

      <section className="relative h-[70vh] flex items-center justify-center mt-20">
        <div className="absolute inset-0 bg-muted/50" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl mb-6">Anniversary Weekend Getaway for Couples</h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Celebrate your love in a luxury cabin retreat. Private pools, romantic settings, and complete privacy—the perfect anniversary celebration near Houston.
          </p>
          <Button asChild size="lg" className="rounded-full">
            <Link href="/#booking">Book Your Anniversary Stay</Link>
          </Button>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl leading-relaxed text-muted-foreground mb-6">
              Your anniversary is more than a date on the calendar—it's a celebration of the journey you've taken together, the love you've built, and the future you're creating. It deserves a setting that honors the significance of this moment.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground mb-6">
              At Luminary Resorts, we've created the perfect anniversary weekend getaway. Just 1 hour from Houston, our luxury cabins offer complete privacy, romantic settings, and luxury amenities designed to help you celebrate your love in a meaningful way.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Whether you're celebrating your first anniversary or your fiftieth, our intimate cabins provide the ideal backdrop for reconnection, celebration, and creating new memories together.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl mb-12 text-center">Perfect for Your Anniversary</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">Romantic Settings</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Private pools for evening dips, stargazing decks for late-night conversations, soaking tubs for relaxation, and panoramic views for watching sunsets together.
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
                    Premium bedding, luxury bath products, coffee stations, and thoughtful touches throughout. Every detail is designed to make your anniversary celebration special.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">Complete Privacy</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    With only four cabins on our property, you'll have complete seclusion. No interruptions, no shared spaces—just you and your partner celebrating your love.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">Easy Access</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Just 1 hour from Houston, you can escape for your anniversary weekend without the stress of a long journey. Perfect for spontaneous celebrations or planned getaways.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-serif text-4xl md:text-5xl mb-8 text-center">Our Anniversary Cabins</h2>
          <p className="text-lg text-muted-foreground mb-12 text-center leading-relaxed">
            Each cabin offers unique features perfect for celebrating your anniversary. Choose the one that speaks to your love story.
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
        </div>
      </section>

      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">Celebrate Your Anniversary With Us</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Make your anniversary unforgettable. Book your stay in one of our luxury cabins and create memories that will last a lifetime.
          </p>
          <Button asChild size="lg" className="rounded-full bg-primary-foreground text-primary hover:opacity-90">
            <Link href="/#booking">Book Your Anniversary Stay</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
