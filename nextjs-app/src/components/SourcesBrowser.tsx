// what this file does: the interactive body of the /sources page
//   a sticky bar holds in-page links, a search box and a label filter
//   search narrows open questions, gaps, held topics and sources together
//   the label filter only narrows the "all sources" list (a label describes a source)
//   every gap has id="gap-<id>", and held topics have #held-topics
// the page passes plain data in, so this file never reads content itself
"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import type { Source } from "@/lib/content-schema";
import type { HeldTopic } from "@/lib/held-topics";
import { matchesSearch } from "@/lib/source-search";
import { GAP_KINDS, VOICES, VOICE_KEYS, type GapKind, type Voice } from "@/lib/vocab";
import { SourceList } from "./SourceList";

/**
 * One program that is still being checked, with its open question.
 */
export interface OpenQuestionItem {
    /** Program slug, used for the link. */
    slug: string;
    /** Program title. */
    title: string;
    /** The open question shown under the title. */
    question: string;
}

/**
 * One research gap, with its related program already looked up.
 */
export interface GapItem {
    /** Gap id, also the anchor: `gap-<id>`. */
    id: string;
    /** Kind of gap, shown in brackets after the title. */
    kind: GapKind;
    title: string;
    description: string;
    /** Slug of the related program, when there is one. */
    programSlug?: string;
    /** Title of the related program, when there is one. */
    programTitle?: string;
}

/**
 * A source plus the program and chart titles that use it.
 */
export type SourceItem = Source & { usedIn: string[] };

/**
 * Props for the SourcesBrowser component.
 */
interface SourcesBrowserProps {
    openQuestions: OpenQuestionItem[];
    gaps: GapItem[];
    heldTopics: readonly HeldTopic[];
    holdingUrl: string;
    sources: SourceItem[];
}

// in-page links shown in the sticky bar
const SECTION_LINKS = [
    { href: "#labels", label: "Labels" },
    { href: "#not-known", label: "Not known yet" },
    { href: "#held-topics", label: "Held topics" },
    { href: "#all-sources", label: "All sources" },
] as const;

// shared look for headings and empty notes, so every section matches
const H2 = "text-2xl font-semibold tracking-tight text-stone-900";
const EMPTY = "text-base text-stone-700";

/**
 * Renders the sticky bar and the four sections of the sources page.
 *
 * @remarks
 * Must remain a Client Component because search text and the label filter are
 * local state. The first render shows everything, so the server html already
 * contains every gap and held-topic anchor before any script runs.
 */
export function SourcesBrowser({ openQuestions, gaps, heldTopics, holdingUrl, sources }: SourcesBrowserProps) {
    const searchId = useId();
    const [query, setQuery] = useState("");
    const [voice, setVoice] = useState<Voice | null>(null);

    // search runs on each list separately, so a long list never hides a short one
    const shownQuestions = useMemo(
        () => openQuestions.filter((item) => matchesSearch([item.title, item.question], query)),
        [openQuestions, query],
    );
    const shownGaps = useMemo(
        () =>
            gaps.filter((gap) =>
                matchesSearch([gap.title, gap.description, GAP_KINDS[gap.kind], gap.programTitle], query),
            ),
        [gaps, query],
    );
    const shownHeldTopics = useMemo(
        () => heldTopics.filter((topic) => matchesSearch([topic.title, topic.reason], query)),
        [heldTopics, query],
    );
    // label filter first, then search
    const shownSources = useMemo(
        () =>
            sources.filter(
                (source) =>
                    (voice === null || source.voice === voice) &&
                    matchesSearch(
                        [source.title, source.publisher, source.cite, VOICES[source.voice].label, source.usedIn.join(" ")],
                        query,
                    ),
            ),
        [sources, voice, query],
    );

    const searching = query.trim() !== "";
    const hasFilters = searching || voice !== null;

    // how many sources each label has, shown on the chips
    const voiceCounts = useMemo(() => {
        const counts = {} as Record<Voice, number>;
        for (const key of VOICE_KEYS) counts[key] = sources.filter((source) => source.voice === key).length;
        return counts;
    }, [sources]);

    function clearAll() {
        setQuery("");
        setVoice(null);
    }

    return (
        <div className="space-y-8">
            {/* sticky bar: in-page links, search and label filter */}
            <div className="sticky top-0 z-30 -mx-4 space-y-2 border-b border-stone-200 bg-background/95 px-4 py-2 backdrop-blur">
                {/* links scroll sideways on narrow phones instead of wrapping into a tall bar */}
                <nav aria-label="On this page" className="-mx-1 overflow-x-auto">
                    <ul className="flex gap-1 whitespace-nowrap px-1">
                        {SECTION_LINKS.map((link) => (
                            <li key={link.href}>
                                <a
                                    href={link.href}
                                    className="tap-target inline-flex items-center rounded-lg px-3 text-base text-stone-800 underline underline-offset-4 hover:bg-stone-100"
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
                    <div className="min-w-[14rem] flex-1">
                        <label htmlFor={searchId} className="text-base font-medium text-stone-700">
                            Search
                        </label>
                        <input
                            id={searchId}
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Title, question, reason, publisher or program"
                            className="mt-1 min-h-[44px] w-full rounded-lg border border-stone-400 bg-white px-3 text-base text-stone-900 placeholder:text-stone-700"
                        />
                    </div>
                    {hasFilters && (
                        <button type="button" onClick={clearAll} className="tap-target text-base text-stone-700 underline underline-offset-2">
                            Clear search and label
                        </button>
                    )}
                </div>

                {/* label filter: single choice, "all labels" clears it */}
                <div role="group" aria-label="Filter sources by label" className="-mx-1 overflow-x-auto">
                    <div className="flex gap-2 whitespace-nowrap px-1 pb-1">
                        <button
                            type="button"
                            aria-pressed={voice === null}
                            onClick={() => setVoice(null)}
                            className={`tap-target rounded-full border-2 px-4 text-base ${voice === null ? "border-stone-900 bg-stone-900 text-white" : "border-stone-400 bg-white text-stone-900"
                                }`}
                        >
                            All labels
                        </button>
                        {VOICE_KEYS.map((key) => (
                            <button
                                key={key}
                                type="button"
                                aria-pressed={voice === key}
                                onClick={() => setVoice(voice === key ? null : key)}
                                className={`tap-target rounded-full border-2 px-4 text-base ${voice === key ? "border-stone-900 bg-stone-900 text-white" : "border-stone-400 bg-white text-stone-900"
                                    }`}
                            >
                                {VOICES[key].label} ({voiceCounts[key]})
                            </button>
                        ))}
                    </div>
                </div>

                {/* live result counts, announced politely to screen readers */}
                <p role="status" data-testid="sources-count" className="text-sm text-stone-700">
                    {shownQuestions.length} open {shownQuestions.length === 1 ? "question" : "questions"}, {shownGaps.length}{" "}
                    {shownGaps.length === 1 ? "gap" : "gaps"}, {shownHeldTopics.length}{" "}
                    {shownHeldTopics.length === 1 ? "held topic" : "held topics"}, {shownSources.length}{" "}
                    {shownSources.length === 1 ? "source" : "sources"}
                    {voice !== null && ". The label filter only changes the source list."}
                </p>
            </div>

            {/* labels: always shown, they explain the chips above */}
            <section id="labels" aria-labelledby="labels-heading" className="scroll-mt-48 space-y-2">
                <h2 id="labels-heading" className={H2}>Source labels</h2>
                <p className="max-w-[68ch] text-base text-stone-700">
                    A label describes who is speaking; it is not a verdict about whether the source is right or wrong.
                </p>
                <dl className="space-y-2 text-base">
                    {VOICE_KEYS.map((key) => (
                        <div key={key}>
                            <dt className="font-medium text-stone-900">{VOICES[key].label}</dt>
                            <dd className="text-stone-700">{VOICES[key].blurb}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            {/* questions and gaps remain separately anchored, but share one section */}
            <section id="not-known" aria-labelledby="not-known-heading" className="scroll-mt-48 space-y-5">
                <h2 id="not-known-heading" className={H2}>What is not known yet</h2>
                <div
                    id="questions"
                    role="group"
                    aria-labelledby="questions-heading"
                    className="scroll-mt-48 space-y-3"
                >
                    <h3 id="questions-heading" className="text-xl font-semibold text-stone-900">Open on a page</h3>
                    {shownQuestions.length === 0 ? (
                        <p className={EMPTY}>{searching ? "No open questions match your search." : "No open questions."}</p>
                    ) : (
                        <ul className="space-y-3">
                            {shownQuestions.map((item) => (
                                <li key={item.slug} className="text-base">
                                    <Link href={`/programs/${item.slug}`} className="font-medium underline underline-offset-2">
                                        {item.title}
                                    </Link>
                                    <p className="max-w-[68ch] text-stone-700">{item.question}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div id="gaps" role="group" aria-labelledby="gaps-heading" className="scroll-mt-48 space-y-3">
                    <h3 id="gaps-heading" className="text-xl font-semibold text-stone-900">Missing from the whole site</h3>
                    {shownGaps.length === 0 ? (
                        <p className={EMPTY}>{searching ? "No gaps match your search." : "No gaps have been added."}</p>
                    ) : (
                        <ul className="space-y-4">
                            {shownGaps.map((gap) => (
                                // the id matches links such as /sources#gap-cavite-not-covered
                                <li key={gap.id} id={`gap-${gap.id}`} className="scroll-mt-48 text-base">
                                    <span className="font-medium text-stone-900">{gap.title}</span>{" "}
                                    <span className="text-stone-700">({GAP_KINDS[gap.kind]})</span>
                                    <p className="max-w-[68ch] text-stone-700">{gap.description}</p>
                                    {gap.programSlug && gap.programTitle && (
                                        <Link
                                            href={`/programs/${gap.programSlug}`}
                                            className="tap-target inline-flex items-center text-base underline underline-offset-2"
                                        >
                                            Related program: {gap.programTitle}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            <section id="held-topics" aria-labelledby="held-topics-heading" className="scroll-mt-48 space-y-3">
                <h2 id="held-topics-heading" className={H2}>Held topics</h2>
                <p className="max-w-[68ch] text-base text-stone-700">
                    These topics are researched but not published; each one names what evidence is missing.
                </p>
                {shownHeldTopics.length === 0 ? (
                    <p className={EMPTY}>{searching ? "No held topics match your search." : "No topics are held."}</p>
                ) : (
                    <ul className="space-y-4">
                        {shownHeldTopics.map((topic) => (
                            <li key={topic.slug} className="text-base">
                                <Link href={`/programs/${topic.slug}`} className="font-medium underline underline-offset-2">
                                    {topic.title}
                                </Link>
                                <p className="max-w-[68ch] text-stone-700">{topic.reason}</p>
                            </li>
                        ))}
                    </ul>
                )}
                <a href={holdingUrl} target="_blank" rel="noopener noreferrer" className="tap-target inline-flex items-center text-base underline underline-offset-2">
                    See the held files
                    <span className="sr-only"> (opens in a new tab)</span>
                </a>
            </section>

            {/* all sources: grouped by label, filtered by the chips and the search box */}
            <section id="all-sources" aria-labelledby="all-sources-heading" className="scroll-mt-48 space-y-3">
                <h2 id="all-sources-heading" className={H2}>All sources</h2>
                {shownSources.length === 0 ? (
                    <div className="space-y-2">
                        <p className={EMPTY}>
                            {sources.length === 0 ? "No sources have been added yet." : "No sources match your search and label."}
                        </p>
                        {hasFilters && (
                            <button type="button" onClick={clearAll} className="tap-target text-base underline underline-offset-2">
                                Clear search and label
                            </button>
                        )}
                    </div>
                ) : (
                    VOICE_KEYS.map((key) => {
                        const group = shownSources.filter((source) => source.voice === key);
                        if (group.length === 0) return null;
                        return (
                            <div key={key} className="mt-4">
                                <h3 className="mb-2 text-lg font-semibold text-stone-900">
                                    {VOICES[key].label} ({group.length})
                                </h3>
                                <SourceList sources={group} />
                            </div>
                        );
                    })
                )}
            </section>
        </div>
    );
}