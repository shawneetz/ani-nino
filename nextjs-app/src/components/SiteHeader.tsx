// What this file does: shows the site name, the tagline and the main navigation
// at the top of every page. To rename the site, change SITE in src/lib/site.ts
// and the title in app/layout.tsx.
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SITE } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="border-b border-stone-200 bg-white">
      {/* "relative" lets the phone menu open right under this bar. */}
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="tap-target flex flex-wrap items-baseline gap-x-2 tracking-tight text-stone-950">
          <span className="text-xl font-bold">{SITE.title}</span>
          {/* The tagline wraps on narrow phones instead of being cut off. */}
          <span className="text-base text-stone-600">{SITE.tagline}</span>
        </Link>
        <SiteNav />
      </div>
    </header>
  );
}
