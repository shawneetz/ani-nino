// what this file does: the root shell shared by every route, it holds the html, the body and the skip link only
// the header and footer now live in the route group layouts, so a route can choose its own frame
//   app/(site)/layout.tsx draws header + page + footer
//   app/(map)/map/layout.tsx draws header + a full height map area, no footer
// change in this version (m1): header and footer moved out of this file
import type { Metadata } from "next";
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
        {/* the skip link jumps to the element with id="main", each route group provides one */}
        <a
          href="#main"
          className="sr-only z-50 rounded bg-white p-3 text-neutral-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}