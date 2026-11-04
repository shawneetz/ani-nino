// What this file does: reads chart YAML on the server and renders one card per chart.
import type { Metadata } from "next";
import { ChartCard } from "@/components/chart-card";
import { getCharts } from "@/lib/content";

export const metadata: Metadata = { title: "Charts" };

export default async function ChartsPage() {
  const charts = await getCharts();

  return (
    <main id="main" className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Charts</h1>
        <p className="mt-1 max-w-3xl text-sm text-stone-700">
          Every number carries a label and a link to where it comes from. Numbers reported by the
          government are labeled Government; they show what was counted, not who was left out.
        </p>
      </div>
      {charts.length === 0 && <p className="text-sm text-stone-700">No charts have been added yet.</p>}
      {charts.map((chart) => <ChartCard key={chart.id} chart={chart} />)}
    </main>
  );
}
