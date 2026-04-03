import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.exciteonlineservices.com.au",
      },
    ],
  },
};

export default nextConfig;
