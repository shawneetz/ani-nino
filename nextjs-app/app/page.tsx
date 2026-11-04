// What this file does: loads all pins on the server and starts the interactive explorer.
// The header now lives in layout.tsx, so this page only renders its own <main>.
import { Suspense } from "react";
import { connection } from "next/server";
import { Explorer } from "@/components/Explorer";
import { loadPins } from "@/lib/load-pins";
import { FAMILIES } from "@/lib/vocab";

async function ExplorerData() {
  // Keep request-time data inside Suspense so the static page shell can render first.
  await connection();
  const pins = await loadPins();
  const familyColors = Object.fromEntries(
    Object.entries(FAMILIES).map(([family, info]) => [family, info.color]),
  );

  return <Explorer pins={pins} familyColors={familyColors} />;
}

export default function HomePage() {
  return (
    <main id="main">
      <Suspense fallback={<p className="p-6 text-sm text-neutral-700">Loading explorer…</p>}>
        <ExplorerData />
      </Suspense>
    </main>
  );
}
