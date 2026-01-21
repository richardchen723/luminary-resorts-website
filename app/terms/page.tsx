import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { generateMetadata as generateSEOMetadata } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = generateSEOMetadata({
  title: 'Terms of Service | Luminary Resorts at Hilltop',
  description: 'Terms of Service for Luminary Resorts at Hilltop. Read our booking terms, cancellation policy, and guest responsibilities.',
  path: '/terms',
})

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative h-[50vh] flex items-center justify-center mt-20">
        <div className="absolute inset-0 bg-muted/30" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-serif text-5xl md:text-6xl mb-6">Terms of Service</h1>
          <p className="text-lg text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8 text-muted-foreground leading-relaxed">
              <div>
                <h2 className="font-serif text-3xl mb-4 text-foreground">Agreement to Terms</h2>
                <p>
                  By accessing and using the Luminary Resorts at Hilltop website (luminaryresorts.com) and making a reservation, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site and our services.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-3xl mb-4 text-foreground">Reservations and Bookings</h2>
                <h3 className="font-serif text-xl mb-3 text-foreground mt-6">Booking Process</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All reservations are subject to availability</li>
                  <li>You must be at least 18 years old to make a reservation</li>
                  <li>Reservations require a valid credit card and payment</li>
                  <li>Booking confirmations will be sent via email</li>
                  <li>We reserve the right to refuse service to anyone</li>
                </ul>

                <h3 className="font-serif text-xl mb-3 text-foreground mt-6">Payment</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Full payment is required at the time of booking</li>
                  <li>We accept major credit cards processed securely through Stripe</li>
                  <li>All prices are in USD and include applicable taxes</li>
                  <li>Prices are subject to change without notice until booking is confirmed</li>
                </ul>
              </div>

              <div>
                <h2 className="font-serif text-3xl mb-4 text-foreground">Cancellation and Refund Policy</h2>
                <h3 className="font-serif text-xl mb-3 text-foreground mt-6">Cancellation by Guest</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>More than 30 days before check-in:</strong> Full refund minus processing fees</li>
                  <li><strong>14-30 days before check-in:</strong> 50% refund</li>
                  <li><strong>Less than 14 days before check-in:</strong> No refund</li>
                  <li>Refunds will be processed to the original payment method within 5-10 business days</li>
                </ul>

                <h3 className="font-serif text-xl mb-3 text-foreground mt-6">Cancellation by Luminary Resorts</h3>
                <p>
                  In the rare event that we must cancel your reservation due to circumstances beyond our control (natural disasters, property damage, etc.), you will receive a full refund or the option to reschedule your stay.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-3xl mb-4 text-foreground">Guest Responsibilities</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Guests are responsible for any damage to the property during their stay</li>
                  <li>Smoking is not permitted inside the cabins</li>
                  <li>Pets are allowed only with prior approval and may be subject to additional fees</li>
                  <li>Maximum occupancy limits must be respected</li>
                  <li>Quiet hours are from 10 PM to 8 AM</li>
                  <li>Guests must follow all posted rules and regulations</li>
                  <li>Illegal activities are strictly prohibited</li>
                </ul>
              </div>

              <div>
                <h2 className="font-serif text-3xl mb-4 text-foreground">Check-in and Check-out</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Check-in:</strong> 4:00 PM (self check-in with access codes provided 24 hours before arrival)</li>
                  <li><strong>Check-out:</strong> 11:00 AM</li>
                  <li>Early check-in or late check-out may be available upon request and subject to availability</li>
                  <li>Detailed arrival instructions will be sent via email 24 hours before your stay</li>
                </ul>
              </div>

              <div>
                <h2 className="font-serif text-3xl mb-4 text-foreground">Property Use and Restrictions</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The property is intended for residential use only</li>
                  <li>Commercial activities, events, or parties require prior written approval</li>
                  <li>Use of the property for illegal purposes is strictly prohibited</li>
                  <li>Guests may not sublet or assign their reservation</li>
                </ul>
              </div>

              <div>
                <h2 className="font-serif text-3xl mb-4 text-foreground">Limitation of Liability</h2>
                <p>
                  Luminary Resorts at Hilltop shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services, including but not limited to loss of profits, data, or other intangible losses.
                </p>
                <p className="mt-4">
                  Our total liability to you for all claims arising from or related to your stay shall not exceed the amount you paid for your reservation.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-3xl mb-4 text-foreground">Indemnification</h2>
                <p>
                  You agree to indemnify, defend, and hold harmless Luminary Resorts at Hilltop, its owners, employees, and agents from and against any claims, damages, losses, liabilities, and expenses (including legal fees) arising out of or related to your use of our services or violation of these Terms of Service.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-3xl mb-4 text-foreground">Intellectual Property</h2>
                <p>
                  All content on this website, including text, graphics, logos, images, and software, is the property of Luminary Resorts at Hilltop and is protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without our express written permission.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-3xl mb-4 text-foreground">Dispute Resolution</h2>
                <p>
                  Any disputes arising out of or relating to these Terms of Service or your stay at Luminary Resorts shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, conducted in San Jacinto County, Texas.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-3xl mb-4 text-foreground">Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to this page. Your continued use of our services after changes are posted constitutes acceptance of the modified terms.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-3xl mb-4 text-foreground">Governing Law</h2>
                <p>
                  These Terms of Service shall be governed by and construed in accordance with the laws of the State of Texas, without regard to its conflict of law provisions.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-3xl mb-4 text-foreground">Contact Information</h2>
                <p>If you have any questions about these Terms of Service, please contact us:</p>
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
