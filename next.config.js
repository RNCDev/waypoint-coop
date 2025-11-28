/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Compress output
  compress: true,
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Ensure API routes are not statically optimized
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Optimize build performance by tree-shaking unused exports
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-label',
      'lucide-react',
      'date-fns',
      'framer-motion',
    ],
  },
  // Configure Turbopack (Next.js 16 default bundler)
  turbopack: {
    // Set root directory to fix workspace warning
    root: __dirname,
  },
  // Suppress known warnings that don't affect functionality
  onDemandEntries: {
    // Keep pages in memory for faster navigation
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig

