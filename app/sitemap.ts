import { MetadataRoute } from 'next'
import { cabins } from '@/lib/cabins'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://luminaryresorts.com'
  const currentDate = new Date()
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/location`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
  ]
  
  // Cabin pages
  const cabinPages = cabins.map((cabin) => ({
    url: `${baseUrl}/stay/${cabin.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))
  
  // Experience pages
  const experiencePages = [
    'romantic-getaway-near-houston',
    'romantic-getaway-near-dallas',
    'romantic-getaway-near-austin',
    'romantic-getaway-near-san-antonio',
    'luxury-tiny-house-texas',
    'anniversary-weekend',
    'digital-detox-nature-reset',
    'lake-livingston-weekend',
    'private-pool-getaway',
    'nature-healing-wellness',
  ].map((slug) => ({
    url: `${baseUrl}/experiences/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))
  
  return [...staticPages, ...cabinPages, ...experiencePages]
}
