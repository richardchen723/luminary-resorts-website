import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { generateMetadata as generateSEOMetadata } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = generateSEOMetadata({
  title: 'Privacy Policy | Luminary Resorts at Hilltop',
  description: 'Privacy Policy for Luminary Resorts at Hilltop. Learn how we collect, use, and protect your personal information.',
  path: '/privacy',
})

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative h-[50vh] flex items-center justify-center mt-20">
        <div className="absolute inset-0 bg-muted/30" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-serif text-5xl md:text-6xl mb-6">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8 text-muted-foreground leading-relaxed">
              <div>
                <h2 className="font-serif text-3xl mb-4 text-foreground">Introduction</h2>
                <p>
                  Luminary Resorts at Hilltop ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website luminaryresorts.com and use our booking services.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-3xl mb-4 text-foreground">Information We Collect</h2>
                <h3 className="font-serif text-xl mb-3 text-foreground mt-6">Personal Information</h3>
                <p>We may collect personal information that you voluntarily provide to us when you:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Make a reservation or booking</li>
                  <li>Contact us through our contact form</li>
                  <li>Subscribe to our newsletter</li>
                  <li>Interact with our website</li>
                </ul>
                <p className="mt-4">This information may include:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Billing address</li>
                  <li>Payment information (processed securely through Stripe)</li>
                  <li>Booking preferences and special requests</li>
                </ul>

                <h3 className="font-serif text-xl mb-3 text-foreground mt-6">Automatically Collected Information</h3>
                <p>When you visit our website, we may automatically collect certain information about your device, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Pages you visit and time spent on pages</li>
                  <li>Referring website addresses</li>
                  <li>Date and time of access</li>
                </ul>
              </div>

              <div>
                <h2 className="font-serif text-3xl mb-4 text-foreground">How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Process and manage your reservations</li>
                  <li>Communicate with you about your bookings</li>
                  <li>Send you booking confirmations and important updates</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Improve our website and services</li>
                  <li>Send you marketing communications (with your consent)</li>
                  <li>Comply with legal obligations</li>
                  <li>Prevent fraud and ensure security</li>
                </ul>
              </div>

              <div>
                <h2 className="font-serif text-3xl mb-4 text-foreground">Information Sharing and Disclosure</h2>
                <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Service Providers:</strong> We may share information with third-party service providers who perform services on our behalf, such as payment processing (Stripe), email services, and website hosting.</li>
                  <li><strong>Legal Requirements:</strong> We may disclose your information if required by law or in response to valid requests by public authorities.</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred.</li>
                  <li><strong>With Your Consent:</strong> We may share your information with your explicit consent.</li>
                </ul>
              </div>

              <div>
                <h2 className="font-serif text-3xl mb-4 text-foreground">Data Security</h2>
                <p>
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-3xl mb-4 text-foreground">Cookies and Tracking Technologies</h2>
                <p>
                  We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-3xl mb-4 text-foreground">Your Rights</h2>
                <p>Depending on your location, you may have the following rights regarding your personal information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access to your personal information</li>
                  <li>Correction of inaccurate information</li>
                  <li>Deletion of your personal information</li>
                  <li>Objection to processing of your information</li>
                  <li>Data portability</li>
                  <li>Withdrawal of consent</li>
                </ul>
                <p className="mt-4">To exercise these rights, please contact us at lydia@luminaryresorts.com.</p>
              </div>

              <div>
                <h2 className="font-serif text-3xl mb-4 text-foreground">Children's Privacy</h2>
                <p>
                  Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us immediately.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-3xl mb-4 text-foreground">Changes to This Privacy Policy</h2>
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-3xl mb-4 text-foreground">Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us:</p>
                <ul className="list-none pl-0 space-y-2 mt-4">
                  <li><strong>Email:</strong> lydia@luminaryresorts.com</li>
                  <li><strong>Phone:</strong> (404) 590-8346</li>
                  <li><strong>Address:</strong> 50 Snowhill Rd, Coldspring TX, 77331</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
