// What this file does: sets the page shell shared by every route.
// It adds the site header (with nav), the skip link, and the title and
// share-card (Open Graph) metadata. The share image comes from opengraph-image.tsx.
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

// Share links need an absolute URL. Vercel provides the production host.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

const title = "Anino ng Ani: Sino ang Nagbayad sa Masaganang Ani?";
const description =
  "Who Paid for the Harvest? An evidence-labeled map of martial-law farm policy in CALABARZON, 1972 to 1986, with the programs that echo it today.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: "%s | Anino ng Ani" },
  description,
  openGraph: { title, description, type: "website", locale: "en_PH" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded bg-white p-3 text-neutral-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        {/* The header lives here so every page gets it. Each page renders its own <main id="main">. */}
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
