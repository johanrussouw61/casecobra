import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // `images.domains` is deprecated — use `remotePatterns` instead
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "gak3pf4y3r.ufs.sh",
      },
    ],
  },
};

export default nextConfig;
