import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'srv1215874.hstgr.cloud',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
