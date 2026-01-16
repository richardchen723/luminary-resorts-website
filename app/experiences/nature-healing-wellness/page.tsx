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
import { TreePine, Heart, Sparkles } from "lucide-react"

export const metadata: Metadata = generateSEOMetadata({
  title: 'Nature Healing & Wellness Retreat | Internal Peace | Luminary Resorts',
  description: 'Find internal peace and healing in nature. Luxury cabins designed for wellness, mindfulness, and spiritual retreats. Perfect for couples seeking healing and restoration. Book your wellness journey.',
  path: '/experiences/nature-healing-wellness',
})

export default async function NatureHealingWellnessPage() {
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
        name: 'Is Luminary Resorts good for a healing and wellness retreat?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely! Our cabins are designed for healing, wellness, and finding internal peace. The natural setting, complete privacy, and thoughtful design create the perfect environment for mindfulness, meditation, and restoration. Unlike traditional vacation rentals, you\'ll experience complete seclusion and connection with nature.',
        },
      },
      {
        '@type': 'Question',
        name: 'What makes Luminary Resorts perfect for wellness and healing?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our four intimate cabins offer complete privacy, luxury amenities including private pools in each cabin, floor-to-ceiling windows with sweeping hilltop views, and a secluded setting designed for healing and restoration. The natural surroundings, stargazing opportunities, and peaceful atmosphere support your wellness journey.',
        },
      },
      {
        '@type': 'Question',
        name: 'What activities support healing and wellness?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Activities include meditation, yoga, nature walks, journaling, breathwork, stargazing, and simply being present in nature. The hilltop location offers peaceful surroundings perfect for reflection and restoration.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is this good for spiritual retreats?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Our cabins provide the perfect setting for spiritual retreats, meditation, and finding internal peace. The natural setting, complete privacy, and peaceful atmosphere support deep reflection and spiritual practice.',
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
            alt="Nature healing and wellness cabin"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-foreground/40" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto text-white">
          <h1 className="font-serif text-5xl md:text-6xl mb-6">Nature Healing & Wellness Retreat</h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            Find internal peace and healing in nature. A luxury cabin retreat designed for wellness, mindfulness, and restoration.
          </p>
          <Button asChild size="lg" className="rounded-full">
            <Link href="/#booking">Book Your Wellness Retreat</Link>
          </Button>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl leading-relaxed text-muted-foreground mb-6">
              Life moves fast. Responsibilities pile up. Stress accumulates. You feel disconnected from yourself, from peace, from the quiet wisdom that lives inside you. You long for a space where you can slow down, breathe deeply, and remember who you are beneath all the noise.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground mb-6">
              At Luminary Resorts, we've created the perfect setting for your healing and wellness journey. Our luxury cabins in the East Texas forest offer complete privacy, stunning natural surroundings, and an environment designed to support internal peace, restoration, and deep connection—both with yourself and with your partner.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              This is more than a vacation—it's a sanctuary for healing. A place where nature becomes your teacher, stillness becomes your practice, and peace becomes your reality.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl mb-12 text-center">Why Choose a Healing & Wellness Retreat Here</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <TreePine className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">Nature as Healer</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Immerse yourself in the healing power of nature. Floor-to-ceiling windows bring the forest inside, stargazing opportunities (select cabins feature skylights) connect you to the cosmos, and the peaceful hilltop setting supports deep restoration.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">Complete Privacy</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    With only four cabins on our hilltop property, you'll experience complete seclusion. No distractions, no interruptions—just you, your partner, and the natural world supporting your healing journey.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">Luxury & Comfort</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Each cabin features a private pool, luxury amenities, and thoughtful design that supports your wellness journey. Unlike traditional vacation rentals, you'll have complete privacy and comfort while connecting with nature.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-serif text-4xl md:text-5xl mb-8 text-center">Perfect For</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-serif text-xl mb-2">Stress Relief</h3>
                <p className="text-muted-foreground">Escape the pressures of daily life and find peace in nature's embrace.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-serif text-xl mb-2">Healing Journey</h3>
                <p className="text-muted-foreground">Create space for emotional and physical healing in a supportive environment.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-serif text-xl mb-2">Mindfulness Practice</h3>
                <p className="text-muted-foreground">Deepen your meditation and mindfulness practice in a peaceful setting.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-serif text-xl mb-2">Spiritual Retreats</h3>
                <p className="text-muted-foreground">Connect with your spiritual practice in nature's sacred space.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-serif text-xl mb-2">Internal Peace</h3>
                <p className="text-muted-foreground">Find the quiet within and remember what it feels like to be truly present.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-serif text-xl mb-2">Restoration</h3>
                <p className="text-muted-foreground">Rest your body, mind, and spirit in a sanctuary designed for renewal.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl mb-8 text-center">Wellness Activities</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl mb-3">Meditation & Mindfulness</h3>
                  <p className="text-muted-foreground">Practice meditation, breathwork, and mindfulness in your private cabin or on your deck surrounded by nature.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl mb-3">Nature Connection</h3>
                  <p className="text-muted-foreground">Nature walks, forest bathing, birdwatching, and simply being present in the natural world.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl mb-3">Yoga & Movement</h3>
                  <p className="text-muted-foreground">Practice yoga, gentle stretching, or mindful movement in your cabin or on your private deck.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl mb-3">Journaling & Reflection</h3>
                  <p className="text-muted-foreground">Write, reflect, and process in the peaceful setting of your cabin with sweeping views.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl mb-3">Stargazing & Sky Watching</h3>
                  <p className="text-muted-foreground">Connect with the cosmos through stargazing (select cabins feature skylights) and watching the sky transform.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl mb-3">Rest & Restoration</h3>
                  <p className="text-muted-foreground">Soak in tubs, rest deeply, and allow your nervous system to finally find peace.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl mb-8 text-center">Our Healing & Wellness Cabins</h2>
            <p className="text-lg text-muted-foreground mb-12 text-center leading-relaxed">
              Each cabin offers the perfect setting for your healing and wellness journey, with nature views, privacy, and spaces designed for mindfulness, meditation, and restoration.
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
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-serif text-4xl md:text-5xl mb-8 text-center">What's Included</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-serif text-xl mb-4">Wellness Amenities</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Private pool for relaxation and reflection</li>
                <li>• Standalone bathtubs for restorative soaks</li>
                <li>• Premium king-size bedding for deep rest</li>
                <li>• Luxury bath products for self-care</li>
                <li>• Coffee station with premium coffee</li>
              </ul>
            </div>
            <div>
              <h3 className="font-serif text-xl mb-4">Healing Environment</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Complete seclusion (no shared walls)</li>
                <li>• Sweeping hilltop views of nature</li>
                <li>• Stargazing opportunities (select cabins have skylights)</li>
                <li>• Peaceful natural surroundings</li>
                <li>• Space for meditation and practice</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-4xl md:text-5xl mb-6">Location & Getting Here</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Luminary Resorts is located in Coldspring, Texas, in the heart of the East Texas forest. Our hilltop setting offers rare elevated views, complete privacy, and a peaceful environment perfect for your healing and wellness journey.
            </p>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/location">View Location Details</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-serif text-4xl md:text-5xl mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl mb-3">Is Luminary Resorts good for a healing and wellness retreat?</h3>
                <p className="text-muted-foreground">
                  Absolutely! Our cabins are designed for healing, wellness, and finding internal peace. The natural setting, complete privacy, and thoughtful design create the perfect environment for mindfulness, meditation, and restoration. Unlike traditional vacation rentals, you'll experience complete seclusion and connection with nature.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl mb-3">What makes Luminary Resorts perfect for wellness and healing?</h3>
                <p className="text-muted-foreground">
                  Our four intimate cabins offer complete privacy, luxury amenities including private pools in each cabin, floor-to-ceiling windows with sweeping hilltop views, and a secluded setting designed for healing and restoration. The natural surroundings, stargazing opportunities, and peaceful atmosphere support your wellness journey.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl mb-3">What activities support healing and wellness?</h3>
                <p className="text-muted-foreground">
                  Activities include meditation, yoga, nature walks, journaling, breathwork, stargazing, and simply being present in nature. The hilltop location offers peaceful surroundings perfect for reflection and restoration.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl mb-3">Is this good for spiritual retreats?</h3>
                <p className="text-muted-foreground">
                  Yes! Our cabins provide the perfect setting for spiritual retreats, meditation, and finding internal peace. The natural setting, complete privacy, and peaceful atmosphere support deep reflection and spiritual practice.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">Begin Your Healing Journey</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Find internal peace and restoration in nature. Book your healing and wellness retreat today.
          </p>
          <Button asChild size="lg" className="rounded-full bg-primary-foreground text-primary hover:opacity-90">
            <Link href="/#booking">Book Your Wellness Retreat</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
