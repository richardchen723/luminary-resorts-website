import type React from "react"
import type { Metadata } from "next"
import { Quicksand } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Luminary Resorts @ Hilltop | Private Retreat in Point Blank, Texas",
  description:
    "Where silence reflects love. A private hilltop retreat for couples seeking romance, healing, and renewal. Four intimate cabins hidden in nature, Point Blank, Texas.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
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
      <body className={`${quicksand.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
