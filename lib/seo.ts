import type { Metadata } from 'next'

const baseUrl = 'https://luminaryresorts.com'
const siteName = 'Luminary Resorts at Hilltop'

export interface SEOConfig {
  title: string
  description: string
  path: string
  image?: string
  noindex?: boolean
  canonical?: string
}

export function generateMetadata(config: SEOConfig): Metadata {
  const { title, description, path, image, noindex, canonical } = config
  
  const url = `${baseUrl}${path}`
  const ogImage = image || `${baseUrl}/og-image.jpg`
  
  return {
    title,
    description,
    ...(noindex && { robots: { index: false, follow: true } }),
    alternates: {
      canonical: canonical || url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export function getCabinSEO(cabin: { name: string; slug: string; description: string; images?: string[] }) {
  const features: Record<string, string> = {
    moss: 'Forest Views',
    dew: 'Private Pool',
    sol: 'Panoramic Views',
    mist: 'Lakefront Access',
  }
  
  const feature = features[cabin.slug] || 'Luxury Amenities'
  const title = `${cabin.name} Cabin | Luxury Tiny House with ${feature} | Luminary Resorts, TX`
  const description = `${cabin.description.substring(0, 120)}... Perfect for couples seeking romance and tranquility. Book ${cabin.name} cabin near Houston.`
  
  return {
    title,
    description,
    image: cabin.images?.[0] || `${baseUrl}/og-image.jpg`,
  }
}
