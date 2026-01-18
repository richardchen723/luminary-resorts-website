import type React from "react"
import type { Metadata } from "next"
import { Quicksand, Dancing_Script } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { GA4 } from "@/components/ga4"
import "./globals.css"

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
})

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-script",
  display: "swap",
  preload: false,
})

export const metadata: Metadata = {
  title: "Luminary Resorts at Hilltop | Luxury Tiny House Retreat Near Houston, Texas",
  description:
    "Romantic getaway 1 hour from Houston. Four intimate luxury cabins with private pools, floor-to-ceiling windows, and complete seclusion. Perfect for couples seeking romance and healing. Book direct.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/icon.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/icon-192x192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: "/icon-512x512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://hostaway-platform.s3.us-west-2.amazonaws.com" />
        <link rel="dns-prefetch" href="https://a0.muscache.com" />
      </head>
      <body className={`${quicksand.variable} ${dancingScript.variable} font-sans antialiased`}>
        <GA4 />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
