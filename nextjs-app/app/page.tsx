// what this file does: the landing page at "/". it explains the site in about 10 seconds
// and sends a first-time reader to a program in two taps
// sections: hero, numbers, how to read, start here, provinces, timeline, unknowns, call to action
// it is a server component and loads no maplibre code (the map lives at /map)
// old shared links such as "/?topic=land" are redirected to "/map?topic=land"
// note: reading searchparams makes this page render on request instead of at build time
// change in this version (c9)
//   province tiles show the count and its status ("1 program, still checking")
//   a one-line held topics note sits under the numbers strip, only when topics are held
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { FeaturedProgramCard } from "@/components/FeaturedProgramCard";
import { Section } from "@/components/Section";
import { StatusTag } from "@/components/StatusTag";
import { TimelineStrip } from "@/components/TimelineStrip";
import { VoiceChip } from "@/components/VoiceChip";
import type { Gap, Program } from "@/lib/content-schema";
import { getGaps, getPrograms, getSources } from "@/lib/content";
import { EMPTY_FILTERS, visiblePrograms } from "@/lib/filter";
import { HELD_TOPICS } from "@/lib/held-topics";
import { landingStats, provinceTileText } from "@/lib/landing-stats";
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

export default async function HomePage({ searchParams }: { searchParams: Promise<RawParams> }) {
  // step 1: old filter links go to the map with the same filters
  const target = legacyRedirect(await searchParams);
  if (target) redirect(target);

  // step 2: load everything once, on the server
  const [allPrograms, sources, gaps] = await Promise.all([getPrograms(), getSources(), getGaps()]);
  const stats = landingStats(allPrograms, sources.length);
  const martialLaw = visiblePrograms(allPrograms, EMPTY_FILTERS); // no filters = martial-law layer only

  // featured items are picked by slug or id. anything missing is skipped, not an error
  const featured = FEATURED.map((slug) => allPrograms.find((program) => program.slug === slug)).filter(
    (program): program is Program => program !== undefined,
  );
  const featuredGaps = FEATURED_GAPS.map((id) => gaps.find((gap) => gap.id === id)).filter(
    (gap): gap is Gap => gap !== undefined,
  );
  const titleBySlug = new Map(allPrograms.map((program) => [program.slug, program.title]));

  const numbers = [
    { label: "Programs", value: String(stats.programs) },
    { label: "Provinces covered", value: `${stats.provincesCovered} of ${stats.provincesTotal}` },
    { label: "Sources", value: String(stats.sources) },
    { label: "Still being checked", value: String(stats.checking) },
  ];

  return (
    <Container as="main" width="wide" className="space-y-12 py-8">
      {/* hero: the project name is the h1 */}
      <section aria-labelledby="hero-heading" className="space-y-5 pt-2">
        <p className="text-base font-medium uppercase tracking-wide text-accent-strong">
          Martial-law farm programs · CALABARZON · 1972 to 1986
        </p>
        <h1
          id="hero-heading"
          className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-tight tracking-tight text-stone-950"
        >
          {SITE.title}
        </h1>
        <p className="text-2xl text-stone-700">{SITE.tagline}</p>
        <p className="max-w-[68ch] text-lg leading-relaxed text-stone-800">
          A map of farm programs from the martial-law years. Each page shows what a program promised,
          what the record shows, and who says so, with a link to every source.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/map">Explore the map</ButtonLink>
          <ButtonLink href="#start-here" variant="secondary">Read a program</ButtonLink>
        </div>
      </section>

      {/* numbers strip: computed when the page is built, so it never goes out of date */}
      <section aria-label="The site in numbers" className="space-y-3">
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {numbers.map((item) => (
            <Card key={item.label}>
              <dt className="text-base text-stone-700">{item.label}</dt>
              <dd className="text-3xl font-bold text-accent-strong">{item.value}</dd>
            </Card>
          ))}
        </dl>
        {/* held topics note: one line, only when some topics are held back */}
        {HELD_TOPICS.length > 0 && (
          <p className="max-w-[68ch] text-base leading-relaxed text-stone-700">
            Topics that do not yet have a sourced effect are held back.{" "}
            <Link href="/sources#held-topics" className="tap-target inline-flex items-center underline underline-offset-2">
              See the held topics
            </Link>
          </p>
        )}
      </section>

      {/* how to read: explains labels before the reader meets them */}
      <Section
        id="how-to-read"
        title="How to read this site"
        intro="Every program page follows the same order, so you can compare them."
      >
        <div className="grid gap-3 md:grid-cols-3">
          <Card>
            <h3 className="text-lg font-semibold">1. What it promised</h3>
            <p className="mt-2 leading-relaxed text-stone-800">
              The goal the law or the government set out, in plain words.
            </p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold">2. What the record shows</h3>
            <p className="mt-2 leading-relaxed text-stone-800">
              What documents, reports and studies say actually happened. Opinions are kept out of this part.
            </p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold">3. Who says so</h3>
            <p className="mt-2 leading-relaxed text-stone-800">
              Every source has a label for who is speaking. A label is not a verdict on whether the source is right.
            </p>
          </Card>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <h3 className="text-lg font-semibold">The four source labels</h3>
            <dl className="mt-3 space-y-3">
              {VOICE_KEYS.map((voice) => (
                <div key={voice} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <dt><VoiceChip voice={voice} /></dt>
                  <dd className="text-base text-stone-800">{VOICES[voice].blurb}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold">The two statuses</h3>
            <dl className="mt-3 space-y-3">
              {PROGRAM_STATUS_KEYS.map((status) => (
                <div key={status} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <dt><StatusTag status={status} /></dt>
                  <dd className="text-base text-stone-800">{PROGRAM_STATUS_BLURBS[status]}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </Section>

      {/* start here: three featured programs. picks live in featured (src/lib/site.ts) */}
      {featured.length > 0 && (
        <Section id="start-here" title="Start here" intro="Three programs that show how the pages work.">
          <div className="grid gap-3 md:grid-cols-3">
            {featured.map((program) => <FeaturedProgramCard key={program.slug} program={program} />)}
          </div>
        </Section>
      )}

      {/* provinces: each tile opens the map with that province filtered */}
      <Section id="provinces" title="Pick a province" intro="Programs are counted by the provinces they touch.">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PROVINCE_KEYS.map((province) => {
            const count = stats.provinceCounts[province];
            // an empty province explains itself instead of opening a blank map
            const href = count > 0 ? `/map?province=${province}` : `/sources#gap-${province}-not-covered`;
            return (
              <li key={province}>
                <Link
                  href={href}
                  className="tap-target flex h-full flex-col rounded-card border border-stone-200 bg-white p-4 hover:border-stone-400"
                >
                  <span className="text-xl font-semibold text-stone-900">{PROVINCE_LABELS[province]}</span>
                  {/* the words say how solid the coverage is, "no program yet" is only for an empty province */}
                  <span className="text-base text-stone-700">
                    {provinceTileText(count, stats.confirmedCounts[province])}
                  </span>
                  {count === 0 && <span className="text-sm text-stone-700 underline underline-offset-2">Why?</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* timeline: one bar per martial-law program */}
      <Section id="timeline" title="1972 to 1986" intro="When each program ran. Tap a row to open it.">
        <TimelineStrip programs={martialLaw} />
      </Section>

      {/* unknowns: honest gaps. the full list is on /sources */}
      {featuredGaps.length > 0 && (
        <Section
          id="unknowns"
          title="What we do not know yet"
          intro="Some questions are still open. We list them instead of guessing."
        >
          <div className="grid gap-3 md:grid-cols-3">
            {featuredGaps.map((gap) => (
              <Card key={gap.id}>
                <p className="text-sm font-medium uppercase tracking-wide text-stone-600">{GAP_KINDS[gap.kind]}</p>
                <h3 className="mt-1 text-lg font-semibold leading-snug">{gap.title}</h3>
                <p className="mt-2 leading-relaxed text-stone-800">{gap.description}</p>
                {gap.program && titleBySlug.has(gap.program) && (
                  <Link
                    href={`/programs/${gap.program}`}
                    className="tap-target mt-1 inline-flex items-center text-base underline underline-offset-2"
                  >
                    Related program: {titleBySlug.get(gap.program)}
                  </Link>
                )}
              </Card>
            ))}
          </div>
          <Link href="/sources" className="tap-target inline-flex items-center text-base underline underline-offset-2">
            See all gaps and open questions
          </Link>
        </Section>
      )}

      {/* call to action: github only in v1, so no sign-in wording here */}
      <section aria-labelledby="help-heading">
        <Card className="space-y-3 border-amber-300 bg-amber-50">
          <h2 id="help-heading" className="text-xl font-semibold tracking-tight">Know a source? Help check it.</h2>
          <p className="max-w-[68ch] leading-relaxed text-stone-800">
            Suggest a source, report a mistake or edit a file. You need a free GitHub account.
            A maintainer reviews every change before it appears here.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={ISSUES_URL}>Suggest a source</ButtonLink>
            <ButtonLink href={CONTENT_URL} variant="secondary">Browse the content files</ButtonLink>
          </div>
        </Card>
      </section>
    </Container>
  );
}
