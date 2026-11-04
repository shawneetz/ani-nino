// What this file does: applies an approved proposal to the YAML text of a
// program (and gaps.yaml when needed) and re-checks the result with the same
// schema the build uses. It returns file changes. It does no network work,
// so it is easy to test.
import { isMap, isSeq, parse, parseDocument, stringify, type Document } from "yaml";
import { SafeError } from "./action-result";
import { gapSchema, programSchema } from "./content-schema";
import type { ProposalPayload } from "./proposal-schema";

export class ProposalApplyError extends SafeError {}

export type FileChange = { path: string; content: string };

export const GAPS_PATH = "content/gaps.yaml";
export const programPath = (slug: string) => `content/programs/${slug}.yaml`;

// Which files must be read from GitHub before applying this proposal.
export function filesNeeded(slug: string, payload: ProposalPayload): string[] {
  return payload.type === "fill_gap" ? [programPath(slug), GAPS_PATH] : [programPath(slug)];
}

// Prints YAML without wrapping long lines, so the pull request diff stays small.
const PRINT = { lineWidth: 0 };

function readDocument(text: string | null | undefined, what: string): Document {
  if (!text) throw new ProposalApplyError(`The ${what} file was not found.`);
  const doc = parseDocument(text);
  if (doc.errors.length > 0) throw new ProposalApplyError(`The ${what} file is not valid YAML.`);
  return doc;
}

// Adds one item to a list. Creates the list when it does not exist yet.
function appendToList(doc: Document, key: string, value: unknown) {
  const existing = doc.get(key, true);
  if (isSeq(existing)) existing.add(doc.createNode(value));
  else doc.set(key, doc.createNode([value]));
}

// Checks the final program text with the real schema.
function checkProgramText(text: string, slug: string) {
  let data: unknown;
  try {
    data = parse(text);
  } catch {
    throw new ProposalApplyError("The program file is not valid YAML after the change.");
  }
  const result = programSchema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues
      .slice(0, 3)
      .map((issue) => `${issue.path.join(".") || "(root)"} ${issue.message}`)
      .join("; ");
    throw new ProposalApplyError(`The change breaks the program rules: ${details}`);
  }
  if (result.data.slug !== slug) throw new ProposalApplyError("The slug does not match the file name.");
}

type NewProgram = Extract<ProposalPayload, { type: "new_program" }>["program"];

// A new program is always "checking". The contributor cannot choose a status.
function newProgramChange(slug: string, program: NewProgram, existing: string | null): FileChange {
  if (existing) throw new ProposalApplyError("A program with this slug already exists.");
  const data = {
    slug: program.slug,
    title: program.title,
    when: program.when,
    topic: program.topic,
    status: "checking",
    startYear: program.startYear,
    endYear: program.endYear,
    places: program.places,
    promised: program.promised,
    happened: program.happened,
    question: program.question,
    sources: program.sources,
  };
  const content = stringify(data, PRINT);
  checkProgramText(content, slug);
  return { path: programPath(slug), content };
}

export type ApplyInput = {
  programSlug: string;
  payload: ProposalPayload;
  files: Record<string, string | null | undefined>; // file path -> current text
};

export function applyProposal({ programSlug, payload, files }: ApplyInput): FileChange[] {
  const path = programPath(programSlug);

  if (payload.type === "new_program") {
    return [newProgramChange(programSlug, payload.program, files[path] ?? null)];
  }

  const doc = readDocument(files[path], "program");

  switch (payload.type) {
    case "add_source":
      appendToList(doc, "sources", payload.source);
      break;

    case "add_since":
      appendToList(doc, "since", { year: payload.year, text: payload.text, source: payload.source });
      break;

    case "correction":
      doc.set(payload.field, payload.newText);
      break;

    case "correction_place": {
      const places = doc.get("places", true);
      const place = isSeq(places)
        ? places.items.find((item) => isMap(item) && item.get("name") === payload.placeName)
        : undefined;
      if (!isMap(place)) throw new ProposalApplyError("That place is not on this program.");
      place.set("lat", payload.lat);
      place.set("lng", payload.lng);
      place.set("approximate", payload.approximate);
      appendToList(doc, "sources", payload.source);
      break;
    }

    case "fill_gap": {
      // The gap must exist and belong to this program.
      const gapsDoc = readDocument(files[GAPS_PATH], "gaps");
      const gaps = gapSchema.array().safeParse(gapsDoc.toJS());
      if (!gaps.success) throw new ProposalApplyError("The gaps file is not valid.");
      const index = gaps.data.findIndex((gap) => gap.id === payload.gapId && gap.program === programSlug);
      if (index === -1) throw new ProposalApplyError("That gap is not listed for this program.");

      // Add the answer to "happened", add the source, and remove the gap.
      const current = String(doc.get("happened") ?? "").trim();
      doc.set("happened", `${current} ${payload.happenedText}`.trim());
      appendToList(doc, "sources", payload.source);
      gapsDoc.deleteIn([index]);

      const programText = doc.toString(PRINT);
      checkProgramText(programText, programSlug);
      return [
        { path, content: programText },
        { path: GAPS_PATH, content: gapsDoc.toString(PRINT) },
      ];
    }
  }

  const content = doc.toString(PRINT);
  checkProgramText(content, programSlug);
  return [{ path, content }];
}
