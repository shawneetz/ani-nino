// what this file does: renders the main navigation and marks the current page
// wide screens show the links in a row. under 640px a "menu" button opens a
// list of big (44px) rows. escape or choosing a link closes the menu
// change in this version: "map" now lives at /map, so it is current on /map
// (and on program pages, until a separate programs link exists)
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV_LINKS } from "@/lib/site";

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  // escape closes the menu and puts focus back on the menu button
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // treat nav_links as plain strings so we can check for a link that may not exist yet
  const hrefs = (NAV_LINKS as readonly { href: string }[]).map((link) => link.href);
  const hasProgramsLink = hrefs.includes("/programs");

  const isCurrent = (href: string): boolean => {
    if (href === "/programs") return pathname.startsWith("/programs");
    if (href === "/map") {
      // program pages belong to map until a separate programs link exists
      return pathname.startsWith("/map") || (pathname.startsWith("/programs") && !hasProgramsLink);
    }
    return pathname === href;
  };

  return (
    <nav aria-label="Main" className="relative">
      <button
        ref={menuButton}
        type="button"
        aria-expanded={open}
        aria-controls="main-menu"
        onClick={() => setOpen((value) => !value)}
        className="tap-target rounded-lg border border-stone-400 px-4 text-base font-medium sm:hidden"
      >
        {open ? "Close" : "Menu"}
      </button>

      {/* on phones this is a dropdown panel. from 640px up it is a plain row */}
      <ul
        id="main-menu"
        className={`${open ? "flex" : "hidden"} absolute right-0 top-full z-40 mt-2 w-56 flex-col rounded-card border border-stone-200 bg-white p-2 shadow-lg sm:static sm:mt-0 sm:flex sm:w-auto sm:flex-row sm:gap-1 sm:border-0 sm:p-0 sm:shadow-none`}
      >
        {NAV_LINKS.map(({ href, label }) => {
          const current = isCurrent(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`tap-target flex items-center rounded-lg px-3 text-base underline-offset-4 hover:underline ${
                  current ? "font-semibold text-stone-900 underline" : "text-stone-700"
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
