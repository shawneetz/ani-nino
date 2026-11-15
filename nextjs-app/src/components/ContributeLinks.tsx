// What this file does: shows the GitHub contribution panel on a program page.
// In v1 this is the ONLY way to contribute: no accounts, no in-site forms.
// Each button is at least 44px tall so it is easy to tap on a phone.
import { editUrl, issueUrl, sourceIssueUrl } from "@/lib/site";

export function ContributeLinks({ slug }: { slug: string }) {
  // One entry per button. "primary" is the main action.
  const links = [
    { href: sourceIssueUrl(slug), label: "Suggest a source", primary: true },
    { href: issueUrl(slug), label: "Report a problem", primary: false },
    { href: editUrl(slug), label: "Edit on GitHub", primary: false },
  ];

  return (
    <section aria-labelledby="contribute-heading" className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <h2 id="contribute-heading" className="text-lg font-semibold">Help improve this page</h2>
      {/* Plain words about what the reader needs and what happens next. */}
      <p className="max-w-[68ch] text-sm leading-relaxed text-stone-700">
        You need a free GitHub account. A maintainer reviews every change before it appears here.
      </p>
      <ul className="flex flex-wrap gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex min-h-[44px] items-center rounded-lg border px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 ${
                link.primary
                  ? "border-amber-700 bg-amber-700 text-white hover:bg-amber-800"
                  : "border-stone-400 bg-white text-stone-900 hover:border-stone-600"
              }`}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
