// what this file does: the explorer page at "/map"
// it loads the slim program list on the server and hands it to the client explorer
// change in this version: the header is now one short line, so the map gets the height (c3.1)
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
    <Container as="main" width="wide" className="space-y-2 py-3">
      <h1 className="text-xl font-semibold text-stone-900">Explore the map</h1>
      <Suspense fallback={<p className="text-sm text-stone-600">Loading the map...</p>}>
        <Explorer programs={programs} />
      </Suspense>
    </Container>
  );
}
