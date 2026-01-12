/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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
    ],
  },
}

export default nextConfig
