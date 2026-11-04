// What this file does: loads the slim program list for the interactive home page.
import { Suspense } from "react";
import { Explorer } from "@/components/Explorer";
import { getPrograms } from "@/lib/content";
import { toExplorerProgram } from "@/lib/explorer-types";
import { SITE } from "@/lib/site";
export default async function HomePage() {
  const programs = (await getPrograms()).map(toExplorerProgram);
  return <main id="main" className="mx-auto max-w-7xl space-y-5 px-4 py-6"><header className="max-w-2xl space-y-1"><h1 className="text-2xl font-semibold text-stone-900">{SITE.tagline}</h1><p className="text-stone-700">Farm programs in CALABARZON during martial law, 1972 to 1986. Pick a topic, province or year, open a program, and see what it promised, what the record shows, and who says so.</p></header><Suspense fallback={<p className="text-sm text-stone-600">Loading the map...</p>}><Explorer programs={programs} /></Suspense></main>;
}
