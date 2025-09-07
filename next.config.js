/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude Prisma from client-side bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@prisma/client': false,
        'prisma': false,
      }
    }
    return config
  },
}

module.exports = nextConfig
