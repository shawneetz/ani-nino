// What this file does: enables the Next.js features the app needs.
// The custom Turbopack CSS rule was removed. Tailwind now runs through
// postcss.config.mjs, which is the standard setup and works on Vercel.
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only used by Docker. Vercel ignores it. Remove it if the Vercel build complains.
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  // Ship the offline snapshot with every serverless function so the
  // database-down fallback also works on Vercel.
  outputFileTracingIncludes: { "/*": ["./snapshot/snapshot.json"] },
};

export default nextConfig;
