import { generateMetadata as generateSEOMetadata } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = generateSEOMetadata({
  title: 'Contact Us | Luminary Resorts',
  description: 'Get in touch with Luminary Resorts. We\'re here to help plan your perfect romantic getaway. Contact us by phone, email, or send us a message.',
  path: '/contact',
})

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
