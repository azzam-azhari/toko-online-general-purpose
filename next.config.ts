import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  allowedDevOrigins: ['10.185.183.144', 'localhost'],
};

export default nextConfig;
