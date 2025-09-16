import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vibecodeproject1.blob.core.windows.net',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
