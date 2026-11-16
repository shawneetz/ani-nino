// what this file does: the card that opens over the map when a program is selected
// it previews first, the reader chooses to open the full page
// the parent moves focus here on open and closes it on escape 
import type { RefObject } from "react";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { yearRange } from "@/lib/filter";
import { TOPICS } from "@/lib/vocab";
import { Button, ButtonLink } from "./Button";
import { StatusTag } from "./StatusTag";

type Props = {
  program: ExplorerProgram;
  containerRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
};

export function PreviewCard({ program, containerRef, onClose }: Props) {
  const topic = TOPICS[program.topic];

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Program preview"
      tabIndex={-1}
      className="absolute inset-x-3 bottom-3 z-10 max-w-md space-y-2 rounded-card border border-stone-300 bg-white p-4 shadow-lg"
    >
      <h3 className="text-lg font-semibold leading-snug text-stone-900">{program.title}</h3>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-stone-700">
        <span>{yearRange(program)}</span>
        <span className="font-medium" style={{ color: topic.color }}>{topic.label}</span>
        <StatusTag status={program.status} />
      </div>
      <p className="leading-relaxed text-stone-800">{program.summary}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        <ButtonLink href={`/programs/${program.slug}`}>Open program</ButtonLink>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}
