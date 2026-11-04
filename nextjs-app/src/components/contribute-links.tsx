// What this file does: provides GitHub contribution links until accounts ship.
import { editUrl, issueUrl, sourceIssueUrl } from "@/lib/site";

export function ContributeLinks({ slug }: { slug: string }) {
  const links = [
    { href: sourceIssueUrl(slug), label: "Suggest a source" },
    { href: issueUrl(slug), label: "Report a problem" },
    { href: editUrl(slug), label: "Edit this on GitHub" },
  ];

  return (
    <section aria-labelledby="contribute-heading" className="space-y-2 border-t pt-4">
      <h2 id="contribute-heading" className="text-lg font-semibold">Help improve this page</h2>
      <ul className="flex flex-wrap gap-4 text-sm">
        {links.map((link) => (
          <li key={link.label}>
            <a href={link.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
