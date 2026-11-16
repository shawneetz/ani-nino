// what this file does: reads chart yaml on the server and renders one card per chart
// a row of jump links at the top opens each chart, so a reader never has to scroll to find one
import type { Metadata } from "next";
import { ChartCard } from "@/components/ChartCard";
import { Container } from "@/components/Container";
import { getCharts } from "@/lib/content";

/**
 * Page title and description for the charts page.
 */
export const metadata: Metadata = {
  title: "Charts",
  description: "Numbers from the record, each with a label and a link to where it comes from.",
};

/**
 * Renders the charts page: an intro, jump links and one card per chart.
 *
 * @remarks
 * Server Component. Charts are read from `content/charts/` and validated by
 * `loadContent`, so a broken chart file fails the build instead of reaching
 * the page. The page reads no request data, so Next.js builds it as a static
 * page. The jump links only show when there is more than one chart, and each
 * one points to the `chart-<id>` anchor on a `ChartCard`.
 */
export default async function ChartsPage() {
  const charts = await getCharts();

  return (
    <Container as="main" width="prose" className="space-y-6 py-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-stone-950">Charts</h1>
        <p className="max-w-[68ch] text-lg leading-relaxed text-stone-800">
          Every number carries a label and a link to where it comes from. Numbers reported by the
          government are labeled Government; they show what was counted, not who was left out.
        </p>
      </div>

      {/* jump links, only useful when there is more than one chart */}
      {charts.length > 1 && (
        <nav aria-label="Jump to a chart">
          <ul className="flex flex-wrap gap-2">
            {charts.map((chart) => (
              <li key={chart.id}>
                <a
                  href={`#chart-${chart.id}`}
                  className="tap-target inline-flex items-center rounded-full border-2 border-stone-400 bg-white px-4 py-1 text-base text-stone-900 hover:border-stone-600"
                >
                  {chart.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {charts.length === 0 && <p className="text-base text-stone-700">No charts have been added yet.</p>}
      {charts.map((chart) => <ChartCard key={chart.id} chart={chart} />)}
    </Container>
  );
}