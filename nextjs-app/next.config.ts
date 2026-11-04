// What this file does: enables the Next.js features the app needs.
// The custom Turbopack CSS rule was removed. Tailwind now runs through
// postcss.config.mjs, which is the standard setup and works on Vercel.
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
