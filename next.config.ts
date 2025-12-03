import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.cloudflare.com",
      },
      // Add your specific CDN domain here
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  transpilePackages: ["@heroui/react", "@heroui/theme"],
};

export default nextConfig;
