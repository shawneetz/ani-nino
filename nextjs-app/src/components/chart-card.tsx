// What this file does: draws one sourced chart and repeats its data in a table
// so the chart remains readable for screen readers.
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Chart, ChartPoint } from "@/lib/content-schema";
import { VoiceChip } from "./voice-chip";

const QUALIFIER_PREFIX: Record<ChartPoint["qualifier"], string> = {
  exact: "",
  approx: "about ",
  at_most: "under ",
  at_least: "at least ",
};

export function ChartCard({ chart }: { chart: Chart }) {
  const unit = chart.unit ? ` ${chart.unit}` : "";
  const hasGoal = chart.points.some((point) => point.goal !== undefined);
  const data = chart.points.map((point) => ({
    label: point.label,
    Actual: point.value,
    Goal: point.goal,
  }));
  const formatValue = (point: ChartPoint) =>
    `${QUALIFIER_PREFIX[point.qualifier]}${point.value.toLocaleString("en-US")}${unit}`;

  return (
    <article aria-labelledby={`chart-${chart.id}`} className="rounded-xl border border-stone-200 bg-white p-4">
      <h2 id={`chart-${chart.id}`} className="text-lg font-semibold">{chart.title}</h2>
      {chart.description && <p className="mt-1 text-sm text-stone-700">{chart.description}</p>}
      {chart.points.length === 0 ? (
        <p className="mt-4 text-sm text-stone-600">Data not added yet. Every number needs a source link first.</p>
      ) : (
        <>
          <div role="img" aria-label={`Bar chart: ${chart.title}. Values are listed below.`} className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                {hasGoal && <Legend />}
                <Bar dataKey="Actual" fill="#b45309" isAnimationActive={false} />
                {hasGoal && <Bar dataKey="Goal" fill="#d6d3d1" isAnimationActive={false} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b text-stone-600"><th className="py-1 pr-3 font-medium">Item</th><th className="py-1 pr-3 font-medium">Value</th><th className="py-1 font-medium">Source</th></tr></thead>
              <tbody>{chart.points.map((point) => <tr key={point.label} className="border-b align-top"><td className="py-2 pr-3">{point.label}</td><td className="py-2 pr-3">{formatValue(point)}{point.goal !== undefined && <span className="block text-xs text-stone-600">Goal: {point.goal.toLocaleString("en-US")}{unit}</span>}</td><td className="py-2"><a href={point.source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{point.source.title}</a><span className="ml-2"><VoiceChip voice={point.source.voice} /></span>{point.note && <p className="text-xs text-stone-600">{point.note}</p>}</td></tr>)}</tbody>
            </table>
          </div>
        </>
      )}
      {chart.caveat && <p className="mt-4 text-xs text-stone-600">Note: {chart.caveat}</p>}
    </article>
  );
}
