import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'arweave.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.ipfs.dweb.link',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.jup.ag',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.arweave.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.arweave.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.helius.xyz',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
