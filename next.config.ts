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
  // Add custom headers for caching - NO cache for HTML pages, aggressive cache for static assets
  async headers() {
    return [
      // No caching for HTML pages - force fresh content every time
      {
        source: '/:path((?!_next|api|static).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          }
        ]
      },
      // Short cache for API routes
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          }
        ]
      },
      // Aggressive cache for Next.js static assets
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // Cache images aggressively
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // Disable cache for proxy endpoints
      {
        source: '/api/proxy-image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
