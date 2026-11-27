// what this file does: one page section with a heading and consistent spacing
// editorial look (e1): a 2px ink rule opens the section, the heading is serif
// and an optional kicker can sit above the heading
// the heading is linked to the section with aria-labelledby for screen readers
import type { ReactNode } from "react";
import { BLOCK_GAP, HEADING, INNER_GAP } from "./Container";
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
    <section id={id} aria-labelledby={`${id}-heading`} className={`${BLOCK_GAP} border-t-2 border-ink pt-4 ${className}`}>
      <div className={INNER_GAP}>
        {kicker && <Kicker>{kicker}</Kicker>}
        <h2 id={`${id}-heading`} className={HEADING}>
          {title}
        </h2>
        {intro && <p className="max-w-[68ch] font-serif text-lg leading-relaxed text-stone-700">{intro}</p>}
      </div>
      {children}
    </section>
  );
}