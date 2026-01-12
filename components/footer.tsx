import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-serif text-3xl mb-4">Luminary Resorts</h3>
            <p className="text-primary-foreground/80 leading-relaxed max-w-md">
              A private hilltop retreat for couples seeking romance, healing, and renewal.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-serif text-lg mb-4">Explore</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/stay/moss"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Stay
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link
                  href="/location"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Location
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/faq"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Get in Touch
                </Link>
              </li>
              <li className="text-primary-foreground/80">Point Blank, Texas</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/60 text-sm">
            © {new Date().getFullYear()} Luminary Resorts. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
