// What this file does: the /methods page. It explains the evidence labels and lists
// every source, every lead (unverified pin) and every research gap, so readers can
// check the work. All data comes from getMethods() on the server.
import type { Metadata } from "next";
import Link from "next/link";
import { getMethods } from "@/db/queries";
import { LAYER_LABELS } from "@/components/pin-detail/detail-labels";
import { BADGES, STATUSES } from "@/lib/enums";
import {
  BADGE_DEFINITIONS,
  BADGE_LABELS,
  SOURCE_KIND_LABELS,
  STATUS_LABELS,
} from "@/lib/vocab";

export const metadata: Metadata = { title: "Methods and sources" };

// Read data on every request so a fresh seed shows up without a rebuild.
export const dynamic = "force-dynamic";

// Short labels for the kinds of research gap.
const GAP_KIND_LABELS = {
  method: "Method",
  data_missing: "Data missing",
  unverified: "Unverified",
  scope: "Scope",
} as const;

export default async function MethodsPage() {
  const methods = await getMethods();
  const { counts } = methods;

  return (
    <main id="main" className="mx-auto max-w-4xl space-y-8 px-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">Methods and sources</h1>
        <p className="mt-1 max-w-3xl text-sm text-neutral-700">
          This page lists how claims are labeled, where they come from, and what is still
          unverified. I did not interview farmers from the martial-law era because I could not
          reach any. Connections between past and present programs are my interpretation.
        </p>
      </div>

      {/* Evidence badges: the definitions match the legend and the pin panel. */}
      <section aria-labelledby="badges-heading">
        <h2 id="badges-heading" className="text-lg font-semibold">Evidence labels</h2>
        <dl className="mt-2 space-y-2 text-sm">
          {BADGES.map((badge) => (
            <div key={badge}>
              <dt className="font-medium">{BADGE_LABELS[badge]}</dt>
              <dd className="text-neutral-700">{BADGE_DEFINITIONS[badge]}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-neutral-700">
          A <strong>verified</strong> pin was checked against its sources on the date shown. A{" "}
          <strong>lead</strong> is still open and always shows its question.
        </p>
      </section>

      {/* Counts help the author compare the site with the data files at launch. */}
      <section aria-labelledby="counts-heading">
        <h2 id="counts-heading" className="text-lg font-semibold">At a glance</h2>
        <p className="mt-2 text-sm text-neutral-800">
          {counts.pins} pins and {counts.sources} sources.
        </p>
        <ul className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-700">
          {STATUSES.map((status) => (
            <li key={status}>
              {STATUS_LABELS[status]}: {counts.byStatus[status] ?? 0}
            </li>
          ))}
          {BADGES.map((badge) => (
            <li key={badge}>
              {BADGE_LABELS[badge]}: {counts.byBadge[badge] ?? 0}
            </li>
          ))}
        </ul>
      </section>

      {/* Every lead links to its pin on the map. */}
      <section aria-labelledby="leads-heading">
        <h2 id="leads-heading" className="text-lg font-semibold">Leads still to verify</h2>
        {methods.leadPins.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-700">No open leads.</p>
        ) : (
          <ul className="mt-2 space-y-3">
            {methods.leadPins.map((pin) => (
              <li key={pin.id} className="text-sm">
                <Link href={`/?pin=${pin.id}`} className="font-medium underline underline-offset-2">
                  {pin.title}
                </Link>{" "}
                <span className="text-neutral-600">({LAYER_LABELS[pin.layer]})</span>
                {pin.openQuestion && <p className="text-neutral-700">Open question: {pin.openQuestion}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="gaps-heading">
        <h2 id="gaps-heading" className="text-lg font-semibold">Research gaps</h2>
        {methods.gaps.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-700">No gaps recorded.</p>
        ) : (
          <ul className="mt-2 space-y-3">
            {methods.gaps.map((gap) => (
              <li key={gap.id} className="text-sm">
                <span className="font-medium">{gap.title}</span>{" "}
                <span className="text-neutral-600">
                  ({GAP_KIND_LABELS[gap.kind]}, {gap.status})
                </span>
                <p className="text-neutral-700">{gap.description}</p>
                {gap.pinId && (
                  <Link href={`/?pin=${gap.pinId}`} className="text-xs underline underline-offset-2">
                    Related pin
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Sources are grouped by the kind of outlet, not by evidence class. */}
      <section aria-labelledby="sources-heading">
        <h2 id="sources-heading" className="text-lg font-semibold">Sources</h2>
        {methods.sourcesByKind.length === 0 && (
          <p className="mt-2 text-sm text-neutral-700">No sources have been added yet.</p>
        )}
        {methods.sourcesByKind.map((group) => (
          <div key={group.kind} className="mt-4">
            <h3 className="text-sm font-semibold text-neutral-900">{SOURCE_KIND_LABELS[group.kind]}</h3>
            <ul className="mt-1 space-y-2">
              {group.sources.map((source) => (
                <li key={source.id} className="text-sm text-neutral-800">
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2"
                    >
                      {source.title}
                    </a>
                  ) : (
                    <span>{source.title}</span>
                  )}
                  <span className="text-xs text-neutral-600">
                    {" "}
                    {[source.publisher, source.author, source.publishedYear].filter(Boolean).join(" · ")}
                  </span>
                  {source.note && <p className="text-xs text-neutral-600">{source.note}</p>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
  );
}
