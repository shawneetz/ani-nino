// What this file does: enables the Next.js features and CSS build rules used by the app.
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only used by Docker. Vercel ignores it. Remove it if the Vercel build complains.
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  // Ship the offline snapshot with every serverless function so the
  // database-down fallback also works on Vercel.
  outputFileTracingIncludes: { "/*": ["./snapshot/snapshot.json"] },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
