// What this file does: explains the project's method and how readers can contribute.
// Contributions are GitHub-only in v1, so this page never mentions accounts on this site.
import type { Metadata } from "next";
import Link from "next/link";
import { REPO_URL, SITE } from "@/lib/site";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl space-y-8 px-4 py-6">
      <h1 className="text-2xl font-semibold tracking-tight text-stone-900">About {SITE.title}</h1>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">What this is</h2>
        <p>{SITE.title} is an educational map of farm programs in CALABARZON during martial law, 1972 to 1986. Each page shows what a program promised, what the record shows, and who says so.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Method</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Every claim comes from a source, and every source is labeled by who is speaking.</li>
          <li>A confirmed program was checked against its sources on the date shown. A program marked still checking shows its open question.</li>
          <li>A dashed marker on the map means the place is approximate.</li>
          <li>Connections between past and present are interpretation, not established findings.</li>
          <li>No farmers from the martial-law era were interviewed, so their own accounts are missing.</li>
        </ul>
        <p>See <Link href="/sources" className="underline underline-offset-2">Sources</Link> for labels, open questions and every source.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">How to contribute</h2>
        <p>All content lives in plain text files on GitHub. This site has no sign-in of its own. You need a free GitHub account, and you can help in three ways:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Suggest a source:</strong> fill in a short form on GitHub. Each program page has a button for it.</li>
          <li><strong>Report a problem:</strong> tell us what is wrong or missing, using another short form.</li>
          <li><strong>Edit a file:</strong> propose a change as a pull request. Checks run automatically.</li>
        </ul>
        <p>A maintainer reviews every change before it appears on the site. Please follow the writing rules:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Label every source honestly (who is speaking).</li>
          <li>Keep opinions out of the &quot;happened&quot; text.</li>
          <li>Do not paste long quotes.</li>
        </ul>
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center underline underline-offset-2">Open the repository on GitHub</a>
      </section>
    </main>
  );
}
