// what this file does: the explorer page at "/map"
// it loads the slim program list on the server and hands it to the client explorer
// the <main id="main"> now comes from app/(map)/map/layout.tsx, so this page renders a plain div
// change in this version: the header is now one short line, so the map gets the height (c3.1)
// change in this version (m1): Container is a div here, the layout owns main
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
    <Container width="wide" className="space-y-2 py-3">
      <h1 className="text-xl font-semibold text-stone-900">Explore the map</h1>
      <Suspense fallback={<p className="text-sm text-stone-700">Loading the map...</p>}>
        <Explorer programs={programs} />
      </Suspense>
    </Container>
  );
}