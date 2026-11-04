// What this file does: shows the site name, the tagline and the main navigation
// at the top of every page. To rename the site, change the text here and the
// title in app/layout.tsx.
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="tracking-tight text-neutral-950">
          <span className="font-semibold">Anino ng Ani</span>{" "}
          <span className="text-sm text-neutral-600">Who Paid for the Harvest?</span>
        </Link>
        <SiteNav />
      </div>
    </header>
  );
}
