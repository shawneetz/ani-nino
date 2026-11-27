// what this file does: the top of a program page
// a kicker (topic and years), a large serif title, the dateline strip and the copy link button
// it is a server component, only the copy button runs in the browser
// change in this version (e5): editorial header, a 2px ink rule opens the page
// the lead sentence is not shown here, it lives in the record panel so the text is never repeated
import type { Program } from "@/lib/content-schema";
import { yearRange } from "@/lib/filter";
import { TOPICS } from "@/lib/vocab";
import { PAGE_HEADER, PAGE_TITLE } from "./Container";
import { CopyLinkButton } from "./CopyLinkButton";
import { Dateline } from "./Dateline";
import { Kicker } from "./Kicker";

// only the fields the header needs, so it stays easy to test and reuse
type Props = {
  program: Pick<Program, "title" | "topic" | "era" | "status" | "checkedOn" | "startYear" | "endYear" | "places">;
};

export function ProgramHeader({ program }: Props) {
  const topic = TOPICS[program.topic];

  return (
    <header className={PAGE_HEADER}>
      <Kicker>
        {/* the topic color depends on the data, so it stays inline */}
        <span style={{ color: topic.color }}>{topic.label}</span> · {yearRange(program)}
        {/* marks echo programs so they are not mistaken for martial-law ones */}
        {program.era === "today" && " · Today"}
      </Kicker>

      <h1 className={PAGE_TITLE}>{program.title}</h1>

      <Dateline
        status={program.status}
        checkedOn={program.checkedOn}
        placeCount={program.places.length}
        startYear={program.startYear}
        endYear={program.endYear}
        topic={program.topic}
      />

      <div>
        <CopyLinkButton />
      </div>
    </header>
  );
}