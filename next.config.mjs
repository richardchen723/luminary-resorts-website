/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable compression
  compress: true,
  images: {
    // Vercel Image Optimization enabled - images will be cached on Vercel's CDN
    // unoptimized: true, // Removed to enable Vercel's image optimization and CDN caching
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "a0.muscache.com",
      },
      {
        protocol: "https",
        hostname: "*.muscache.com",
      },
      {
        protocol: "https",
        hostname: "hostaway-platform.s3.us-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "bookingenginecdn.hostaway.com",
      },
      {
        protocol: "https",
        hostname: "*.hostaway.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Add experimental optimizations
  experimental: {
    optimizeCss: true,
  },
}

export default nextConfig
