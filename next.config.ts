import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // better-sqlite3를 외부 패키지로 처리
  serverExternalPackages: ['better-sqlite3'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
