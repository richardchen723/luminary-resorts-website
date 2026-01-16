import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Car, Plane, Clock } from "lucide-react"
import { JsonLd } from "@/components/json-ld"
import { generateMetadata as generateSEOMetadata } from "@/lib/seo"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = generateSEOMetadata({
  title: 'Romantic Getaway Near Houston | 1 Hour from IAH | Luminary Resorts, Coldspring TX',
  description: 'Luxury tiny house retreat in Coldspring, Texas—just 1 hour from Houston. Private hilltop cabins with panoramic views, perfect for romantic weekends and healing getaways. Book your escape.',
  path: '/location',
})

export default function LocationPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How far is Luminary Resorts from Houston?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Luminary Resorts is located approximately 1 hour (60 miles) from Houston, Texas. We are easily accessible from both George Bush Intercontinental Airport (IAH) and William P. Hobby Airport (HOU).',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the address of Luminary Resorts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Luminary Resorts at Hilltop is located at 50 Snowhill Rd, Coldspring, TX 77331.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there parking available?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, free private parking is available at each cabin. We can accommodate 2-3 cars per cabin, and trailer/boat parking is available along Snowhill Rd.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is there to do near Luminary Resorts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nearby attractions include Lake Livingston (5 minutes away), Sam Houston National Forest (20 minutes), and Wolf Creek Park (10 minutes). You can also enjoy boating, fishing, hiking, and wine tasting in the area.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you offer EV charging?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we have Level 2 EV chargers (Tesla chargers with J1772 adapters) available in the parking area.',
        },
      },
    ],
  }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Luminary Resorts at Hilltop',
    description: 'Luxury tiny house retreat for couples in Coldspring, Texas. Four intimate cabins with private pools, floor-to-ceiling windows, and complete seclusion.',
    url: 'https://luminaryresorts.com',
    telephone: '+14045908346',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '50 Snowhill Rd',
      addressLocality: 'Coldspring',
      addressRegion: 'TX',
      postalCode: '77331',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '30.5885',
      longitude: '-95.1294',
    },
    priceRange: '$$$',
  }

  return (
    <div className="min-h-screen">
      <JsonLd data={faqSchema} />
      <JsonLd data={localBusinessSchema} />
      <Header />

      {/* Hero */}
      <section className="relative h-[70vh] flex items-center justify-center mt-20">
        <div className="absolute inset-0">
          <img
            src="https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472339-Vo7D--hPsCCHlqaYlMuWhXSRlEwgRId62ZAYR0h7Wwv4-696419c3b1e2a"
            alt="Coldspring, Texas"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/40" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-serif text-5xl md:text-6xl mb-6">Your Romantic Escape, Just 1 Hour from Houston</h1>
          <p className="text-xl max-w-2xl mx-auto text-balance">
            Nestled in the heart of East Texas, where forest meets tranquility.
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl mb-6">Where to Find Us</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Luminary Resorts at Hilltop is located in Coldspring, Texas—a hidden gem in the Sam Houston National
              Forest region, offering the perfect balance of seclusion and accessibility. Just 1 hour from Houston, our luxury tiny house retreat offers couples the perfect escape from city life without the long drive.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Whether you're seeking a romantic weekend getaway, an anniversary celebration, or a digital detox, our hilltop location provides the ideal setting for reconnection and healing. Our four intimate cabins are nestled in nature, offering complete privacy while remaining easily accessible from Houston's major airports and metropolitan area.
            </p>
          </div>

          {/* Google Map Embed */}
          <div className="aspect-video rounded-lg overflow-hidden mb-12 border-2 border-border">
            <iframe
              src="https://www.google.com/maps?q=50+Snowhill+Rd,+Coldspring+TX+77331&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
              title="Luminary Resorts Location - 50 Snowhill Rd, Coldspring TX, 77331"
            />
          </div>

          <div className="text-center mb-8">
            <p className="text-lg font-medium mb-4">50 Snowhill Rd, Coldspring TX, 77331</p>
            <Button 
              size="lg" 
              className="rounded-full"
              asChild
            >
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=50+Snowhill+Rd,+Coldspring+TX+77331"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Get Directions
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Directions from Houston */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl mb-6">Directions from Houston</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our location makes it easy to escape the city for a romantic weekend. From downtown Houston, the drive takes approximately 1 hour, making us the perfect destination for couples seeking a quick getaway without the hassle of a long journey.
            </p>
          </div>
          <Card className="mb-12">
            <CardContent className="p-8">
              <h3 className="font-serif text-2xl mb-4">Driving Directions</h3>
              <ol className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-foreground">1.</span>
                  <span>From Houston, take I-45 North toward Dallas</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-foreground">2.</span>
                  <span>Take Exit 98 for TX-150 toward New Waverly/Coldspring</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-foreground">3.</span>
                  <span>Continue on TX-150 for approximately 15 miles</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-foreground">4.</span>
                  <span>Turn onto Snowhill Rd - our resort is on the right</span>
                </li>
              </ol>
              <p className="mt-6 text-sm text-muted-foreground">
                <strong>Driving Time:</strong> Approximately 1 hour from downtown Houston, 1 hour 15 minutes from George Bush Intercontinental Airport (IAH), 1 hour 30 minutes from William P. Hobby Airport (HOU).
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Getting Here */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl mb-12 text-center">Getting Here</h2>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {/* By Car */}
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Car className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">By Car</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>~1 hour from Houston, TX</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>~2.5 hours from Austin, TX</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>~3 hours from Dallas, TX</span>
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-6">Free private parking available at each cabin.</p>
                </CardContent>
              </Card>

              {/* By Air */}
              <Card>
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Plane className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">By Air</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li>
                      <strong>George Bush Intercontinental Airport (IAH)</strong>
                      <br />
                      Houston, TX — 60 miles
                    </li>
                    <li>
                      <strong>William P. Hobby Airport (HOU)</strong>
                      <br />
                      Houston, TX — 70 miles
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-6">Rental car recommended from all airports.</p>
                </CardContent>
              </Card>
            </div>

            {/* Address */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-8 text-center">
                <h3 className="font-serif text-2xl mb-4">Resort Address</h3>
                <p className="text-lg mb-2">Luminary Resorts at Hilltop</p>
                <p className="opacity-90">50 Snowhill Rd, Coldspring TX, 77331</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Nearby Attractions */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl mb-12 text-center">Nearby Natural Wonders</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <div className="aspect-square overflow-hidden">
                  <img
                    src="https://dl.dropboxusercontent.com/scl/fi/0ogacz4ar07nlzr7r0i1c/Luminary-Resorts-6.JPG?rlkey=geaawc1bm5lbmhr1cv1ys2ivu&st=21l6lp2d&dl=1"
                    alt="Lake Livingston"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl mb-2">Lake Livingston</h3>
                  <p className="text-sm text-muted-foreground mb-3">5 minutes away</p>
                  <p className="text-muted-foreground">
                    Texas's second-largest lake, perfect for peaceful morning walks and sunset views.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <div className="aspect-square overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=800&fit=crop"
                    alt="Sam Houston National Forest"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl mb-2">Sam Houston National Forest</h3>
                  <p className="text-sm text-muted-foreground mb-3">20 minutes away</p>
                  <p className="text-muted-foreground">
                    160,000 acres of pristine forest with hiking trails and natural beauty.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <div className="aspect-square overflow-hidden">
                  <img
                    src="https://dl.dropboxusercontent.com/scl/fi/ru0mu7aoycbpk2i6xbcm1/Luminary-Resorts-4.JPG?rlkey=hplz5s0hi8b7z6o5jvzdgemh6&st=l2tnk19u&dl=1"
                    alt="Wolf Creek Park"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl mb-2">Wolf Creek Park</h3>
                  <p className="text-sm text-muted-foreground mb-3">10 minutes away</p>
                  <p className="text-muted-foreground">
                    A beautiful park with scenic trails, perfect for hiking and nature exploration.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why Coldspring */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl mb-6">Why Coldspring, Texas?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Coldspring offers the perfect balance of natural beauty, seclusion, and accessibility. Located in the heart of East Texas, our hilltop setting provides rare elevated views in a region known for its flat terrain. Here, you'll find the tranquility you're seeking while remaining close enough to Houston for a convenient weekend escape.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-8">
                <h3 className="font-serif text-2xl mb-4">Perfect Proximity</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  At just 1 hour from Houston, Luminary Resorts is the ideal destination for couples seeking a romantic getaway without the long drive. Perfect for weekend escapes, anniversaries, or spontaneous romantic retreats.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our location makes it easy to leave the city behind and immerse yourself in nature, all while knowing you're never too far from home.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8">
                <h3 className="font-serif text-2xl mb-4">Natural Seclusion</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our hilltop setting offers something rare in East Texas: elevated views and complete privacy. Each of our four cabins is positioned to maximize seclusion while providing stunning panoramic views of the surrounding forest and river valley.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Here, you can truly disconnect and reconnect—with nature, with each other, and with yourself.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Plan Your Arrival */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl mb-12 text-center">Plan Your Arrival</h2>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg mb-2">Stock Up Before Arrival</h3>
                    <p className="text-muted-foreground">
                      We recommend stopping in Livingston or Coldspring for groceries and essentials. Each cabin
                      includes a coffee station and basic amenities.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg mb-2">Self Check-In</h3>
                    <p className="text-muted-foreground">
                      We offer contactless self check-in. Detailed instructions and access codes will be sent 24 hours
                      before your arrival.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-semibold">3</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg mb-2">Unplug & Unwind</h3>
                    <p className="text-muted-foreground">
                      Take time to disconnect and fully immerse yourself in the natural beauty and tranquility of your
                      surroundings. Whether you choose to read, meditate, or simply be present, this is your space to
                      unwind.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Our Cabins */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl mb-6">Explore Our Luxury Cabins</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Each of our four intimate cabins offers a unique experience, from private pools to floor-to-ceiling windows. 
              Discover which cabin is perfect for your romantic getaway near Houston.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-serif text-2xl mb-3">
                  <Link href="/stay/moss" className="hover:text-primary transition-colors">
                    Moss Cabin
                  </Link>
                </h3>
                <p className="text-muted-foreground mb-4">
                  A contemporary glass sanctuary with floor-to-ceiling windows framing the forest. Perfect for couples seeking an immersive nature experience.
                </p>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/stay/moss">View Moss Cabin</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-serif text-2xl mb-3">
                  <Link href="/stay/dew" className="hover:text-primary transition-colors">
                    Dew Cabin
                  </Link>
                </h3>
                <p className="text-muted-foreground mb-4">
                  Asian Zen-inspired cabin with private pool, wall-to-wall windows, and skylight over the bed. Ideal for romantic getaways and digital detox.
                </p>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/stay/dew">View Dew Cabin</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-serif text-2xl mb-3">
                  <Link href="/stay/sol" className="hover:text-primary transition-colors">
                    Sol Cabin
                  </Link>
                </h3>
                <p className="text-muted-foreground mb-4">
                  Perched at the highest point with panoramic sunset views. Features a freestanding soaking tub and stargazing deck.
                </p>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/stay/sol">View Sol Cabin</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-serif text-2xl mb-3">
                  <Link href="/stay/mist" className="hover:text-primary transition-colors">
                    Mist Cabin
                  </Link>
                </h3>
                <p className="text-muted-foreground mb-4">
                  Lakefront cabin with direct lake access and private dock. Wake to morning mist on the water in this serene setting.
                </p>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/stay/mist">View Mist Cabin</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-8">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/#cabins">Explore Our Cabins</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
