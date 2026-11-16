// what this file does: the top of a program page 
// shows a large title, years, topic, a large status tag, the "checked on" date
// and the copy link button, so a reader can share the page right away
// it is a server component, only the copy button runs in the browser
import type { Program } from "@/lib/content-schema";
import { yearRange } from "@/lib/filter";
import { TOPICS } from "@/lib/vocab";
import { CopyLinkButton } from "./CopyLinkButton";
import { StatusTag } from "./StatusTag";

// only the fields the header needs, so it stays easy to test and reuse
type Props = {
    program: Pick<Program, "title" | "topic" | "era" | "status" | "checkedOn" | "startYear" | "endYear">;
};

export function ProgramHeader({ program }: Props) {
    const topic = TOPICS[program.topic];

    return (
        <header className="space-y-3">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-stone-950 sm:text-4xl">
                {program.title}
            </h1>

            {/* years, topic, era and status in one wrapping row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-lg text-stone-700">
                <span>{yearRange(program)}</span>
                <span className="font-medium" style={{ color: topic.color }}>{topic.label}</span>
                {/* marks echo programs so they are not mistaken for martial-law ones */}
                {program.era === "today" && <span className="font-medium text-amber-800">Today</span>}
                <StatusTag status={program.status} size="large" />
                {program.checkedOn && <span>Checked on {program.checkedOn}</span>}
            </div>

            <div>
                <CopyLinkButton />
            </div>
        </header>
    );
}