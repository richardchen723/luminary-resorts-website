import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { JsonLd } from "@/components/json-ld"
import { generateMetadata as generateSEOMetadata } from "@/lib/seo"
import type { Metadata } from "next"
import { getAllCabinsFromHostaway } from "@/lib/cabin-cache"
import { Waves, MapPin, Calendar } from "lucide-react"

export const metadata: Metadata = generateSEOMetadata({
  title: 'Lake Livingston Weekend Getaway | Luxury Cabins Near the Lake | Luminary Resorts',
  description: 'Weekend getaway near Lake Livingston. Luxury tiny house cabins with lake access, private pools, and complete seclusion. Perfect for couples. Book your Lake Livingston escape.',
  path: '/experiences/lake-livingston-weekend',
})

export default async function LakeLivingstonWeekendPage() {
  const cabins = await getAllCabinsFromHostaway()

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How close is Luminary Resorts to Lake Livingston?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Luminary Resorts is located just 5 minutes from Lake Livingston, Texas\'s second-largest lake. One of our cabins (Mist) offers direct lakefront access with a private dock.',
        },
      },
      {
        '@type': 'Question',
        name: 'What activities are available at Lake Livingston?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Lake Livingston offers boating, fishing, kayaking, paddleboarding, and peaceful lakeside walks. There\'s a boat launch just 5 minutes from our property, and Mist cabin has direct lake access.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can we bring a boat?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! There\'s a boat launch just 5 minutes away, and we have trailer parking available. Mist cabin offers direct lake access with a private dock.',
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
          <h1 className="font-serif text-5xl md:text-6xl mb-6">Lake Livingston Weekend Getaway</h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Experience the beauty of Lake Livingston from our luxury cabins. Just 5 minutes from the lake, with one cabin offering direct lakefront access.
          </p>
          <Button asChild size="lg" className="rounded-full">
            <Link href="/#booking">Book Your Lake Weekend</Link>
          </Button>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl leading-relaxed text-muted-foreground mb-6">
              Lake Livingston, Texas's second-largest lake, offers 90,000 acres of water perfect for boating, fishing, and peaceful lakeside moments. And you're just 5 minutes away.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground mb-6">
              At Luminary Resorts, we've created the perfect Lake Livingston weekend getaway. Our luxury cabins combine easy lake access with complete privacy, luxury amenities, and stunning natural settings. One of our cabins (Mist) even offers direct lakefront access with a private dock.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Whether you want to spend your days on the water or simply enjoy the peaceful lakeside atmosphere, our cabins provide the perfect base for your Lake Livingston adventure.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl mb-12 text-center">Why Choose Lake Livingston</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Waves className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">Easy Lake Access</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Just 5 minutes from Lake Livingston with a boat launch nearby. Mist cabin offers direct lakefront access with a private dock.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">Water Activities</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Boating, fishing, kayaking, paddleboarding, and peaceful lakeside walks. Bring your boat or rent one nearby.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">Luxury Base</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Return from lake activities to your luxury cabin with private pools, premium amenities, and complete privacy.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-serif text-4xl md:text-5xl mb-8 text-center">Our Lake Livingston Cabins</h2>
          <p className="text-lg text-muted-foreground mb-12 text-center leading-relaxed">
            All our cabins are just 5 minutes from Lake Livingston. Mist cabin offers direct lakefront access with a private dock.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {cabins.map((cabin) => (
              <Card key={cabin.slug} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-serif text-2xl mb-3">
                    <Link href={`/stay/${cabin.slug}`} className="hover:text-primary transition-colors">
                      {cabin.name} Cabin
                    </Link>
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {cabin.description}
                  </p>
                  {cabin.slug === 'mist' && (
                    <p className="text-sm text-primary mb-4 font-medium">✓ Direct lakefront access with private dock</p>
                  )}
                  <Button asChild variant="outline" className="rounded-full w-full">
                    <Link href={`/stay/${cabin.slug}`}>View {cabin.name} Cabin</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">Plan Your Lake Livingston Weekend</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Experience the beauty of Lake Livingston from our luxury cabins. Book your weekend getaway today.
          </p>
          <Button asChild size="lg" className="rounded-full bg-primary-foreground text-primary hover:opacity-90">
            <Link href="/#booking">Book Your Lake Weekend</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
