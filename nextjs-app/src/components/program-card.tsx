// What this file does: renders one link in the program list.
import Link from "next/link";
import { yearRange } from "@/lib/filter";
import type { ExplorerProgram } from "@/lib/explorer-types";
import { TOPICS } from "@/lib/vocab";
import { StatusTag } from "./status-tag";

export function ProgramCard({ program }: { program: ExplorerProgram }) {
  const topic = TOPICS[program.topic];
  return (
    <Link href={`/programs/${program.slug}`} className="block rounded-lg border border-stone-200 bg-white p-3 hover:border-stone-400">
      <h3 className="font-medium text-stone-900">{program.title}</h3>
      <div className="mt-1 flex flex-wrap gap-3 text-sm text-stone-600">
        <span>{yearRange(program)}</span>
        <span>{topic.label}</span>
        {/* Marks echo programs so they are not mistaken for martial-law ones. */}
        {program.era === "today" && <span className="font-medium text-amber-800">Today</span>}
        <StatusTag status={program.status} hideConfirmed />
      </div>
    </Link>
  );
}
