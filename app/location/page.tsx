import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Car, Plane, Clock } from "lucide-react"

export default function LocationPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center mt-20">
        <div className="absolute inset-0">
          <img
            src="https://hostaway-platform.s3.us-west-2.amazonaws.com/listing/57690-472339-Vo7D--hPsCCHlqaYlMuWhXSRlEwgRId62ZAYR0h7Wwv4-696419c3b1e2a"
            alt="Coldspring, Texas"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/40" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-serif text-5xl md:text-6xl mb-6">Coldspring, TX</h1>
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
            <p className="text-lg text-muted-foreground leading-relaxed">
              Luminary Resorts at Hilltop is located in Coldspring, Texas—a hidden gem in the Sam Houston National
              Forest region, offering the perfect balance of seclusion and accessibility.
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
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop"
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
                    src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=800&fit=crop"
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

      <Footer />
    </div>
  )
}
