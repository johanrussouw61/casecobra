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
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true, // Also log fetches that are restored from the HMR cache
    },
    // You can also manage incoming requests logging
    incomingRequests: true,
  },
};

export default nextConfig;
