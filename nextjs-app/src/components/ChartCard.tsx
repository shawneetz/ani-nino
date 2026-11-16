// what this file does: draws one sourced chart as plain html bars, with a data table under it
//   bars start at 0 and share one axis, so their lengths can be compared fairly
//   target points (for example a goal) are drawn as labeled dashed lines across the bars
//   every number is listed once in the table with its own source
// there is no chart library and no client code
// the bars are a picture of the table, so screen readers skip the picture and read the table
import { chartParts, labelSide, percentOf } from "@/lib/chart-data";
import type { Chart, ChartPoint } from "@/lib/content-schema";
import { VoiceChip } from "./VoiceChip";

/**
 * Props for the ChartCard component.
 */
interface ChartCardProps {
  /** A validated chart from `content/charts/`, with its bars, targets and sources. */
  chart: Chart;
}

/**
 * Words put before a number so a rough figure is never read as an exact one.
 */
const QUALIFIER_PREFIX: Record<ChartPoint["qualifier"], string> = {
  exact: "",
  approx: "about ",
  at_most: "under ",
  at_least: "at least ",
};

/**
 * Height of one target label row, in rem.
 * Each label takes two lines (name and value), so a row is a little taller than that.
 */
const LABEL_ROW_REM = 3.5;

/**
 * Renders one chart: bars on a shared axis, target lines, a sourced data table and a note.
 *
 * @remarks
 * Server Component. It uses no hooks and no chart library, so it ships no
 * client code. The picture is hidden from screen readers (`aria-hidden`)
 * because the table below it lists every number with its source. The root
 * element has the id `chart-<id>`, which the jump links on the charts page use.
 *
 * @example
 * ```tsx
 * const charts = await getCharts();
 * return charts.map((chart) => <ChartCard key={chart.id} chart={chart} />);
 * ```
 */
export function ChartCard({ chart }: ChartCardProps) {
  const unit = chart.unit ? ` ${chart.unit}` : "";
  const { bars, targets, axisMax } = chartParts(chart.points);
  const formatValue = (point: ChartPoint) =>
    `${QUALIFIER_PREFIX[point.qualifier]}${point.value.toLocaleString("en-US")}${unit}`;

  return (
    // the id is the jump link target on the charts page
    <article
      id={`chart-${chart.id}`}
      aria-labelledby={`chart-${chart.id}-heading`}
      className="scroll-mt-4 rounded-card border border-stone-200 bg-white p-4 sm:p-5"
    >
      <h2 id={`chart-${chart.id}-heading`} className="text-2xl font-semibold tracking-tight text-stone-900">
        {chart.title}
      </h2>
      {chart.description && (
        <p className="mt-1 max-w-[68ch] text-lg leading-relaxed text-stone-800">{chart.description}</p>
      )}

      {chart.points.length === 0 ? (
        <p className="mt-4 text-base text-stone-700">Data not added yet. Every number needs a source link first.</p>
      ) : (
        <>
          <div aria-hidden="true" className="mt-5">
            {/* label rows: one per target, each label sits beside its own line */}
            {targets.length > 0 && (
              <div className="relative" style={{ height: `${targets.length * LABEL_ROW_REM}rem` }}>
                {targets.map((target, index) => {
                  const percent = percentOf(target.value, axisMax);
                  const rightAligned = labelSide(percent) === "right";
                  return (
                    // position and row depend on the data, so they stay inline
                    <div
                      key={target.label}
                      className="absolute bottom-0 border-l-2 border-dashed border-stone-900"
                      style={{ left: `${percent}%`, top: `${index * LABEL_ROW_REM}rem` }}
                    >
                      <p
                        className={`absolute top-0 whitespace-nowrap text-base leading-snug text-stone-900 ${rightAligned ? "right-2 text-right" : "left-2"
                          }`}
                      >
                        <span className="block font-semibold">{target.label}</span>
                        <span className="block">{formatValue(target)}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* one row per bar: label and value on top, the bar on a grey track below */}
            <ul className="space-y-4">
              {bars.map((point) => (
                <li key={point.label}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="text-base font-medium text-stone-900">{point.label}</span>
                    <span className="text-base font-semibold text-accent-strong">{formatValue(point)}</span>
                  </div>
                  <div className="relative mt-1 h-8 rounded bg-stone-100">
                    <div className="h-full rounded bg-accent" style={{ width: `${percentOf(point.value, axisMax)}%` }} />
                    {/* the target lines continue through every track */}
                    {targets.map((target) => (
                      <span
                        key={target.label}
                        className="absolute -inset-y-1 border-l-2 border-dashed border-stone-900"
                        style={{ left: `${percentOf(target.value, axisMax)}%` }}
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ul>

            {/* the axis runs from 0 to the biggest number */}
            <div className="mt-1 flex justify-between text-sm text-stone-700">
              <span>0</span>
              <span>
                {axisMax.toLocaleString("en-US")}
                {unit}
              </span>
            </div>
          </div>

          {/* data table: normal size text, scrolls sideways inside its own box on narrow phones */}
          <div role="region" aria-label={`Data for ${chart.title}`} tabIndex={0} className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-base">
              <caption className="sr-only">{chart.title}: every number with its source</caption>
              <thead>
                <tr className="border-b border-stone-300 text-stone-700">
                  <th scope="col" className="py-2 pr-4 font-medium">Item</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Value</th>
                  <th scope="col" className="py-2 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {chart.points.map((point) => (
                  <tr key={`${point.kind}-${point.label}`} className="border-b border-stone-200 align-top">
                    <td className="py-3 pr-4">
                      {point.label}
                      {/* words, not just a dashed line, tell target rows apart */}
                      {point.kind === "target" && <span className="block text-sm text-stone-700">Target line</span>}
                    </td>
                    <td className="py-3 pr-4 font-medium text-stone-900">{formatValue(point)}</td>
                    <td className="py-3">
                      <a
                        href={point.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] items-center underline underline-offset-2"
                      >
                        {point.source.title}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-stone-700">
                        <span>{point.source.publisher}</span>
                        <VoiceChip voice={point.source.voice} />
                      </div>
                      {point.note && <p className="mt-1 max-w-[48ch] text-sm leading-relaxed text-stone-700">{point.note}</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {chart.caveat && (
        <p className="mt-4 max-w-[68ch] rounded-card border border-stone-200 bg-stone-50 p-3 text-base leading-relaxed text-stone-800">
          Note: {chart.caveat}
        </p>
      )}
    </article>
  );
}