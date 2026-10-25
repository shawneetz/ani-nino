import { Suspense } from "react";
import { connection } from "next/server";
import { Explorer } from "@/components/Explorer";
import { SiteHeader } from "@/components/site-header";
import { loadPins } from "@/lib/load-pins";
import { FAMILIES } from "@/lib/vocab";

async function ExplorerData() {
  await connection();
  const pins = await loadPins();
  const familyColors = Object.fromEntries(
    Object.entries(FAMILIES).map(([family, info]) => [family, info.color]),
  );

  return <Explorer pins={pins} familyColors={familyColors} />;
}

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Suspense fallback={<p className="p-6 text-sm text-neutral-700">Loading explorer…</p>}>
          <ExplorerData />
        </Suspense>
      </main>
    </>
  );
}
