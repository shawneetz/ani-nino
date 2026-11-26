// what this file does: the /about page
//   order: why this site exists, using this site, method, limits, where to start,
//   ask at a relative, glossary, contribute
//   the narrative numbers come from landingStats, so they never go out of date
//   the thin province list in "limits" is also computed from landingStats
//   the "where to start" list reuses FEATURED from site.ts, the same picks as the landing page
//   the glossary section renders GLOSSARY from src/lib/glossary.ts
// change in this version (e7): editorial layout
//   a sticky "on this page" rail from 1024px, the same one the program page uses
//   new "ask at a relative" section with three plain questions, no form, nothing collected
//   no boxed card, "where to start" is a ruled list, reading text is serif
// section ids: story, using, method, limits, where-to-start, ask-at-a-relative, glossary, contribute
// contributions are github only in v1, so this page never mentions accounts on this site
// it is a server component, only the rail runs a little code in the browser
import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/Button";
import { Kicker } from "@/components/Kicker";
import { PageRail, type NavItem } from "@/components/PageNav";
import { Section } from "@/components/Section";
import { StatusTag } from "@/components/StatusTag";
import type { Program } from "@/lib/content-schema";
import { getPrograms, getSources } from "@/lib/content";
import { yearRange } from "@/lib/filter";
import { firstSentence } from "@/lib/first-sentence";
import { GLOSSARY } from "@/lib/glossary";
import { landingStats } from "@/lib/landing-stats";
import { CONTENT_URL, FEATURED, ISSUES_URL, REPO_URL, SITE } from "@/lib/site";
import { PROVINCE_KEYS, PROVINCE_LABELS } from "@/lib/vocab";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why this site exists, how to use and cite it, how each claim is checked, what it does not cover, where to start, questions to ask at home and how to help.",
};

// the sections of this page, in order, the rail lists exactly these
const NAV: NavItem[] = [
  { id: "story", label: "Why this site exists" },
  { id: "using", label: "Using this site" },
  { id: "method", label: "Method" },
  { id: "limits", label: "Limits" },
  { id: "where-to-start", label: "Where to start" },
  { id: "ask-at-a-relative", label: "Ask at a relative" },
  { id: "glossary", label: "Glossary" },
  { id: "contribute", label: "How to contribute" },
];

// the other places a first-time reader can start, besides the featured programs
const OTHER_STARTS = [
  { href: "/map", label: "Explore the map", hint: "Filter by topic, province and year." },
  { href: "/programs", label: "Browse every program", hint: "Search by title or place." },
  { href: "/charts", label: "See the numbers", hint: "Each figure links to its source." },
] as const;

// three plain questions for someone who farmed or fished in those years
const RELATIVE_QUESTIONS = [
  "Did a family or neighbor farm or fish in 1972 to 1986, and where?",
  "Did anyone borrow for seed or fertilizer, and how did repayment go?",
  "Did anyone join a farmers' association, or lose land or fishing grounds?",
] as const;

// shared looks, so the sections stay consistent
const LINK = "tap-target inline-flex items-center font-serif text-xl font-semibold underline underline-offset-4";
const INLINE_LINK = "underline underline-offset-2";
const PROSE = "max-w-[68ch] space-y-3 font-serif text-lg leading-relaxed text-stone-800";
const LIST = "max-w-[68ch] list-disc space-y-2 pl-5 font-serif text-lg leading-relaxed text-stone-800";
const ORDERED = "max-w-[68ch] list-decimal space-y-2 pl-5 font-serif text-lg leading-relaxed text-stone-800";

// a province with this many programs or fewer is called thin
const THIN_MAX = 1;

/**
 * Renders the about page.
 *
 * @remarks
 * Server Component. Programs and sources are read once at build time. A slug in
 * `FEATURED` that does not match a program is skipped, so a typo never breaks the page.
 * The list of thin provinces is counted from the content, so it never goes out of date.
 * The page owns the `main` id for the skip link, because the rail needs its own grid.
 */
export default async function AboutPage() {
  const [programs, sources] = await Promise.all([getPrograms(), getSources()]);
  const stats = landingStats(programs, sources.length);

  // featured picks, in the order listed in site.ts
  const featured = FEATURED.map((slug) => programs.find((program) => program.slug === slug)).filter(
    (program): program is Program => program !== undefined,
  );

  // provinces with one program or none, for example "Cavite has no program"
  const thinProvinces = PROVINCE_KEYS.filter((province) => stats.provinceCounts[province] <= THIN_MAX).map(
    (province) =>
      `${PROVINCE_LABELS[province]} has ${stats.provinceCounts[province] === 0 ? "no program" : "one program"}`,
  );

  return (
    // on desktop the content and the sticky rail sit side by side
    <main id="main" className="mx-auto max-w-6xl px-4 py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-10">
      <div className="max-w-3xl space-y-10">
        <header className="space-y-3 border-t-2 border-ink pt-4">
          <Kicker>The project</Kicker>
          <h1 className="font-serif text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-tight tracking-tight text-stone-950">
            About {SITE.title}
          </h1>
        </header>

        {/* narrative: short, plain and honest about what this is */}
        <Section id="story" title="Why this site exists" className="scroll-mt-24">
          <div className={PROSE}>
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

        {/* using: five short bullets, one for each thing a reader needs to do */}
        <Section id="using" title="Using this site" className="scroll-mt-24">
          <ul className={LIST}>
            <li>
              <strong>Read the labels.</strong> Every source says who is speaking. A label is not a verdict on whether
              the source is right. See{" "}
              <Link href="/sources#labels" className={INLINE_LINK}>
                Source labels
              </Link>
              .
            </li>
            <li>
              <strong>Read the map key.</strong> A solid marker is a confirmed program, a hollow marker is still being
              checked, and a dashed border means the place is approximate. The full key is under the map.
            </li>
            <li>
              <strong>Filter to confirmed pages.</strong> Switch on Confirmed only on the{" "}
              <Link href="/map" className={INLINE_LINK}>
                map
              </Link>{" "}
              or in the{" "}
              <Link href="/programs" className={INLINE_LINK}>
                programs list
              </Link>{" "}
              to see only programs checked against their sources.
            </li>
            <li>
              <strong>Cite a page.</strong> Each program page ends with a Cite this page box. The line you copy says
              whether the page is confirmed or still being checked.
            </li>
            <li>
              <strong>Report an error.</strong> Each program page has a Report a problem button. It opens a short form
              on GitHub with the program already filled in.
            </li>
          </ul>
        </Section>

        {/* method: the five rules a page follows before it goes live */}
        <Section id="method" title="Method" className="scroll-mt-24">
          <ol className={ORDERED}>
            <li>Every claim has a source link with an access date, and every source has a label.</li>
            <li>A page names at least one place in Batangas, Cavite, Laguna, Quezon or Rizal.</li>
            <li>
              A source must say what happened to farmers or fisherfolk there. A law that only names a place is not
              enough.
            </li>
            <li>
              Region IV in the martial-law years was wider than CALABARZON. It also held Mindoro, Marinduque,
              Romblon and Palawan, so a regional figure from then is not used as a local number.
            </li>
            <li>
              Confirmed means every claim was checked against an opened source on the date shown. It does not mean
              the record is complete.
            </li>
          </ol>
        </Section>

        {/* limits: what the site cannot tell you, province counts come from the content */}
        <Section id="limits" title="Limits" className="scroll-mt-24">
          <ul className={LIST}>
            <li>No farmers from the martial-law era were interviewed, so their own accounts are missing.</li>
            {thinProvinces.length > 0 && (
              <li>
                Coverage is thin in some provinces: {thinProvinces.join("; ")}. Topics without a source on what
                happened to farmers or fisherfolk are held back. See{" "}
                <Link href="/sources#held-topics" className={INLINE_LINK}>
                  Held topics
                </Link>
                .
              </li>
            )}
            <li>Connections between past and present are interpretation, not established findings.</li>
          </ul>
        </Section>

        {/* where to start: featured programs first, then the other ways in, both as ruled lists */}
        <Section
          id="where-to-start"
          title="Where to start"
          intro="New here? Open one of these three programs first."
          className="scroll-mt-24"
        >
          {featured.length > 0 && (
            <ul className="border-t border-stone-400">
              {featured.map((program) => (
                <li key={program.slug} className="space-y-1 border-b border-stone-400 py-4">
                  <Link href={`/programs/${program.slug}`} className={LINK}>
                    {program.title}
                  </Link>
                  <div className="figures flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-base text-stone-700">
                    <span>{yearRange(program)}</span>
                    <StatusTag status={program.status} />
                  </div>
                  <p className="max-w-[68ch] font-serif text-lg leading-relaxed text-stone-800">
                    {firstSentence(program.happened)}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {/* other ways in, for readers who would rather browse */}
          <div className="space-y-2 pt-2">
            <h3 className="font-serif text-xl font-semibold text-stone-950">Or browse</h3>
            <ul className="border-t border-stone-400">
              {OTHER_STARTS.map((item) => (
                <li key={item.href} className="border-b border-stone-400 py-1 font-serif text-lg text-stone-800">
                  <Link href={item.href} className="tap-target inline-flex items-center underline underline-offset-2">
                    {item.label}
                  </Link>
                  <span className="text-stone-700">: {item.hint}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* ask at a relative: plain questions, no form, nothing is collected */}
        <Section
          id="ask-at-a-relative"
          title="Ask at a relative"
          intro="Three questions for someone who farmed or fished in those years."
          className="scroll-mt-24"
        >
          <div className={PROSE}>
            <p>
              There is no form here and nothing is collected. These are questions to ask over a meal, in your own
              words and at your own pace.
            </p>
          </div>
          <ol className={ORDERED}>
            {RELATIVE_QUESTIONS.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
          <div className={PROSE}>
            <p>
              What a relative tells you is a personal account. It is not a source on this site. To add a documented
              source, see{" "}
              <Link href="#contribute" className={INLINE_LINK}>
                How to contribute
              </Link>
              .
            </p>
          </div>
        </Section>

        {/* glossary: short forms in plain words */}
        <Section
          id="glossary"
          title="Glossary"
          intro="Short forms used on program pages, in plain words."
          className="scroll-mt-24"
        >
          <dl className="max-w-[68ch] border-t border-stone-400">
            {GLOSSARY.map((entry) => (
              <div key={entry.term} className="border-b border-stone-400 py-3">
                <dt className="font-serif text-lg font-semibold text-stone-950">
                  {entry.term}: {entry.name}
                </dt>
                <dd className="font-serif text-lg leading-relaxed text-stone-800">{entry.meaning}</dd>
              </div>
            ))}
          </dl>
        </Section>

        {/* contribute: github only in v1, so no sign-in wording here */}
        <Section id="contribute" title="How to contribute" className="scroll-mt-24">
          <div className={PROSE}>
            <p>
              All content lives in plain text files on GitHub. This site has no sign-in of its own. You need a free
              GitHub account, and you can help in three ways:
            </p>
          </div>
          <ul className={LIST}>
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
          <div className={PROSE}>
            <p>A maintainer reviews every change before it appears on the site. Please follow the writing rules:</p>
          </div>
          <ul className={LIST}>
            <li>Label every source honestly (who is speaking).</li>
            <li>Keep opinions out of the &quot;happened&quot; text.</li>
            <li>Do not paste long quotes.</li>
          </ul>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href={ISSUES_URL}>Suggest a source</ButtonLink>
            <ButtonLink href={CONTENT_URL} variant="secondary">
              Browse the content files
            </ButtonLink>
            <ButtonLink href={REPO_URL} variant="secondary">
              Open the repository on GitHub
            </ButtonLink>
          </div>
        </Section>
      </div>

      {/* desktop only sticky rail */}
      <PageRail items={NAV} />
    </main>
  );
}