// What this file does: the three main links (Map, Charts, Methods).
// It is a client component only so it can mark the current page for screen readers.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Map" },
  { href: "/charts", label: "Charts" },
  { href: "/methods", label: "Methods" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main">
      <ul className="flex gap-4 text-sm">
        {LINKS.map(({ href, label }) => {
          const current = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={`rounded px-1 py-0.5 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 ${
                  current ? "font-semibold text-neutral-950 underline" : "text-neutral-700"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
