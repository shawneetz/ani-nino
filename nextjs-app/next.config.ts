// What this file does: enables the Next.js features the app needs.
// Tailwind runs through postcss.config.mjs, the standard setup that works on Vercel.
// redirects are built from the moved map, so old program links keep working
import type { NextConfig } from "next";
import { MOVED } from "./src/lib/moved";

// "standalone" output is only needed for Docker-style hosting. Vercel does not use it.
// It also makes Windows builds fail (EPERM) because it creates symlinks.
// So it is OFF by default. Turn it on with: STANDALONE=1 pnpm build
const useStandalone = process.env.STANDALONE === "1";

const nextConfig: NextConfig = {
  ...(useStandalone ? { output: "standalone" as const } : {}),
  poweredByHeader: false,
  reactStrictMode: true,
  // Content YAML is read on the server. This makes sure the files are shipped
  // with the server code if any page ever reads them at run time.
  outputFileTracingIncludes: {
    "/**/*": ["./content/**/*"],
  },
  async redirects() {
    return Object.entries(MOVED).map(([from, to]) => ({
      source: `/programs/${from}`,
      destination: `/programs/${to}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
