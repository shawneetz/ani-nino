// What this file does: one page section with a heading and consistent spacing.
// The heading is linked to the section with aria-labelledby for screen readers.
import type { ReactNode } from "react";

type Props = {
  id: string; // also used for jump links, for example /sources#gaps
  title: string;
  intro?: string; // optional short line under the heading
  className?: string;
  children: ReactNode;
};

export function Section({ id, title, intro, className = "", children }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={`space-y-3 ${className}`}>
      <h2 id={`${id}-heading`} className="text-xl font-semibold tracking-tight text-stone-900">
        {title}
      </h2>
      {/* Reading text stays about 68 characters wide so lines are easy to follow. */}
      {intro && <p className="max-w-[68ch] leading-relaxed text-stone-700">{intro}</p>}
      {children}
    </section>
  );
}
