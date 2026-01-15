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
import { Waves, Heart, Sparkles } from "lucide-react"

export const metadata: Metadata = generateSEOMetadata({
  title: 'Private Pool Getaway | Luxury Cabins with Private Pools | Luminary Resorts',
  description: 'Luxury cabins with private pools near Houston. Complete privacy, stunning views, and romantic settings. Perfect for couples seeking an intimate escape. Book now.',
  path: '/experiences/private-pool-getaway',
})

export default async function PrivatePoolGetawayPage() {
  const cabins = await getAllCabinsFromHostaway()
  const dewCabin = cabins.find(c => c.slug === 'dew')

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Which cabins have private pools?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Dew cabin features a private 18\' x 9\' pool (4.5\' deep) with stunning hilltop views. The pool is part of a private deck area with lounge chairs and complete privacy.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is the pool available year-round?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The pool is available year-round, though usage is weather-dependent. The pool area is beautiful in all seasons, and the deck provides a perfect setting even when not swimming.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is the pool private?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, the pool at Dew cabin is completely private. The deck is surrounded by bamboo and privacy fences, ensuring complete seclusion for you and your partner.',
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
            src="https://a0.muscache.com/im/pictures/hosting/Hosting-1585945257767036176/original/7dd4c75a-f44c-4b7d-8b1a-8026666dbafd.jpeg?aki_policy=xx_large"
            alt="Private pool getaway cabin"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-foreground/40" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto text-white">
          <h1 className="font-serif text-5xl md:text-6xl mb-6">Private Pool Getaway for Couples</h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            Experience the ultimate luxury: a private pool with stunning views, complete privacy, and romantic settings. Perfect for couples seeking an intimate escape.
          </p>
          <Button asChild size="lg" className="rounded-full">
            <Link href="/#booking">Book Your Private Pool Stay</Link>
          </Button>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl leading-relaxed text-muted-foreground mb-6">
              Imagine floating in your own private pool, surrounded by bamboo and forest, with panoramic views of the Texas Hill Country stretching out before you. No crowds, no shared spaces—just you, your partner, and complete privacy.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground mb-6">
              At Luminary Resorts, Dew cabin offers exactly that: a private 18' x 9' pool (4.5' deep) set on a hilltop deck with stunning views. The pool is surrounded by bamboo and privacy fences, ensuring complete seclusion for your romantic getaway.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Whether you want to cool off on a warm day, float under the stars, or simply enjoy the luxury of having your own private pool, Dew cabin provides the perfect setting for an unforgettable couples' escape.
            </p>
          </div>
        </div>
      </section>

      {dewCabin && (
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-4xl md:text-5xl mb-12 text-center">Dew Cabin: Your Private Pool Retreat</h2>
              <Card className="mb-8">
                <CardContent className="p-8">
                  <h3 className="font-serif text-3xl mb-4">Private Pool Features</h3>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-serif text-xl mb-3">Pool Details</h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li>• 18' x 9' pool (4.5' deep)</li>
                        <li>• Hilltop location with panoramic views</li>
                        <li>• Complete privacy with bamboo screening</li>
                        <li>• Lounge chairs for relaxation</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-serif text-xl mb-3">Deck & Surroundings</h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li>• Expansive deck overlooking treetops</li>
                        <li>• Bamboo courtyard for privacy</li>
                        <li>• String lights for evening ambiance</li>
                        <li>• Outdoor grill facing the view</li>
                      </ul>
                    </div>
                  </div>
                  <Button asChild size="lg" className="rounded-full">
                    <Link href="/stay/dew">View Dew Cabin Details</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      <section className="py-24 px-4">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl mb-12 text-center">Why Choose a Private Pool Getaway</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Waves className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">Complete Privacy</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Your own private pool with no shared spaces. Swim, float, or simply relax in complete seclusion with your partner.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">Romantic Setting</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Stunning hilltop views, evening string lights, and a peaceful atmosphere create the perfect romantic backdrop for your getaway.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">Luxury Experience</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Combine your private pool with luxury amenities: premium bedding, soaking tubs, and thoughtful design throughout the cabin.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">Book Your Private Pool Getaway</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Experience the luxury of your own private pool. Book Dew cabin for the ultimate romantic escape.
          </p>
          <Button asChild size="lg" className="rounded-full bg-primary-foreground text-primary hover:opacity-90">
            <Link href="/stay/dew">View Dew Cabin & Book</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
