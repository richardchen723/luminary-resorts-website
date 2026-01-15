import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { JsonLd } from "@/components/json-ld"
import { generateMetadata as generateSEOMetadata } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = generateSEOMetadata({
  title: 'Frequently Asked Questions | Luminary Resorts',
  description: 'Everything you need to know about your stay at Luminary Resorts. Booking, policies, amenities, location, and more. Get answers to common questions about our luxury tiny house retreat.',
  path: '/faq',
})

export default function FAQPage() {
  const faqs = [
    {
      category: "Booking & Reservations",
      questions: [
        {
          q: "How do I make a reservation?",
          a: "You can book directly through our website using the booking widget on the homepage, or contact us directly for special requests and extended stays.",
        },
        {
          q: "What is the minimum stay requirement?",
          a: "We require a minimum 2-night stay to ensure you have time to fully unwind and experience the retreat.",
        },
        {
          q: "Do you offer gift certificates?",
          a: "Yes! Gift certificates are available for any amount and make a perfect gift for couples seeking a meaningful getaway.",
        },
      ],
    },
    {
      category: "Policies",
      questions: [
        {
          q: "What is your cancellation policy?",
          a: "If you cancel within 48 hours after booking, you receive a full refund. Cancellations made 14 days or more before check-in receive a full refund. Cancellations within 14 days are subject to a 50% cancellation fee. No refunds for cancellations within 48 hours of check-in.",
        },
        {
          q: "Can I modify my reservation?",
          a: "Yes, we will try our best to accommodate your request. Just reach out to us and we'll work with you to make the necessary changes.",
        },
        {
          q: "What is your weather policy?",
          a: "We do not offer refunds for weather-related concerns. Each cabin is equipped for comfort in all seasons, and we find that rain and mist often enhance the retreat experience.",
        },
      ],
    },
    {
      category: "Check-In & Arrival",
      questions: [
        {
          q: "What are your check-in and check-out times?",
          a: "Check-in is at 4:00 PM and check-out is at 11:00 AM. Early check-in or late check-out may be available upon request for an additional fee, subject to availability.",
        },
        {
          q: "How does self check-in work?",
          a: "We offer contactless self check-in. You will receive detailed arrival instructions and access codes via email 24 hours before your stay.",
        },
        {
          q: "Is there someone on-site if we need assistance?",
          a: "While we do not have 24/7 on-site staff, our concierge team is available 24/7 via phone to assist our guests with any needs or questions.",
        },
      ],
    },
    {
      category: "Accommodations",
      questions: [
        {
          q: "What amenities are included in each cabin?",
          a: "Each cabin includes premium bedding, luxury bath products, coffee station, climate control, and Wi-Fi. Specific amenities vary by cabin—see our Stay page for detailed information.",
        },
        {
          q: "Is food provided?",
          a: "We provide coffee and water. Breakfast is not included.",
        },
        {
          q: "Do cabins have Wi-Fi?",
          a: "Yes, all cabins have Wi-Fi, though we encourage guests to disconnect during their stay. Cell service can be limited in the area.",
        },
        {
          q: "Are the cabins accessible?",
          a: "Due to the natural terrain of our hilltop location, not all cabins are wheelchair accessible. Please contact us to discuss specific accessibility needs.",
        },
        {
          q: "Do you accommodate babies?",
          a: "Yes, we accommodate babies with a pack n play and child utensils. Please let us know when booking if you'll be bringing a baby.",
        },
      ],
    },
    {
      category: "Guest Guidelines",
      questions: [
        {
          q: "Are pets allowed?",
          a: "Yes, we welcome pets. There is a $50 flat pet fee. Please notify us in advance if you plan to bring your pet during your stay.",
        },
        {
          q: "Is smoking allowed?",
          a: "All cabins are non-smoking. Smoking is permitted in designated outdoor areas only.",
        },
        {
          q: "What are your quiet hours?",
          a: "Our resort maintains a peaceful atmosphere at all times, with designated quiet hours from 10:00 PM to 8:00 AM.",
        },
        {
          q: "Can we host events or invite additional guests?",
          a: "Each cabin only accommodates 2 guests. However, if you book multiple cabins, we can accommodate events or parties. Please let us know your plans when booking.",
        },
      ],
    },
    {
      category: "Location & Activities",
      questions: [
        {
          q: "Where are you located?",
          a: "We are located in Coldspring, Texas, 1 hour from IAH (Houston Intercontinental Airport) and 5 minutes from Lake Livingston.",
        },
        {
          q: "What is there to do nearby?",
          a: "You can bring and launch a boat at the boat launch (5 minutes away), visit Lake Livingston (5 minutes away), explore Wolf Creek Park (10 minutes away), or enjoy wine tasting at a nearby winery. On property, you can enjoy stargazing and simply being in nature.",
        },
      ],
    },
  ]

  // Build FAQ schema from all questions
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.flatMap((category) =>
      category.questions.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a,
        },
      }))
    ),
  }

  return (
    <div className="min-h-screen">
      <JsonLd data={faqSchema} />
      <Header />

      {/* Hero */}
      <section className="relative h-[50vh] flex items-center justify-center mt-20">
        <div className="absolute inset-0 bg-muted/50" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-serif text-5xl md:text-6xl mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about your stay at Luminary Resorts.
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl space-y-16">
          {faqs.map((category, catIdx) => (
            <div key={catIdx}>
              <h2 className="font-serif text-3xl mb-8">{category.category}</h2>
              <Accordion type="single" collapsible className="space-y-4">
                {category.questions.map((faq, faqIdx) => (
                  <AccordionItem key={faqIdx} value={`${catIdx}-${faqIdx}`} className="border rounded-lg px-6">
                    <AccordionTrigger className="text-left font-serif text-lg hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl mb-6">Still Have Questions?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            We're here to help. Reach out to our team and we'll get back to you within 24 hours.
          </p>
          <Button asChild size="lg" className="rounded-full">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
