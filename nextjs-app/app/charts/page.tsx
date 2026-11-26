// what this file does: reads chart yaml on the server and renders one figure per chart
// a row of jump links at the top opens each chart, so a reader never has to scroll to find one
// change in this version (e7): editorial header with a kicker and a 2px ink rule,
//   each chart gets its figure number from its order on the page
import type { Metadata } from "next";
import { ChartCard } from "@/components/ChartCard";
import { Container } from "@/components/Container";
import { Kicker } from "@/components/Kicker";
import { getCharts } from "@/lib/content";

// page title and description for the charts page
export const metadata: Metadata = {
  title: "Charts",
  description: "Numbers from the record, each with a label and a link to where it comes from.",
};

/**
 * Renders the charts page: an intro, jump links and one figure per chart with data.
 *
 * @remarks
 * Server Component. Charts are read from `content/charts/` and validated by
 * `loadContent`, so a broken chart file fails the build instead of reaching
 * the page. The page reads no request data, so Next.js builds it as a static
 * page. Empty charts are valid content placeholders but are not rendered;
 * jump links and figure numbers count only charts that have data.
 */
export default async function ChartsPage() {
  const charts = await getCharts();
  const visibleCharts = charts.filter((chart) => chart.points.length > 0);

  return (
    <Container as="main" width="prose" className="space-y-8 py-8">
      {/* header: a heavy rule opens the page like a printed article */}
      <header className="space-y-3 border-t-2 border-ink pt-4">
        <Kicker>Evidence</Kicker>
        <h1 className="font-serif text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-tight tracking-tight text-stone-950">
          Charts
        </h1>
        <p className="max-w-[68ch] font-serif text-lg leading-relaxed text-stone-800">
          Every number carries a label and a link to where it comes from. Numbers reported by the
          government are labeled Government; they show what was counted, not who was left out.
        </p>
      </header>

      {/* jump links, only useful when there is more than one chart, they stay pills because they are controls */}
      {visibleCharts.length > 1 && (
        <nav aria-label="Jump to a chart">
          <ul className="flex flex-wrap gap-2">
            {visibleCharts.map((chart) => (
              <li key={chart.id}>
                <a
                  href={`#chart-${chart.id}`}
                  className="tap-target inline-flex items-center rounded-full border-2 border-stone-500 bg-transparent px-4 py-1 font-sans text-base text-stone-900 hover:border-ink"
                >
                  {chart.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {visibleCharts.length === 0 && (
        <p className="font-sans text-base text-stone-700">No charts have been added yet.</p>
      )}

      {/* the figure number is the position in the list */}
      {visibleCharts.map((chart, index) => (
        <ChartCard key={chart.id} chart={chart} figure={index + 1} />
      ))}
    </Container>
  );
}