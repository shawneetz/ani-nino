// What this file does: sets the shared page shell, navigation, footer and metadata.
// change in this version (c5): the site url now comes from SITE_URL in site.ts
import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SITE, SITE_URL } from "@/lib/site";
import "./globals.css";

const title = `${SITE.title}: ${SITE.subtitle}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: `%s | ${SITE.title}` },
  description: SITE.description,
  openGraph: { title, description: SITE.description, type: "website", locale: "en_PH" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <a href="#main" className="sr-only z-50 rounded bg-white p-3 text-neutral-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
