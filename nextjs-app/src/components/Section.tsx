// what this file does: one page section with a heading and consistent spacing
// editorial look (e1): a 2px ink rule opens the section, the heading is serif
// and an optional kicker can sit above the heading
// the heading is linked to the section with aria-labelledby for screen readers
import type { ReactNode } from "react";
import { Kicker } from "./Kicker";

type Props = {
  id: string; // also used for jump links, for example /sources#gaps
  title: string;
  intro?: string; // optional short line under the heading
  kicker?: string; // optional small uppercase label above the heading
  className?: string;
  children: ReactNode;
};

export function Section({ id, title, intro, kicker, className = "", children }: Props) {
  return (
    // the thick top rule marks where a section starts, like a printed page
    <section id={id} aria-labelledby={`${id}-heading`} className={`space-y-3 border-t-2 border-ink pt-4 ${className}`}>
      {/* the kicker stays outside the heading, so the section's accessible name is only the title */}
      {kicker && <Kicker>{kicker}</Kicker>}
      <h2 id={`${id}-heading`} className="font-serif text-2xl font-semibold tracking-tight text-stone-950">
        {title}
      </h2>
      {/* reading text stays about 68 characters wide so lines are easy to follow */}
      {intro && <p className="max-w-[68ch] font-serif text-lg leading-relaxed text-stone-700">{intro}</p>}
      {children}
    </section>
  );
}