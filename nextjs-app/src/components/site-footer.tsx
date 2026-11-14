// What this file does: shows the shared footer with links in three groups
// (Explore, Evidence, Project) and the GitHub link.
import Link from "next/link";
import { REPO_URL, SITE } from "@/lib/site";

// Footer groups live here. Add the Programs link to "Explore" when /programs exists.
const GROUPS = [
  { title: "Explore", links: [{ href: "/", label: "Map" }] },
  {
    title: "Evidence",
    links: [
      { href: "/charts", label: "Charts" },
      { href: "/sources", label: "Sources" },
    ],
  },
  { title: "Project", links: [{ href: "/about", label: "About" }] },
] as const;

// Shared link look: 44px tall so it is easy to tap.
const LINK = "tap-target inline-flex items-center underline underline-offset-2";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 text-base text-stone-700 sm:grid-cols-[1fr_auto]">
        <p className="max-w-[48ch] leading-relaxed">
          {SITE.title}: an educational project. Sources are labeled; open questions are shown.
        </p>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-4 sm:grid-cols-3">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-600">{group.title}</h2>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={LINK}>{link.label}</Link>
                  </li>
                ))}
                {/* GitHub sits in the Project group. */}
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
