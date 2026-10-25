// What this file does: creates a titled, accessible section in the pin detail panel.
import { useId, type ReactNode } from "react";

export function Section({ title, children }: { title: string; children: ReactNode }) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="mt-6 first:mt-0">
      <h3 id={headingId} className="text-sm font-semibold text-neutral-900">{title}</h3>
      {children}
    </section>
  );
}
