// what this file does: the 404 page for the whole site
//   next.js shows it for unknown urls and when a page calls notFound()
//   (for example /programs/some-bad-slug in app/programs/[slug]/page.tsx)
//   it points the reader to the map and the programs list, the two best ways back in
// change in this version (e7): editorial type, a 2px ink rule, a kicker and a serif title
// it is a server component and ships no client code
// it renders inside the shared layout, so the header, footer and skip link stay in place
import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/Button";
import { Container } from "@/components/Container";
import { Kicker } from "@/components/Kicker";

// next.js adds noindex to 404 pages on its own, so only the title is set here
export const metadata: Metadata = { title: "Page not found" };

/**
 * Renders the 404 page: a short message and two ways back into the site.
 *
 * @remarks
 * Server Component. The root element is `<main>` through `Container`, so the
 * skip link in `layout.tsx` still has its `#main` target.
 */
export default function NotFound() {
  return (
    <Container as="main" width="prose" className="space-y-6 py-12">
      <div className="space-y-3 border-t-2 border-ink pt-4">
        {/* small label so the reader knows what kind of page this is */}
        <Kicker>Error 404</Kicker>
        <h1 className="font-serif text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-tight tracking-tight text-stone-950">
          We could not find that page
        </h1>
        <p className="max-w-[68ch] font-serif text-lg leading-relaxed text-stone-800">
          The link may be old or mistyped, or the program may have been renamed. Try the map or the full
          list of programs instead.
        </p>
      </div>

      {/* the two main ways back in, the map is the primary action */}
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/map">Explore the map</ButtonLink>
        <ButtonLink href="/programs" variant="secondary">
          Browse all programs
        </ButtonLink>
      </div>

      {/* a quiet third option for readers who want to start over */}
      <p className="font-sans text-base text-stone-700">
        Or go back to the{" "}
        <Link href="/" className="tap-target inline-flex items-center underline underline-offset-2">
          home page
        </Link>
        .
      </p>
    </Container>
  );
}