import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Production optimization */
  compress: true,
  poweredByHeader: false,
  
  /* React optimization */
  reactStrictMode: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'srv1215874.hstgr.cloud',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lms.premmcxtrainingacademy.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
    // Enable automatic image optimization
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year cache for optimized images
  },
  // Optimize production builds
  productionBrowserSourceMaps: false,
  // Reduce initial page load
  experimental: {
    optimizePackageImports: ['next-auth'],
  },
  // Add custom headers for caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60'
          }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
