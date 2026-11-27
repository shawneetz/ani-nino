// what this file does: the landing page at "/", it explains the site in about 10 seconds
// and sends a first-time reader to a program in two taps
// blocks (spec 5.1): masthead, ledger strip, how to read, start here, by province,
//   from then to now, timeline, what we do not know, held topics note, call to action
// it is a server component and loads no maplibre code (the map lives at /map)
// old shared links such as "/?topic=land" are redirected to "/map?topic=land"
// note: reading searchparams makes this page render on request instead of at build time
// change in this version (e4): editorial layout
//   no boxed cards, sections are opened by rules, numbers are serif figures
//   new "from then to now" block, built from dated `since` entries (see src/lib/latest-since.ts)
//   the held topics note moved below the unknowns, the order of spec 5.1
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/Button";
import { FeaturedProgramCard } from "@/components/FeaturedProgramCard";
import { Container, HEADING, PAGE_STACK } from "@/components/Container";
import { Hero } from "@/components/Hero";
import { Kicker } from "@/components/Kicker";
import { Section } from "@/components/Section";
import { StatusTag } from "@/components/StatusTag";
import { TimelineStrip } from "@/components/TimelineStrip";
import { VoiceChip } from "@/components/VoiceChip";
import type { Gap, Program } from "@/lib/content-schema";
import { getGaps, getPrograms, getSources } from "@/lib/content";
import { EMPTY_FILTERS, visiblePrograms } from "@/lib/filter";
import { HELD_TOPICS } from "@/lib/held-topics";
import { landingStats, provinceTileText } from "@/lib/landing-stats";
import { latestSince } from "@/lib/latest-since";
import { legacyRedirect, type RawParams } from "@/lib/legacy-redirect";
import { CONTENT_URL, FEATURED, FEATURED_GAPS, ISSUES_URL, SITE } from "@/lib/site";
import {
  GAP_KINDS,
  PROGRAM_STATUS_BLURBS,
  PROGRAM_STATUS_KEYS,
  PROVINCE_KEYS,
  PROVINCE_LABELS,
  VOICES,
  VOICE_KEYS,
} from "@/lib/vocab";

export const metadata: Metadata = {
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: { title: `${SITE.title}: ${SITE.tagline}`, description: SITE.description, type: "website" },
};

// the three steps every program page follows
const STEPS = [
  { title: "1. What it promised", body: "The goal the law or the government set out, in plain words." },
  {
    title: "2. What the record shows",
    body: "What documents, reports and studies say actually happened. Opinions are kept out of this part.",
  },
  {
    title: "3. Who says so",
    body: "Every source has a label for who is speaking. A label is not a verdict on whether the source is right.",
  },
] as const;

// ledger cells are split by hairlines, the first cell has none
// on a phone the grid has 2 columns, so only the right cell of each row gets one
// from 768px the grid has 4 columns, so every cell except the first gets one
const DIVIDER = "border-l border-stone-400 pl-4";
const DIVIDER_WIDE = "md:border-l md:border-stone-400 md:pl-4";

// shared look for small link rows
const TEXT_LINK = "tap-target inline-flex items-center underline underline-offset-2";

export default async function HomePage({ searchParams }: { searchParams: Promise<RawParams> }) {
  // step 1: old filter links go to the map with the same filters
  const target = legacyRedirect(await searchParams);
  if (target) redirect(target);

  // step 2: load everything once, on the server
  const [allPrograms, sources, gaps] = await Promise.all([getPrograms(), getSources(), getGaps()]);
  const stats = landingStats(allPrograms, sources.length);
  const martialLaw = visiblePrograms(allPrograms, EMPTY_FILTERS); // no filters = martial-law layer only
  const thenToNow = latestSince(allPrograms); // dated records from 2000 onward, newest first

  // featured items are picked by slug or id, anything missing is skipped, not an error
  const featured = FEATURED.map((slug) => allPrograms.find((program) => program.slug === slug)).filter(
    (program): program is Program => program !== undefined,
  );
  const featuredGaps = FEATURED_GAPS.map((id) => gaps.find((gap) => gap.id === id)).filter(
    (gap): gap is Gap => gap !== undefined,
  );
  const titleBySlug = new Map(allPrograms.map((program) => [program.slug, program.title]));

  // every number is computed from the content, none is typed by hand
  const numbers = [
    { label: "Programs", value: String(stats.programs) },
    { label: "Provinces covered", value: `${stats.provincesCovered} of ${stats.provincesTotal}` },
    { label: "Sources", value: String(stats.sources) },
    { label: "Still being checked", value: String(stats.checking) },
  ];

  return (
    <main id="main">
      <Hero />
      <Container className={PAGE_STACK}>

      {/* ledger strip: one row of large serif numerals split by hairlines */}
      <section aria-label="The site in numbers">
        <dl className="grid grid-cols-2 gap-y-6 border-b border-stone-400 pb-6 md:grid-cols-4">
          {numbers.map((item, index) => (
            <div key={item.label} className={index === 0 ? "" : index % 2 === 1 ? DIVIDER : DIVIDER_WIDE}>
              <dt className="font-sans text-base text-stone-700">{item.label}</dt>
              <dd className="figures font-serif text-4xl font-bold text-accent-strong">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* how to read: explains labels before the reader meets them */}
      <Section
        id="how-to-read"
        title="How to read this site"
        intro="Every program page follows the same order, so you can compare them."
      >
        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.title} className="border-t border-stone-400 pt-3">
              <h3 className="font-serif text-lg font-semibold text-stone-950">{step.title}</h3>
              <p className="mt-2 font-serif leading-relaxed text-stone-800">{step.body}</p>
            </li>
          ))}
        </ol>
        <div className="grid gap-8 pt-2 md:grid-cols-2">
          <div className="border-t border-stone-400 pt-3">
            <h3 className="font-serif text-lg font-semibold text-stone-950">The four source labels</h3>
            <dl className="mt-3 space-y-3">
              {VOICE_KEYS.map((voice) => (
                <div key={voice} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <dt>
                    <VoiceChip voice={voice} />
                  </dt>
                  <dd className="font-sans text-base text-stone-800">{VOICES[voice].blurb}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="border-t border-stone-400 pt-3">
            <h3 className="font-serif text-lg font-semibold text-stone-950">The two statuses</h3>
            <dl className="mt-3 space-y-3">
              {PROGRAM_STATUS_KEYS.map((status) => (
                <div key={status} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <dt>
                    <StatusTag status={status} />
                  </dt>
                  <dd className="font-sans text-base text-stone-800">{PROGRAM_STATUS_BLURBS[status]}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      {/* start here: three featured programs as short articles, picks live in src/lib/site.ts */}
      {featured.length > 0 && (
        <Section id="start-here" title="Start here" intro="Three programs that show how the pages work.">
          <div className="grid gap-x-8 gap-y-6 md:grid-cols-3">
            {featured.map((program) => (
              <FeaturedProgramCard key={program.slug} program={program} />
            ))}
          </div>
        </Section>
      )}

      {/* provinces: five ruled rows, each opens the map with that province filtered */}
      <Section id="provinces" title="Pick a province" intro="Programs are counted by the provinces they touch.">
        <ul className="border-t border-stone-400">
          {PROVINCE_KEYS.map((province) => {
            const count = stats.provinceCounts[province];
            // an empty province explains itself instead of opening a blank map
            const href = count > 0 ? `/map?province=${province}` : `/sources#gap-${province}-not-covered`;
            return (
              <li key={province} className="border-b border-stone-400">
                <Link
                  href={href}
                  className="tap-target flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1 py-3 hover:bg-stone-100"
                >
                  <span className="font-serif text-xl font-semibold text-stone-950">{PROVINCE_LABELS[province]}</span>
                  {/* the words say how solid the coverage is, "no program yet" is only for an empty province */}
                  <span className="font-sans text-base text-stone-700">
                    {provinceTileText(count, stats.confirmedCounts[province])}
                    {count === 0 && <span className="ml-3 underline underline-offset-2">Why?</span>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* from then to now: dated records only, hidden when no entry is from 2000 onward */}
      {thenToNow.length > 0 && (
        <Section
          id="from-then-to-now"
          title="From then to now"
          intro="Dated records from 2000 onward, taken from the program pages."
        >
          <ol className="border-t border-stone-400">
            {thenToNow.map((item) => (
              <li
                key={`${item.programSlug}-${item.year}-${item.text}`}
                className="grid gap-1 border-b border-stone-400 py-4 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-x-6"
              >
                <p className="figures font-serif text-3xl font-bold text-accent-strong">{item.year}</p>
                <div className="space-y-2">
                  <p className="max-w-[68ch] font-serif text-lg leading-relaxed text-stone-800">{item.text}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-base text-stone-700">
                    <VoiceChip voice={item.source.voice} />
                    <span>{item.source.publisher}</span>
                  </div>
                  <Link href={`/programs/${item.programSlug}`} className={TEXT_LINK}>
                    Program: {item.programTitle}
                  </Link>
                </div>
              </li>
            ))}
          </ol>
          <p className="max-w-[68ch] font-sans text-base leading-relaxed text-stone-700">
            Links between then and now are interpretation, not established findings.{" "}
            <Link href="/about#limits" className="underline underline-offset-2">
              Read the limits
            </Link>
          </p>
        </Section>
      )}

      {/* timeline: one ruled row per martial-law program */}
      <Section id="timeline" title="1972 to 1986" intro="When each program ran. Tap a row to open it.">
        <TimelineStrip programs={martialLaw} />
      </Section>

      {/* unknowns: honest gaps as flat columns, the full list is on /sources */}
      {featuredGaps.length > 0 && (
        <Section
          id="unknowns"
          title="What we do not know yet"
          intro="Some questions are still open. We list them instead of guessing."
        >
          <div className="grid gap-x-8 gap-y-6 md:grid-cols-3">
            {featuredGaps.map((gap) => (
              <article key={gap.id} className="space-y-2 border-t border-stone-400 pt-3">
                <Kicker>{GAP_KINDS[gap.kind]}</Kicker>
                <h3 className="font-serif text-lg font-semibold leading-snug text-stone-950">{gap.title}</h3>
                <p className="font-serif leading-relaxed text-stone-800">{gap.description}</p>
                {gap.program && titleBySlug.has(gap.program) && (
                  <Link href={`/programs/${gap.program}`} className={`${TEXT_LINK} text-base`}>
                    Related program: {titleBySlug.get(gap.program)}
                  </Link>
                )}
              </article>
            ))}
          </div>
          <Link href="/sources" className={`${TEXT_LINK} text-base`}>
            See all gaps and open questions
          </Link>
        </Section>
      )}

      {/* held topics note: one line, only when some topics are held back */}
      {HELD_TOPICS.length > 0 && (
        <p className="max-w-[68ch] font-sans text-base leading-relaxed text-stone-700">
          Topics that do not yet have a sourced effect are held back.{" "}
          <Link href="/sources#held-topics" className={TEXT_LINK}>
            See the held topics
          </Link>
        </p>
      )}

      {/* call to action: github only in v1, so no sign-in wording here */}
      <section aria-labelledby="help-heading" className="space-y-3 border-t-2 border-ink pt-4">
        <h2 id="help-heading" className={HEADING}>
          Know a source? Help check it.
        </h2>
        <p className="max-w-[68ch] font-serif text-lg leading-relaxed text-stone-800">
          Suggest a source, report a mistake or edit a file. You need a free GitHub account. A maintainer reviews every
          change before it appears here.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={ISSUES_URL}>Suggest a source</ButtonLink>
          <ButtonLink href={CONTENT_URL} variant="secondary">
            Browse the content files
          </ButtonLink>
        </div>
      </section>
      </Container>
    </main>
  );
}