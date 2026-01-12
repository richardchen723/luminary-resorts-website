import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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
          q: "How far in advance should I book?",
          a: "We recommend booking at least 2-3 weeks in advance, especially for weekends and holidays. With only 4 cabins, we fill up quickly.",
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
          a: "Cancellations made 14 days or more before check-in receive a full refund. Cancellations within 14 days are subject to a 50% cancellation fee. No refunds for cancellations within 48 hours of check-in.",
        },
        {
          q: "Can I modify my reservation?",
          a: "Yes, modifications can be made up to 7 days before arrival, subject to availability. Please contact us directly to modify your booking.",
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
          a: "Check-in is at 3:00 PM and check-out is at 11:00 AM. Early check-in or late check-out may be available upon request for an additional fee, subject to availability.",
        },
        {
          q: "How does self check-in work?",
          a: "We offer contactless self check-in. You will receive detailed arrival instructions and access codes via email 24 hours before your stay.",
        },
        {
          q: "Is there someone on-site if we need assistance?",
          a: "While we do not have 24/7 on-site staff, our concierge team is available via phone during business hours for any needs or questions.",
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
          a: "We provide a welcome coffee basket upon arrival. Cabins do not include full kitchens, but we can arrange for breakfast delivery or private chef experiences upon request.",
        },
        {
          q: "Do cabins have Wi-Fi?",
          a: "Yes, all cabins have Wi-Fi, though we encourage guests to disconnect during their stay. Cell service can be limited in the area.",
        },
        {
          q: "Are the cabins accessible?",
          a: "Due to the natural terrain of our hilltop location, not all cabins are wheelchair accessible. Please contact us to discuss specific accessibility needs.",
        },
      ],
    },
    {
      category: "Guest Guidelines",
      questions: [
        {
          q: "Are pets allowed?",
          a: "To maintain our tranquil atmosphere and respect guests with allergies, we do not accommodate pets. Service animals are welcome with advance notice.",
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
          a: "Cabins are designed for the number of guests indicated at booking only. We do not accommodate events, parties, or additional visitors.",
        },
      ],
    },
    {
      category: "Location & Activities",
      questions: [
        {
          q: "Where are you located?",
          a: "We are located in Point Blank, Texas, approximately 1 hour from Houston in the Sam Houston National Forest region.",
        },
        {
          q: "What is there to do nearby?",
          a: "Lake Livingston (15 min), Sam Houston National Forest (20 min), and several charming small towns are nearby. On property, enjoy hiking trails, stargazing, and simply being in nature.",
        },
        {
          q: "Do you offer experiences or activities?",
          a: "We can arrange private experiences including couples massage, guided forest bathing, private dining, and more. Contact us for details.",
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen">
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
