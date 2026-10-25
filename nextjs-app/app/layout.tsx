// What this file does: sets shared page metadata and the accessible root layout.
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ani Nino — Programs, places, and evidence",
  description: "Explore public programs, their promises, and the records connected to them.",
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
        {children}
      </body>
    </html>
  );
}
