// what this file does: the explorer page at "/map". this is the old home page,
// moved here so "/" can be a landing page. it loads the slim program list and
// hands it to the client-side explorer (map, list and filters)
// the explorer itself is rebuilt later in c3 (list beside map, grouped pins)
import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/Container";
import { Explorer } from "@/components/Explorer";
import { getPrograms } from "@/lib/content";
import { toExplorerProgram } from "@/lib/explorer-types";

export const metadata: Metadata = {
  title: "Map",
  description: "Filter farm programs in CALABARZON by topic, province and year, and open each one.",
};

export default async function MapPage() {
  const programs = (await getPrograms()).map(toExplorerProgram);
  return (
    <Container as="main" width="wide" className="space-y-5 py-6">
      <header className="max-w-2xl space-y-1">
        <h1 className="text-2xl font-semibold text-stone-900">Explore the map</h1>
        <p className="text-stone-700">
          Farm programs in CALABARZON during martial law, 1972 to 1986. Pick a topic, province or year,
          open a program, and see what it promised, what the record shows, and who says so.
        </p>
      </header>
      <Suspense fallback={<p className="text-sm text-stone-600">Loading the map...</p>}>
        <Explorer programs={programs} />
      </Suspense>
    </Container>
  );
}
