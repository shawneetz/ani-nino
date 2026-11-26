// what this file does: the explorer page at "/map"
// it loads the slim program list on the server and hands it to the client explorer
// the <main id="main"> comes from app/(map)/map/layout.tsx and the visually hidden h1 comes from Explorer,
// so this page renders no wrapper of its own and the map can fill the whole area
// change in this version: the header is now one short line, so the map gets the height (c3.1)
// change in this version (m1): Container is a div here, the layout owns main
// change in this version (m2): no Container and no visible heading, the explorer is a full-bleed shell
import type { Metadata } from "next";
import { Suspense } from "react";
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
    // the fallback fills the same area, so the page does not jump when the explorer loads
    <Suspense
      fallback={
        <p className="absolute inset-0 flex items-center justify-center font-sans text-base text-stone-700">
          Loading the map...
        </p>
      }
    >
      <Explorer programs={programs} />
    </Suspense>
  );
}