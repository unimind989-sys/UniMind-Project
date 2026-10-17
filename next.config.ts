import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  typedRoutes: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // The loopback demo proxy rewrites to http://127.0.0.1:<port>/synthetic-runtime/.
  // Proxy URL normalization renames that host to localhost, so the router no
  // longer sees its own origin and proxies the render over HTTP with a 30 s
  // timeout. Only the demo sends rewrites as written; real mode is unchanged.
  ...(process.env.UNIMIND_SYNTHETIC_DEMO === "true"
    ? { skipProxyUrlNormalize: true }
    : {}),
};

export default nextConfig;
