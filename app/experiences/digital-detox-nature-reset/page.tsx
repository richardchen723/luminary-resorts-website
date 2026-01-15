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
import { WifiOff, TreePine, Heart } from "lucide-react"

export const metadata: Metadata = generateSEOMetadata({
  title: 'Digital Detox Retreat | Unplug in Nature Near Houston | Luminary Resorts',
  description: 'Disconnect and reconnect in nature. Luxury cabins designed for digital detox, mindfulness, and healing. Perfect for couples seeking stillness and presence. Book your reset.',
  path: '/experiences/digital-detox-nature-reset',
})

export default async function DigitalDetoxPage() {
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
        name: 'Is Luminary Resorts good for a digital detox?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely! Our cabins are designed for digital detox and mindfulness. While Wi-Fi is available, we encourage guests to disconnect and immerse themselves in nature, stillness, and presence with their partner.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do the cabins have Wi-Fi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, all cabins have Wi-Fi, though we encourage guests to disconnect during their stay. Cell service can be limited in the area, which naturally supports a digital detox experience.',
        },
      },
      {
        '@type': 'Question',
        name: 'What activities are available for a digital detox?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Activities include stargazing, nature walks, reading, meditation, journaling, cooking together, and simply being present with your partner. Nearby attractions include Lake Livingston and hiking trails.',
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
          <h1 className="font-serif text-5xl md:text-6xl mb-6">Digital Detox: Unplug and Reconnect</h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Disconnect from the noise and reconnect with yourself, your partner, and nature. A luxury cabin retreat designed for mindfulness, healing, and presence.
          </p>
          <Button asChild size="lg" className="rounded-full">
            <Link href="/#booking">Book Your Digital Detox</Link>
          </Button>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl leading-relaxed text-muted-foreground mb-6">
              You feel it—the constant pull of notifications, the endless scroll, the way your phone has become an extension of your hand. You're connected to everyone, but disconnected from yourself and the person you love most.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground mb-6">
              A digital detox isn't about deprivation—it's about liberation. It's about creating space to remember what it feels like to be present, to look into each other's eyes without a screen between you, to hear the sound of your own thoughts and the rhythm of your shared breath.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              At Luminary Resorts, we've created the perfect setting for your digital detox. Our luxury cabins in the East Texas forest offer complete privacy, stunning natural surroundings, and an environment designed to support mindfulness, healing, and deep connection.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl mb-12 text-center">Why Choose a Digital Detox Here</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <WifiOff className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">Natural Disconnection</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Limited cell service and the beauty of nature naturally support your digital detox. Wi-Fi is available but not the focus—presence is.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <TreePine className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">Nature Immersion</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Floor-to-ceiling windows bring nature inside. Stargazing decks, forest views, and lake access invite you to connect with the natural world.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">Deep Connection</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Without the distraction of screens, you can reconnect with your partner on a deeper level. Conversation, presence, and shared stillness become possible again.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-serif text-4xl md:text-5xl mb-8 text-center">Activities for Your Digital Detox</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl mb-3">Mindfulness Practices</h3>
                <p className="text-muted-foreground">Meditation, journaling, breathwork, and yoga in your private cabin or on your deck.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl mb-3">Nature Connection</h3>
                <p className="text-muted-foreground">Stargazing, birdwatching, nature walks, and simply being present in the forest.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl mb-3">Shared Activities</h3>
                <p className="text-muted-foreground">Cooking together, reading, playing games, and having conversations without interruption.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl mb-3">Rest & Restoration</h3>
                <p className="text-muted-foreground">Soaking in tubs, napping, and allowing your nervous system to finally rest.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl mb-8 text-center">Our Digital Detox Cabins</h2>
            <p className="text-lg text-muted-foreground mb-12 text-center leading-relaxed">
              Each cabin offers the perfect setting for your digital detox, with nature views, privacy, and spaces designed for mindfulness and connection.
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

      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">Begin Your Digital Detox</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Disconnect from the noise and reconnect with what matters. Book your digital detox retreat today.
          </p>
          <Button asChild size="lg" className="rounded-full bg-primary-foreground text-primary hover:opacity-90">
            <Link href="/#booking">Book Your Digital Detox</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
