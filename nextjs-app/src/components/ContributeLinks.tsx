// what this file does: the github contribution panel on a program page 
// in v1 this is the only way to contribute: no accounts, no in-site forms
// it uses the shared Card and ButtonLink, so every button is 44px tall and
// opens github in a new tab
// it owns the "contribute" anchor, so the page does not need a wrapper
// change in this version (c10): hidden in print, buttons do nothing on paper
import { editUrl, issueUrl, sourceIssueUrl } from "@/lib/site";
import { ButtonLink } from "./Button";
import { Card } from "./Card";

export function ContributeLinks({ slug }: { slug: string }) {
  // one entry per button, "primary" is the main action
  const links = [
    { href: sourceIssueUrl(slug), label: "Suggest a source", primary: true },
    { href: issueUrl(slug), label: "Report a problem", primary: false },
    { href: editUrl(slug), label: "Edit on GitHub", primary: false },
  ];

  return (
    <section id="contribute" aria-labelledby="contribute-heading" className="scroll-mt-24 print:hidden">
      <Card className="space-y-3">
        <h2 id="contribute-heading" className="text-2xl font-semibold text-stone-900">
          Help improve this page
        </h2>
        {/* plain words about what the reader needs and what happens next */}
        <p className="max-w-[68ch] text-lg leading-relaxed text-stone-800">
          You need a free GitHub account. A maintainer reviews every change before it appears here.
        </p>
        <ul className="flex flex-wrap gap-3">
          {links.map((link) => (
            <li key={link.label}>
              <ButtonLink href={link.href} variant={link.primary ? "primary" : "secondary"}>
                {link.label}
              </ButtonLink>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}