/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    domains: ['placeholder.com'], // Add domains for any external images you might use
  },
}

module.exports = nextConfig