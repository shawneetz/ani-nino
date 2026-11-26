// what this file does: the /about page
//   order: why this site exists, using this site, method, limits, where to start,
//   reading notes, ask at a relative, glossary, contribute
//   the narrative numbers come from landingStats, so they never go out of date
//   the thin province list in "limits" is also computed from landingStats
//   the "where to start" list reuses FEATURED from site.ts, the same picks as the landing page
//   the glossary section renders GLOSSARY from src/lib/glossary.ts
// change in this version (e7): editorial layout
//   a sticky "on this page" rail from 1024px, the same one the program page uses
//   new "ask at a relative" section with three plain questions, no form, nothing collected
//   no boxed card, "where to start" is a ruled list, reading text is serif
// change in this version (e-o1): new "reading notes" section, a short labeled interpretation
//   it only repeats facts already on the program pages and links back to each one
//   the numbers in READING_NOTES are copied from those pages, so recheck them when a page changes
// section ids: story, using, method, limits, where-to-start, reading-notes,
//   ask-at-a-relative, glossary, contribute
// contributions are github only in v1, so this page never mentions accounts on this site
// it is a server component, only the rail runs a little code in the browser
import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/Button";
import { Container } from "@/components/Container";
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
    "Why this site exists, how to use and cite it, how each claim is checked, what it does not cover, where to start, reading notes, questions to ask at home and how to help.",
};

// the sections of this page, in order, the rail lists exactly these
const NAV: NavItem[] = [
  { id: "story", label: "Why this site exists" },
  { id: "using", label: "Using this site" },
  { id: "method", label: "Method" },
  { id: "limits", label: "Limits" },
  { id: "where-to-start", label: "Where to start" },
  { id: "reading-notes", label: "Reading notes" },
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

// three notes that read across the program pages, every fact comes from a page linked under it
// the wording is "this project reads", never a verdict, and no opinion words
const READING_NOTES = [
  {
    title: "The rule decided who was covered",
    text: "Presidential Decree (PD) 27 covered tenanted rice and corn land and left out sugar and other export crops. A certificate of land transfer was not a title, and title came only after payment and membership in a farmers' cooperative. This project reads these pages together as a question of scope: who stood inside the rule at all, and how far the paper went toward ownership.",
    links: [
      { href: "/programs/laguna-operation-land-transfer", label: "Operation Land Transfer in Laguna" },
      { href: "/programs/batangas-nasugbu-sugar-estates", label: "Sugar estates in Nasugbu and PD 27" },
      { href: "/programs/laguna-samahang-nayon", label: "Samahang Nayon farmer associations in Laguna" },
    ],
  },
  {
    title: "Credit reached fewer borrowers over time",
    text: "Nationally, about 400,000 farmers borrowed under Masagana 99 in the first phase and 54,250 in the fourteenth. Sources disagree on how far repayment fell. This project reads the drop as a pattern to test against Laguna loan records, which have not been found.",
    links: [{ href: "/programs/laguna-masagana-99", label: "Masagana 99 rice credit in Laguna" }],
  },
  {
    title: "Space and money were gathered before any return was shown",
    text: "Fishpen area on Laguna de Bay grew from 40 hectares in 1971 to about 30,000 hectares by 1983, and a United Nations University review says all lake revenue growth from 1968 to 1973 went to pen owners. A 1984 order told owners to turn excess pen areas over to small fishermen's associations. The coconut levy was paid by farmers when they sold copra, and the Presidential Commission on Good Government gives 9.695 billion pesos collected from 1973 to 1983. This project reads both as cases where the open question is what came back to small fishers and farmers. The Quezon page still lists that question as open.",
    links: [
      { href: "/programs/laguna-lake-fishpens", label: "Laguna de Bay fishpens" },
      { href: "/programs/quezon-coconut-levy", label: "The coconut levy in Quezon" },
    ],
  },
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

// flat note with a left rule, used instead of a boxed card
const NOTE = "max-w-[68ch] border-l-4 border-stone-500 py-1 pl-4 font-serif text-lg leading-relaxed text-stone-800";

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
    <Container as="main" className="py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-10">
      <div className="min-w-0 space-y-10">
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

        {/* reading notes: short interpretation, labeled as such, built only from facts on the program pages */}
        <Section
          id="reading-notes"
          title="Reading notes"
          kicker="Interpretation"
          intro="Three patterns this project sees across the program pages."
          className="scroll-mt-24"
        >
          <p className={NOTE}>
            These notes are interpretation, not established findings. Each one rests on the pages linked under it.
            Where a page lists a figure as missing, the note does not fill it in.
          </p>
          <ol className="border-t border-stone-400">
            {READING_NOTES.map((note) => (
              <li key={note.title} className="space-y-2 border-b border-stone-400 py-4">
                <h3 className="font-serif text-xl font-semibold text-stone-950">{note.title}</h3>
                <p className="max-w-[68ch] font-serif text-lg leading-relaxed text-stone-800">{note.text}</p>
                <ul className="font-sans text-base text-stone-800">
                  {note.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="tap-target inline-flex items-center underline underline-offset-2"
                      >
                        Program: {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <p className="max-w-[68ch] font-sans text-base leading-relaxed text-stone-700">
            See the{" "}
            <Link href="#limits" className={INLINE_LINK}>
              limits
            </Link>{" "}
            and what is{" "}
            <Link href="/sources#not-known" className={INLINE_LINK}>
              not known yet
            </Link>
            .
          </p>
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
    </Container>
  );
}