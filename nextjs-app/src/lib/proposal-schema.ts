// What this file does: the rules for every proposal a contributor can send.
// It reuses pieces of content-schema.ts, so a proposal follows the same source
// rules as the YAML files. All objects are strict: an unknown field (like
// "status") is refused. That is why a contributor can never set "confirmed".
import { z } from "zod";
import { placeSchema } from "./content-schema";
import { LENGTHS } from "./limits";
import { FIRST_YEAR, LAST_YEAR, TOPIC_KEYS, VOICE_KEYS } from "./vocab";

export const PROPOSAL_TYPES = [
  "add_source",
  "add_since",
  "correction",
  "correction_place",
  "fill_gap",
  "new_program",
] as const;

export const PROPOSAL_STATES = [
  "pending",
  "needs_changes",
  "approved",
  "published",
  "rejected",
  "withdrawn",
] as const;
export type ProposalState = (typeof PROPOSAL_STATES)[number];

// A proposal that is still waiting on someone counts toward the pending cap.
export const OPEN_STATES: ProposalState[] = ["pending", "needs_changes"];

function hasControlCharacters(value: string): boolean {
  return [...value].some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127);
}

// Markdown marks we refuse: bold, underline, code, link syntax, headings, bullets.
const MARKDOWN = /(\*\*|__|`|\]\(|^\s*#{1,6}\s|^\s*[-*+]\s)/;

// Plain text only: one line, no HTML, no markdown, no links.
export function plainText(max: number) {
  return z
    .string()
    .trim()
    .min(1, "This field is required")
    .max(max, `Use ${max} characters or fewer`)
    .refine((v) => !/[<>]/.test(v), "Plain text only. Do not use < or >")
    .refine((v) => !/(https?:\/\/|www\.)/i.test(v), "Do not put links in the text. Use the link field")
    .refine((v) => !MARKDOWN.test(v), "Plain text only. Do not use markdown")
    .refine((v) => !hasControlCharacters(v), "Use one line of plain text");
}

const slugSchema = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase words joined by hyphens").max(100);
const yearInWindow = z.number().int().min(FIRST_YEAR).max(LAST_YEAR);
const today = () => new Date().toISOString().slice(0, 10);

// A source in a proposal always needs a link, an access date and a label.
export const proposalSourceSchema = z.strictObject({
  title: plainText(LENGTHS.sourceTitle),
  publisher: plainText(LENGTHS.publisher),
  voice: z.enum(VOICE_KEYS),
  cite: plainText(LENGTHS.cite).optional(),
  url: z
    .url({ protocol: /^https?$/ })
    .refine((value) => value.length <= LENGTHS.url, `Link must be ${LENGTHS.url} characters or fewer`),
  accessed: z.iso.date().refine((date) => date <= today(), "Access date cannot be in the future"),
  backs: z.enum(["promise", "happened", "context"]).optional(),
});

// Same bounds as the real place rules, but the name is plain text.
const proposalPlaceSchema = placeSchema.extend({ name: plainText(LENGTHS.placeName) });

const addSource = z.strictObject({
  type: z.literal("add_source"),
  source: proposalSourceSchema,
});

const addSince = z.strictObject({
  type: z.literal("add_since"),
  year: z.number().int().min(FIRST_YEAR).max(2100),
  text: plainText(LENGTHS.followUp),
  source: proposalSourceSchema,
});

// New wording for one text field.
const correction = z.strictObject({
  type: z.literal("correction"),
  field: z.enum(["promised", "happened", "when"]),
  newText: plainText(LENGTHS.correction),
  source: proposalSourceSchema,
});

// New coordinates for one place that already exists on the program.
const correctionPlace = z.strictObject({
  type: z.literal("correction_place"),
  placeName: plainText(LENGTHS.placeName),
  lat: placeSchema.shape.lat,
  lng: placeSchema.shape.lng,
  approximate: z.boolean(),
  source: proposalSourceSchema,
});

// An answer to a gap listed on the Sources page.
const fillGap = z.strictObject({
  type: z.literal("fill_gap"),
  gapId: z.string().regex(/^[a-z0-9-]+$/).max(100),
  happenedText: plainText(LENGTHS.followUp),
  source: proposalSourceSchema,
});

// A full new program. There is no "status" field: it is always "checking".
const newProgramBody = z
  .strictObject({
    slug: slugSchema,
    title: plainText(LENGTHS.programTitle),
    when: plainText(LENGTHS.when),
    topic: z.enum(TOPIC_KEYS),
    startYear: yearInWindow,
    endYear: yearInWindow.nullish(),
    places: z.array(proposalPlaceSchema).min(1).max(5),
    promised: plainText(LENGTHS.promised).optional(),
    happened: plainText(LENGTHS.happened),
    question: plainText(LENGTHS.question),
    sources: z.array(proposalSourceSchema).min(1).max(5),
  })
  .refine((p) => p.endYear == null || p.endYear >= p.startYear, {
    message: "endYear is before startYear",
    path: ["endYear"],
  });

const newProgram = z.strictObject({
  type: z.literal("new_program"),
  program: newProgramBody,
});

export const proposalPayloadSchema = z.discriminatedUnion("type", [
  addSource,
  addSince,
  correction,
  correctionPlace,
  fillGap,
  newProgram,
]);
export type ProposalPayload = z.infer<typeof proposalPayloadSchema>;
export type ProposalType = ProposalPayload["type"];

// What the form sends: which program, why, and the change itself.
export const proposalInputSchema = z
  .strictObject({
    programSlug: slugSchema,
    reason: plainText(LENGTHS.reason),
    payload: proposalPayloadSchema,
  })
  .superRefine((value, ctx) => {
    if (value.payload.type === "new_program" && value.payload.program.slug !== value.programSlug) {
      ctx.addIssue({
        code: "custom",
        message: "programSlug must match the new program's slug",
        path: ["programSlug"],
      });
    }
  });
export type ProposalInput = z.infer<typeof proposalInputSchema>;

// A note from the admin (for "needs changes" or "rejected").
export const reviewNoteSchema = plainText(LENGTHS.reviewNote);

// Every link inside a proposal. Used for the duplicate check.
export function proposalUrls(payload: ProposalPayload): string[] {
  if (payload.type === "new_program") return payload.program.sources.map((source) => source.url);
  return [payload.source.url];
}

// Turns Zod errors into a short message a person can read.
export function formatIssues(error: z.ZodError): string {
  return error.issues
    .slice(0, 3)
    .map((issue) => (issue.path.length ? `${issue.path.join(".")}: ${issue.message}` : issue.message))
    .join("; ");
}
