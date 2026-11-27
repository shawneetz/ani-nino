// what this file does: shows the shared footer as a colophon
// one line about the project, then three link groups (explore, evidence, project) and the github link
// change in this version (e2): editorial colophon, sits on paper with a hairline top rule
// light text uses stone-700 or darker
// hidden in print, and not rendered on /map once the route groups land (stage m1)
// change in this version (u7): the top rule matches the masthead, link groups align with the colophon
import Link from "next/link";
import { PAGE_WIDTH } from "@/components/Container";
import { REPO_URL, SITE } from "@/lib/site";

/**
 * The footer link groups, shown as columns.
 *
 * @remarks
 * Keep the "Explore" group in step with `NAV_LINKS` in `src/lib/site.ts`.
 * The GitHub link is added to the "Project" group in the component.
 */
const GROUPS = [
  {
    title: "Explore",
    links: [
      { href: "/map", label: "Map" },
      { href: "/programs", label: "Programs" },
    ],
  },
  {
    title: "Evidence",
    links: [
      { href: "/charts", label: "Charts" },
      { href: "/sources", label: "Sources" },
    ],
  },
  { title: "Project", links: [{ href: "/about", label: "About" }] },
] as const;

// shared link look: 44px tall so it is easy to tap
const LINK = "tap-target inline-flex items-center font-sans underline underline-offset-2 hover:text-ink";

/**
 * Renders the site footer with a short colophon line and grouped links.
 *
 * @remarks
 * Server Component. It has no state, so no client code is shipped for it.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t-2 border-ink bg-paper print:hidden">
      <div className={`mx-auto grid ${PAGE_WIDTH} gap-6 px-4 py-6 text-base text-stone-700 sm:grid-cols-[1fr_auto] sm:items-start`}>
        {/* the colophon line, set in serif like the end matter of a book */}
        <p className="max-w-[48ch] font-serif leading-relaxed">
          {SITE.title}: an educational project. Sources are labeled; open questions are shown.
        </p>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-6 sm:grid-cols-3">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="font-sans text-sm font-semibold uppercase tracking-kicker text-stone-700">{group.title}</h2>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={LINK}>{link.label}</Link>
                  </li>
                ))}
                {/* github sits in the project group */}
                {group.title === "Project" && (
                  <li>
                    <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={LINK}>GitHub</a>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}