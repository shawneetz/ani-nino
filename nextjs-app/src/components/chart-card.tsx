// What this file does: draws one chart as plain HTML bars. No chart library is used.
// Each point shows its value, an evidence badge and a link to its source.
// A "target" series (like the government goal) is drawn as a dashed outline bar.
import type { Chart } from "@/lib/api-schemas";
import { Badge } from "@/components/badge";

type Point = Chart["series"][number]["points"][number];

// Words added before a value so "under 14%" is never shown as exactly 14%.
const QUALIFIER_PREFIX: Record<Point["qualifier"], string> = {
  exact: "",
  approx: "about ",
  at_most: "under ",
  at_least: "at least ",
};

export function ChartCard({ chart }: { chart: Chart }) {
  const unit = chart.unit?.trim() ?? "";
  const isPercent = unit.startsWith("%") || unit.toLowerCase().includes("percent");

  // Percent charts always use a 0 to 100 scale, so a small value does not look like a full bar.
  const allValues = chart.series.flatMap((series) => series.points.map((point) => point.value));
  const max = isPercent ? 100 : Math.max(1, ...allValues);

  // Builds text like "under 14%" or "210,054 tenants".
  const formatValue = (point: Point) => {
    const suffix = isPercent ? "%" : unit ? ` ${unit}` : "";
    return `${QUALIFIER_PREFIX[point.qualifier]}${point.value.toLocaleString("en-US")}${suffix}`;
  };

  return (
    <article aria-labelledby={`chart-${chart.id}`} className="rounded-xl border border-neutral-200 bg-white p-4">
      <h2 id={`chart-${chart.id}`} className="text-lg font-semibold">{chart.title}</h2>
      {chart.description && <p className="mt-1 text-sm text-neutral-700">{chart.description}</p>}
      {unit && <p className="mt-1 text-xs text-neutral-600">Unit: {unit}</p>}

      {chart.series.map((series) => {
        const isTarget = series.kind === "target";
        return (
          <section key={series.id} className="mt-4">
            <h3 className="text-sm font-semibold text-neutral-900">
              {series.name}
              {isTarget && <span className="font-normal text-neutral-600"> (goal)</span>}
            </h3>
            <ul className="mt-2 space-y-3">
              {series.points.map((point) => (
                <li key={point.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                    <span>{point.xLabel}</span>
                    <span className="font-medium">{formatValue(point)}</span>
                  </div>
                  <div
                    role="img"
                    aria-label={`${point.xLabel}: ${formatValue(point)}`}
                    className="mt-1 h-3 overflow-hidden rounded bg-neutral-100"
                  >
                    <div
                      className={`h-full ${
                        isTarget ? "rounded border-2 border-dashed border-neutral-700" : "bg-orange-700"
                      }`}
                      style={{ width: `${Math.min(100, (point.value / max) * 100)}%` }}
                    />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-600">
                    <Badge badge={point.badge} />
                    <span>
                      Source:{" "}
                      {point.source.url ? (
                        <a
                          href={point.source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2"
                        >
                          {point.source.title}
                        </a>
                      ) : (
                        point.source.title
                      )}
                      , {point.source.publisher}
                    </span>
                  </div>
                  {point.note && <p className="mt-1 text-xs text-neutral-600">{point.note}</p>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {chart.caveat && <p className="mt-4 text-xs text-neutral-600">Note: {chart.caveat}</p>}
    </article>
  );
}
