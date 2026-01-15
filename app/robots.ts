import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://luminaryresorts.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/booking/*', // Block booking pages with query params
          '/api/',
          '/tools/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
