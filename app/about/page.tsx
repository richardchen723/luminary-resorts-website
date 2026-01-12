import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Heart, Sparkles, Home } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center mt-20">
        <div className="absolute inset-0">
          <img
            src="/placeholder.svg?height=1080&width=1920"
            alt="About Luminary Resorts"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/40" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-serif text-5xl md:text-6xl mb-6 text-balance">Our Story</h1>
          <p className="text-xl max-w-2xl mx-auto text-balance">
            Creating sanctuaries for connection, one retreat at a time.
          </p>
        </div>
      </section>

      {/* Main Story */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="prose prose-lg mx-auto">
            <p className="text-2xl font-serif leading-relaxed mb-8 text-balance text-center">
              "We believe that true connection begins when we slow down, step away from the noise, and allow ourselves
              to simply be."
            </p>

            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                Luminary Resorts was born from a simple truth: the world moves too fast, and our relationships often pay
                the price. We created this hilltop sanctuary as an antidote—a place where couples can rediscover each
                other, heal together, and reconnect with what truly matters.
              </p>

              <p>
                Nestled in the pine forests of East Texas, our four intimate cabins offer more than just accommodation.
                They provide a threshold between the everyday and the extraordinary, where time slows and presence
                becomes possible again.
              </p>

              <p>
                Every detail has been considered with intention: the placement of each cabin to maximize privacy, the
                windows that frame nature as living art, the stillness that invites deep rest. This is not a destination
                for doing—it's a sanctuary for being.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl mb-16 text-center">Designed for Romance & Healing</h2>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-2xl mb-4">Romance</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We create space for couples to fall in love all over again—with each other and with the present
                  moment.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-2xl mb-4">Healing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Nature, stillness, and intentional design come together to create an environment for deep restoration.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Home className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-2xl mb-4">Privacy</h3>
                <p className="text-muted-foreground leading-relaxed">
                  With only four cabins, we ensure your experience remains intimate, exclusive, and entirely your own.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Break */}
      <section className="relative h-[60vh]">
        <img
          src="/placeholder.svg?height=800&width=1600"
          alt="Connection in nature"
          className="w-full h-full object-cover"
        />
      </section>

      {/* Vision */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl mb-8 text-center">From Texas, Across the U.S.</h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-center mb-12">
              Luminary Resorts @ Hilltop is our first location, but not our last. We're building a collection of
              intimate retreats across the United States—each one thoughtfully placed in nature, each one designed to
              help couples reconnect, heal, and find stillness together.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed text-center">
              Our vision is simple: to create sanctuaries where love can flourish and relationships can deepen, one
              peaceful retreat at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-5xl mb-6 text-balance">Experience the Retreat</h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90 text-balance">
            Your journey to deeper connection begins here. Four cabins. Endless possibility.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/stay/moss"
              className="inline-flex items-center justify-center rounded-full bg-primary-foreground text-primary px-8 py-4 text-lg font-medium hover:opacity-90 transition-opacity"
            >
              Explore Our Cabins
            </a>
            <a
              href="#booking"
              className="inline-flex items-center justify-center rounded-full border-2 border-primary-foreground text-primary-foreground px-8 py-4 text-lg font-medium hover:bg-primary-foreground/10 transition-colors"
            >
              Book Your Stay
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
