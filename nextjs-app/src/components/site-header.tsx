// What this file does: shows the site name and short description at the top of each page.
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-semibold tracking-tight text-neutral-950">
          Ani Nino
        </Link>
        <p className="text-sm text-neutral-600">Programs, places, and evidence</p>
      </div>
    </header>
  );
}
