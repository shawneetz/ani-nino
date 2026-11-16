// what this file does: the /about page
//   order: short narrative, method, where to start, how to contribute
//   the narrative numbers come from landingStats, so they never go out of date
//   the "where to start" box reuses FEATURED from site.ts, the same picks as the landing page
// contributions are github only in v1, so this page never mentions accounts on this site
// it is a server component and ships no client code
import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { Section } from "@/components/Section";
import { StatusTag } from "@/components/StatusTag";
import type { Program } from "@/lib/content-schema";
import { getPrograms, getSources } from "@/lib/content";
import { yearRange } from "@/lib/filter";
import { firstSentence } from "@/lib/first-sentence";
import { landingStats } from "@/lib/landing-stats";
import { CONTENT_URL, FEATURED, ISSUES_URL, REPO_URL, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Why this site exists, how each claim is checked, where to start and how to help.",
};

// the other places a first-time reader can start, besides the featured programs
const OTHER_STARTS = [
  { href: "/map", label: "Explore the map", hint: "Filter by topic, province and year." },
  { href: "/programs", label: "Browse every program", hint: "Search by title or place." },
  { href: "/charts", label: "See the numbers", hint: "Each figure links to its source." },
] as const;

// shared look for link rows, so the box stays consistent
const LINK = "tap-target inline-flex items-center text-lg font-semibold underline underline-offset-4";

/**
 * Renders the about page.
 *
 * @remarks
 * Server Component. Programs and sources are read once at build time. A slug in
 * `FEATURED` that does not match a program is skipped, so a typo never breaks the page.
 */
export default async function AboutPage() {
  const [programs, sources] = await Promise.all([getPrograms(), getSources()]);
  const stats = landingStats(programs, sources.length);

  // featured picks, in the order listed in site.ts
  const featured = FEATURED.map((slug) => programs.find((program) => program.slug === slug)).filter(
    (program): program is Program => program !== undefined,
  );

  return (
    <Container as="main" width="prose" className="space-y-10 py-6">
      <h1 className="text-3xl font-bold tracking-tight text-stone-950">About {SITE.title}</h1>

      {/* narrative: short, plain and honest about what this is */}
      <Section id="story" title="Why this site exists">
        <div className="max-w-[68ch] space-y-3 text-lg leading-relaxed text-stone-800">
          <p>
            {SITE.title} is an educational map of farm programs in CALABARZON during martial law, 1972 to 1986.
            The programs promised land, credit, cooperatives and support to farmers and fisherfolk.
            The question behind the site is the one in its name: {SITE.tagline.toLowerCase()}
          </p>
          <p>
            Each program page shows what it promised, what the record shows, and who says so, with a link to every
            source. Right now the site covers {stats.programs} programs across {stats.provincesCovered} of{" "}
            {stats.provincesTotal} provinces, using {stats.sources} sources. {stats.checking} of those programs
            are still being checked, and the page says what is open.
          </p>
          <p>
            This is a learning project, not a finished history. It lists what it does not know yet instead of
            guessing.
          </p>
        </div>
      </Section>

      {/* method: the rules every page follows */}
      <Section id="method" title="Method">
        <ul className="max-w-[68ch] list-disc space-y-2 pl-5 text-lg leading-relaxed text-stone-800">
          <li>Every claim comes from a source, and every source is labeled by who is speaking.</li>
          <li>
            A confirmed program was checked against its sources on the date shown. A program marked still checking
            shows its open question.
          </li>
          <li>A dashed marker on the map means the place is approximate.</li>
          <li>Connections between past and present are interpretation, not established findings.</li>
          <li>No farmers from the martial-law era were interviewed, so their own accounts are missing.</li>
        </ul>
        <p className="max-w-[68ch] text-lg leading-relaxed text-stone-800">
          See{" "}
          <Link href="/sources" className="underline underline-offset-2">
            Sources
          </Link>{" "}
          for the labels, open questions and every source.
        </p>
      </Section>

      {/* where to start: featured programs first, then the other ways in */}
      <Section id="where-to-start" title="Where to start" intro="New here? Open one of these three programs first.">
        <Card className="space-y-5 border-amber-300 bg-amber-50">
          {featured.length > 0 && (
            <ul className="space-y-4">
              {featured.map((program) => (
                <li key={program.slug} className="space-y-1">
                  <Link href={`/programs/${program.slug}`} className={LINK}>
                    {program.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-stone-700">
                    <span>{yearRange(program)}</span>
                    <StatusTag status={program.status} />
                  </div>
                  <p className="max-w-[68ch] leading-relaxed text-stone-800">{firstSentence(program.happened)}</p>
                </li>
              ))}
            </ul>
          )}

          {/* other ways in, for readers who would rather browse */}
          <div className="space-y-2 border-t border-amber-300 pt-4">
            <h3 className="text-lg font-semibold text-stone-900">Or browse</h3>
            <ul className="space-y-1">
              {OTHER_STARTS.map((item) => (
                <li key={item.href} className="text-base text-stone-800">
                  <Link href={item.href} className="tap-target inline-flex items-center underline underline-offset-2">
                    {item.label}
                  </Link>
                  <span className="text-stone-700">: {item.hint}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </Section>

      {/* contribute: github only in v1, so no sign-in wording here */}
      <Section id="contribute" title="How to contribute">
        <div className="max-w-[68ch] space-y-3 text-lg leading-relaxed text-stone-800">
          <p>
            All content lives in plain text files on GitHub. This site has no sign-in of its own. You need a free
            GitHub account, and you can help in three ways:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Suggest a source:</strong> fill in a short form on GitHub. Each program page has a button for
              it.
            </li>
            <li>
              <strong>Report a problem:</strong> tell us what is wrong or missing, using another short form.
            </li>
            <li>
              <strong>Edit a file:</strong> propose a change as a pull request. Checks run automatically.
            </li>
          </ul>
          <p>A maintainer reviews every change before it appears on the site. Please follow the writing rules:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Label every source honestly (who is speaking).</li>
            <li>Keep opinions out of the &quot;happened&quot; text.</li>
            <li>Do not paste long quotes.</li>
          </ul>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={ISSUES_URL}>Suggest a source</ButtonLink>
          <ButtonLink href={CONTENT_URL} variant="secondary">
            Browse the content files
          </ButtonLink>
          <ButtonLink href={REPO_URL} variant="secondary">
            Open the repository on GitHub
          </ButtonLink>
        </div>
      </Section>
    </Container>
  );
}