import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  typedRoutes: true,
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
