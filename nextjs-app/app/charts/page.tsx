// What this file does: the /charts page. It reads the charts on the server
// (database first, snapshot as fallback) and shows one card per chart.
import type { Metadata } from "next";
import { getCharts } from "@/db/queries";
import { ChartCard } from "@/components/chart-card";

export const metadata: Metadata = { title: "Charts" };

// Read data on every request so a fresh seed shows up without a rebuild.
export const dynamic = "force-dynamic";

export default async function ChartsPage() {
  const charts = await getCharts();

  return (
    <main id="main" className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">Charts</h1>
        <p className="mt-1 max-w-3xl text-sm text-neutral-700">
          Every number carries an evidence badge and a link to where it comes from. Numbers
          reported by the government are labeled official; they show what was counted, not
          who was left out.
        </p>
      </div>
      {charts.length === 0 && <p className="text-sm text-neutral-700">No charts have been added yet.</p>}
      {charts.map((chart) => (
        <ChartCard key={chart.id} chart={chart} />
      ))}
    </main>
  );
}
