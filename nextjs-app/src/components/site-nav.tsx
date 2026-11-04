// What this file does: renders the shared navigation and marks the current page.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/site";

export function SiteNav() {
  const pathname = usePathname();
  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" || pathname.startsWith("/programs") : pathname === href;

  return (
    <nav aria-label="Main">
      <ul className="flex gap-4 text-sm">
        {NAV_LINKS.map(({ href, label }) => {
          const current = isCurrent(href);
          return <li key={href}><Link href={href} aria-current={current ? "page" : undefined} className={`rounded px-1 py-0.5 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 ${current ? "font-semibold text-stone-900 underline" : "text-stone-700"}`}>{label}</Link></li>;
        })}
      </ul>
    </nav>
  );
}
