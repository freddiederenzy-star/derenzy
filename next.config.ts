import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Support for custom domains - add your domain here
  // async rewrites() {
  //   return [
  //     {
  //       source: '/:path*',
  //       destination: '/:path*',
  //     },
  //   ];
  // },
  
  // Image optimization - add your domains here
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
