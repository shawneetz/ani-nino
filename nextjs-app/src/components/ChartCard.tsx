// what this file does: draws one sourced chart as plain html bars, with a data table under it
//   bars start at 0 and share one axis, so their lengths can be compared fairly
//   target points (for example a goal) are drawn as labeled dashed lines across the bars
//   every number is listed once in the table with its own source
// there is no chart library and no client code
// the bars are a picture of the table, so screen readers skip the picture and read the table
// change in this version (e7): editorial figure
//   a 2px ink rule and a "Figure n" kicker open the chart, no box around it
//   the notes are flat with a left rule, the table uses hairlines
// change in this version (u5): shared rhythm
//   the header (kicker, title, question, description) is one block 3 apart
//   the header, the bars, the table and the notes are 6 apart
import { chartParts, labelFitsInside, labelSide, percentOf } from "@/lib/chart-data";
import type { Chart, ChartPoint } from "@/lib/content-schema";
import { BLOCK_GAP, HEADING, INNER_GAP } from "./Container";
import { Kicker } from "./Kicker";
import { ScopeChip } from "./ScopeChip";
import { VoiceChip } from "./VoiceChip";

/**
 * Props for the ChartCard component.
 */
interface ChartCardProps {
  /** A validated chart from `content/charts/`, with its bars, targets and sources. */
  chart: Chart;
  /** The figure number, counted from 1 in the order the charts appear on the page. */
  figure: number;
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

// shared look for the flat notes, a left rule instead of a box
const NOTE = "max-w-[68ch] border-l-4 border-stone-500 py-1 pl-4 font-serif text-base leading-relaxed text-stone-800";

/**
 * Renders one figure: bars on a shared axis, target lines, a sourced data table and a note.
 *
 * @remarks
 * Server Component. It uses no hooks and no chart library, so it ships no
 * client code. The picture is hidden from screen readers (`aria-hidden`)
 * because the table below it lists every number with its source. The root
 * element has the id `chart-<id>`, which the jump links on the charts page use.
 * The kicker sits outside the heading, so the question stays the paragraph right after the h2.
 *
 * @example
 * ```tsx
 * const charts = await getCharts();
 * return charts.map((chart, index) => <ChartCard key={chart.id} chart={chart} figure={index + 1} />);
 * ```
 */
export function ChartCard({ chart, figure }: ChartCardProps) {
  const unit = chart.unit ? ` ${chart.unit}` : "";
  const { bars, targets, axisMax } = chartParts(chart.points);
  const formatValue = (point: ChartPoint) =>
    `${QUALIFIER_PREFIX[point.qualifier]}${point.value.toLocaleString("en-US")}${unit}`;

  return (
    // the id is the jump link target on the charts page
    <article
      id={`chart-${chart.id}`}
      aria-labelledby={`chart-${chart.id}-heading`}
      className={`scroll-mt-4 ${BLOCK_GAP} border-t-2 border-ink pt-4`}
    >
      <div className={INNER_GAP}>
        <Kicker>Figure {figure}</Kicker>
        <h2 id={`chart-${chart.id}-heading`} className={HEADING}>{chart.title}</h2>
        <p className="max-w-[68ch] font-serif text-lg font-medium leading-relaxed text-stone-900">{chart.question}</p>
        {chart.description && (
          <p className="max-w-[68ch] font-serif text-lg leading-relaxed text-stone-800">{chart.description}</p>
        )}
      </div>

      {chart.points.length === 0 ? (
        <p className="font-sans text-base text-stone-700">Data not added yet. Every number needs a source link first.</p>
      ) : (
        <>
          {chart.sameTotal && (
            <p className={NOTE}>
              These bars are two reports of roughly the same total. They are not added together.
            </p>
          )}
          <div aria-hidden="true" className="pt-3">
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
                        className={`figures absolute top-0 whitespace-nowrap font-sans text-base leading-snug text-stone-900 ${
                          rightAligned ? "right-2 text-right" : "left-2"
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

            {/* one row per bar: value inside when it fits, otherwise in the label row */}
            <ul className={BLOCK_GAP}>
              {bars.map((point) => {
                const percent = percentOf(point.value, axisMax);
                const text = formatValue(point);
                const inside = labelFitsInside(percent, text.length);
                return (
                  <li key={point.label}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className="font-sans text-base font-medium text-stone-900">{point.label}</span>
                      {!inside && <span className="figures font-serif text-lg font-bold text-accent-strong">{text}</span>}
                    </div>
                    <div className="relative mt-1 h-10 bg-stone-200">
                      <div className="flex h-full items-center justify-end bg-accent px-3" style={{ width: `${percent}%` }}>
                        {inside && <span className="figures whitespace-nowrap font-serif text-lg font-bold text-white">{text}</span>}
                      </div>
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
                );
              })}
            </ul>

            {/* the axis runs from 0 to the biggest number */}
            <div className="figures mt-1 flex justify-between font-sans text-sm text-stone-700">
              <span>0</span>
              <span>
                {axisMax.toLocaleString("en-US")}
                {unit}
              </span>
            </div>
          </div>

          {/* data table: hairlines only, scrolls sideways inside its own box on narrow phones */}
          <div role="region" aria-label={`Data for ${chart.title}`} tabIndex={0} className="overflow-x-auto pt-3">
            <table className="w-full min-w-[34rem] text-left font-sans text-base">
              <caption className="sr-only">{chart.title}: every number with its source</caption>
              <thead>
                <tr className="border-y border-stone-400 text-stone-700">
                  <th scope="col" className="py-2 pr-4 font-medium">Item</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Value</th>
                  <th scope="col" className="py-2 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {chart.points.map((point) => (
                  <tr key={`${point.kind}-${point.label}`} className="border-b border-stone-400 align-top">
                    <td className="py-3 pr-4 font-serif text-lg text-stone-900">
                      {point.label}
                      {/* words, not just a dashed line, tell target rows apart */}
                      {point.kind === "target" && (
                        <span className="block font-sans text-sm text-stone-700">Target line</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="figures flex flex-wrap items-center gap-2 font-medium text-stone-900">
                        <span>{formatValue(point)}</span>
                        <ScopeChip scope={point.scope} />
                      </div>
                    </td>
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
                      {point.note && (
                        <p className="mt-1 max-w-[48ch] text-sm leading-relaxed text-stone-700">{point.note}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {chart.caveat && <p className={NOTE}>Note: {chart.caveat}</p>}
    </article>
  );
}