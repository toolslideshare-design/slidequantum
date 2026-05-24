import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.slidesharecdn.com",
      },
      {
        protocol: "https",
        hostname: "image.slidesharecdn.com",
      },
      {
        protocol: "https",
        hostname: "**.slidesharecdn.com",
      },
      {
        protocol: "https",
        hostname: "**.slideshare.net",
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/.git/**",
          "**/node_modules/**",
          "**/.next/**",
          "**/public/downloads/**",
          path.join(process.cwd(), "node_modules"),
        ],
        followSymlinks: false,
      };
    }

    return config;
  },
};

export default nextConfig;