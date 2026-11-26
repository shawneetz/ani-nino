// what this file does: shows the masthead at the top of every page
// a serif wordmark, the tagline in sans and the main navigation, with a 2px ink rule under the bar
// to rename the site, change SITE in src/lib/site.ts and the title in app/layout.tsx
// change in this version (e2): editorial masthead, sits on paper (not white) with a heavy bottom rule
// hidden in print, a printed page does not need a menu
import Link from "next/link";
import { PAGE_WIDTH } from "@/components/Container";
import { SiteNav } from "@/components/SiteNav";
import { SITE } from "@/lib/site";

export function SiteHeader() {
  return (
    // the thick rule under the bar is the masthead line of a printed page
    <header className="border-b-2 border-ink bg-paper print:hidden">
      {/* "relative" lets the phone menu open right under this bar */}
      <div className={`relative mx-auto flex ${PAGE_WIDTH} items-center justify-between gap-x-6 gap-y-2 px-4 py-3`}>
        <Link href="/" className="tap-target flex flex-wrap items-baseline gap-x-3 tracking-tight text-stone-950">
          <span className="font-serif text-2xl font-bold">{SITE.title}</span>
          {/* the tagline wraps on narrow phones instead of being cut off */}
          <span className="font-sans text-base text-stone-700">{SITE.tagline}</span>
        </Link>
        <SiteNav />
      </div>
    </header>
  );
}