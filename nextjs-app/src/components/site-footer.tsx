// What this file does: provides shared footer navigation and the repository link.
import Link from "next/link";
import { NAV_LINKS, REPO_URL, SITE } from "@/lib/site";

export function SiteFooter() {
  return <footer className="mt-auto border-t border-stone-200 bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm text-stone-600"><p>{SITE.title}: an educational project. Sources are labeled; open questions are shown.</p><ul className="flex flex-wrap gap-4">{NAV_LINKS.map((link) => <li key={link.href}><Link href={link.href} className="underline underline-offset-2">{link.label}</Link></li>)}<li><a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">GitHub</a></li></ul></div></footer>;
}
