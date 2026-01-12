"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    inquiryType: "reservation",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Handle form submission
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative h-[50vh] flex items-center justify-center mt-20">
        <div className="absolute inset-0">
          <img src="/placeholder.svg?height=800&width=1600" alt="Contact Us" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/40" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-serif text-5xl md:text-6xl mb-6">Get in Touch</h1>
          <p className="text-xl max-w-2xl mx-auto text-balance">We're here to help plan your perfect retreat.</p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-lg mb-2">Email</h3>
                <p className="text-muted-foreground">hello@luminaryresorts.com</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-lg mb-2">Phone</h3>
                <p className="text-muted-foreground">(555) 123-4567</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-lg mb-2">Location</h3>
                <p className="text-muted-foreground">Point Blank, Texas</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl mb-4">Send Us a Message</h2>
            <p className="text-lg text-muted-foreground">We typically respond within 24 hours.</p>
          </div>

          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="inquiryType" className="block text-sm font-medium mb-2">
                    Inquiry Type
                  </label>
                  <select
                    id="inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                  >
                    <option value="reservation">Reservation Inquiry</option>
                    <option value="general">General Question</option>
                    <option value="media">Media & Press</option>
                    <option value="partnership">Partnership Opportunity</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none resize-none"
                    placeholder="Tell us about your inquiry..."
                  />
                </div>

                <Button type="submit" size="lg" className="w-full rounded-full">
                  Send Message
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  By submitting this form, you agree to our privacy policy.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Response Time */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h3 className="font-serif text-2xl mb-4">What to Expect</h3>
          <p className="text-muted-foreground leading-relaxed">
            Our team reviews all inquiries personally and responds within 24 hours during business days. For immediate
            booking assistance, please call us directly during business hours (9 AM - 6 PM CST).
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
