// what this file does: the shared footer, one slim row on paper with a heavy top rule
// the project line sits on the left and a github link sits on the right
// page links were removed because the header already has them
import { PAGE_WIDTH } from "@/components/Container";
import { REPO_URL, SITE } from "@/lib/site";

/**
 * Renders the site footer with a short colophon line and grouped links.
 *
 * @remarks
 * Server Component. It has no state, so no client code is shipped for it.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t-2 border-ink bg-paper print:hidden">
      <div className={`mx-auto flex ${PAGE_WIDTH} flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-4 text-base text-stone-700`}>
        <p className="font-serif">
          {SITE.title}: an educational project. Sources are labeled; open questions are shown.
        </p>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="tap-target inline-flex items-center font-sans underline underline-offset-2 hover:text-ink"
        >
          GitHub
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </footer>
  );
}