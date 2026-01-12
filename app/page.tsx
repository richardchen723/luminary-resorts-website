import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BookingWidget } from "@/components/booking-widget"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  const cabins = [
    {
      id: "01",
      name: "Mirror Cabin",
      image: "/modern-glass-cabin-with-floor-to-ceiling-windows-i.jpg",
      highlights: ["Floor-to-ceiling windows", "Private deck", "King bed"],
    },
    {
      id: "02",
      name: "Forest Cabin",
      image: "/luxury-cabin-surrounded-by-tall-pine-trees-with-wa.jpg",
      highlights: ["Surrounded by tall pines", "Wood-burning fireplace", "Soaking tub"],
    },
    {
      id: "03",
      name: "Lakeside Cabin",
      image: "/serene-cabin-overlooking-peaceful-lake-at-sunset-w.jpg",
      highlights: ["Lake views", "Private dock", "Outdoor shower"],
    },
    {
      id: "04",
      name: "Hilltop Cabin",
      image: "/elevated-cabin-with-panoramic-mountain-and-valley-.jpg",
      highlights: ["Panoramic views", "Sunset terrace", "Outdoor fire pit"],
    },
  ]

  return (
    <div className="min-h-screen">
      <Header />

      {/* Announcement Bar */}
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm mt-20">
        <p>Now accepting reservations • Limited 4 cabins per night</p>
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/image.png"
            alt="Luminary Resorts at Hilltop - Modern glass cabin in misty forest"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 atmospheric-overlay" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto text-white">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl tracking-[0.2em] mb-3 text-balance animate-fade-in-up font-light">
              LUMINARY
            </h1>
            <p className="text-xl md:text-2xl tracking-[0.3em] opacity-90 animate-fade-in-up font-light">RESORTS</p>
          </div>

          <p className="text-lg md:text-xl mb-6 text-balance leading-relaxed opacity-95 font-normal italic">
            Where silence reflects love
          </p>

          <p className="text-base md:text-lg mb-8 text-balance leading-relaxed opacity-85 font-light max-w-2xl mx-auto">
            A mirror-house retreat nestled in nature,
            <br />
            offering couples private, healing, and ritual-rich escapes.
          </p>
          <p className="text-sm md:text-base opacity-80 mb-12 font-light tracking-wide">
            Mirror Cabins • Forest • Lakeside • Natural Healing
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="rounded-full text-lg px-8 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/30"
            >
              <Link href="#booking">Book Now</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full text-lg px-8 bg-transparent border-white/50 hover:bg-white/10"
            >
              <Link href="/stay/moss">Explore the Retreat</Link>
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

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
            {cabins.map((cabin) => (
              <Card
                key={cabin.id}
                className="overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow bg-background border-border/50"
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={cabin.image || "/placeholder.svg"}
                    alt={cabin.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-sm">Cabin {cabin.id}</span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-2xl mb-4 font-medium">{cabin.name}</h3>
                  <ul className="space-y-2 mb-6">
                    {cabin.highlights.map((highlight, idx) => (
                      <li key={idx} className="text-foreground/60 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="outline" className="w-full rounded-full bg-transparent border-border/50">
                    <Link href="/stay/moss">View Cabin</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
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
