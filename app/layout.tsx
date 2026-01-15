import type React from "react"
import type { Metadata } from "next"
import { Quicksand, Dancing_Script } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
})

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-script",
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
      <body className={`${quicksand.variable} ${dancingScript.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
