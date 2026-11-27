// what this file does: the 404 page for the whole site
//   next.js shows it for unknown urls and when a page calls notFound()
//   (for example /programs/some-bad-slug in app/(site)/programs/[slug]/page.tsx)
//   it points the reader to the map and the programs list, the two best ways back in
// change in this version (e7): editorial type, a 2px ink rule, a kicker and a serif title
// change in this version (m1): it draws the header and footer itself
//   a root not-found page renders inside the root layout only, not inside a route group layout,
//   so without this the 404 would have no header or footer
// it is a server component and ships no client code
import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/Button";
import { BODY, Container, PAGE_HEADER, PAGE_STACK, PAGE_TITLE } from "@/components/Container";
import { Kicker } from "@/components/Kicker";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

// next.js adds noindex to 404 pages on its own, so only the title is set here
export const metadata: Metadata = { title: "Page not found" };

/**
 * Renders the 404 page: a short message and two ways back into the site.
 *
 * @remarks
 * Server Component. The page element is `<main>` through `Container`, so the
 * skip link in `layout.tsx` still has its `#main` target.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <Container as="main" className={PAGE_STACK}>
        <div className={PAGE_HEADER}>
          {/* small label so the reader knows what kind of page this is */}
          <Kicker>Error 404</Kicker>
          <h1 className={PAGE_TITLE}>We could not find that page</h1>
          <p className={BODY}>
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
      <SiteFooter />
    </>
  );
}