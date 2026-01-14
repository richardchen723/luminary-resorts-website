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
            src="https://a0.muscache.com/im/pictures/hosting/Hosting-1585945257767036176/original/914f82ae-397a-4a91-ada2-ad199f810403.jpeg?aki_policy=xx_large"
            alt="About Luminary Resorts"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/40" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-script text-6xl md:text-7xl mb-6 text-balance tracking-wide" style={{ fontFamily: 'var(--font-script)' }}>Our Story</h1>
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
                We're Richard & Lydia, and this place was born from our own story of burnout, disconnection, and the quiet search for something real.
              </p>

              <p>
                For years, we worked in West Coast tech—endless meetings, constant notifications, the relentless pressure to always be "on." We were successful by every measure, but the long hours had taken their toll. We found ourselves exhausted, drifting apart, questioning what we were really building.
              </p>

              <p>
                The breaking point came when we realized we were living parallel lives—together but worlds apart. We had everything we thought we wanted, yet we felt empty. So we left. We walked away from the tech world and moved to East Texas to create something different: a sanctuary where couples like us could step away from the noise and remember what it feels like to simply be present.
              </p>

              <p>
                Luminary Resorts at Hilltop is our own journey of healing, written into every detail. These four cabins nestled in the pines are the sanctuary we wish we'd had when we were drowning in work and losing each other. Every window that frames nature, every moment of stillness—this is what saved us, and we built it for you.
              </p>

              <p>
                If you find yourself here—tired, disconnected, longing for a moment to breathe—this is your invitation. Come slow down. Come remember what it feels like to look into each other's eyes without a screen between you. Come sit in the stillness and let the forest do the talking. Come find your way back to each other, and to yourselves. This is a place where love can breathe again, where healing happens in the quiet spaces between words, where you can finally exhale.
              </p>

              <p className="text-foreground font-medium mt-8 italic">
                — Richard & Lydia
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
              href="/#cabins"
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
