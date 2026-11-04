// What this file does: defines the single contract for everything in content/.
// Zod checks YAML files and the inferred types are used by the pages.
import { z } from "zod";
import {
  FIRST_YEAR,
  GAP_KIND_KEYS,
  LAST_YEAR,
  PROGRAM_STATUS_KEYS,
  PROVINCE_KEYS,
  TOPIC_KEYS,
  VOICE_KEYS,
} from "./vocab";

const text = z.string().trim().min(1);
const isoDate = z.iso.date();
const yearInWindow = z.number().int().min(FIRST_YEAR).max(LAST_YEAR);
const url = z.url({ protocol: /^https?$/ });

export const sourceSchema = z.strictObject({
  title: text,
  publisher: text,
  voice: z.enum(VOICE_KEYS),
  cite: text.optional(),
  url: url.optional(),
  accessed: isoDate.optional(),
  backs: z.enum(["promise", "happened", "context"]).optional(),
});
export type Source = z.infer<typeof sourceSchema>;

export const placeSchema = z.strictObject({
  name: text,
  province: z.enum(PROVINCE_KEYS),
  lat: z.number().min(12.8).max(15.2),
  lng: z.number().min(120.2).max(122.8),
  approximate: z.boolean().default(false),
});
export type Place = z.infer<typeof placeSchema>;

const sinceSchema = z.strictObject({
  year: z.number().int().min(FIRST_YEAR).max(2100),
  text,
  source: sourceSchema,
});

const videoSchema = z.strictObject({
  youtubeId: z.string().regex(/^[\w-]{11}$/, "must be an 11-character YouTube id"),
  title: text,
  channel: text,
});

export const programSchema = z
  .strictObject({
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    title: text,
    when: text,
    topic: z.enum(TOPIC_KEYS),
    status: z.enum(PROGRAM_STATUS_KEYS),
    startYear: yearInWindow,
    endYear: yearInWindow.nullish(),
    places: z.array(placeSchema).min(1),
    promised: text.optional(),
    happened: text,
    question: text.optional(),
    since: z.array(sinceSchema).default([]),
    sources: z.array(sourceSchema).default([]),
    checkedOn: isoDate.optional(),
    video: videoSchema.optional(),
  })
  .superRefine((program, ctx) => {
    // These rules prevent unchecked claims from being presented as confirmed.
    const fail = (message: string, path: string) =>
      ctx.addIssue({ code: "custom", message, path: [path] });

    if (program.endYear != null && program.endYear < program.startYear) {
      fail("endYear is before startYear", "endYear");
    }
    if (program.status === "checking" && !program.question) {
      fail("a program that is still being checked needs a question", "question");
    }
    if (program.status === "confirmed") {
      if (!program.checkedOn) fail("a confirmed program needs checkedOn", "checkedOn");
      if (!program.sources.some((source) => source.url)) {
        fail("a confirmed program needs at least one source with a url", "sources");
      }
    }
  });
export type Program = z.infer<typeof programSchema>;

const chartSourceSchema = sourceSchema.required({ url: true, accessed: true });

export const chartPointSchema = z.strictObject({
  label: text,
  value: z.number(),
  goal: z.number().optional(),
  qualifier: z.enum(["exact", "approx", "at_most", "at_least"]).default("exact"),
  source: chartSourceSchema,
  note: text.optional(),
});
export type ChartPoint = z.infer<typeof chartPointSchema>;

export const chartSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  title: text,
  description: text.optional(),
  unit: z.string().default(""),
  caveat: text.optional(),
  points: z.array(chartPointSchema),
});
export type Chart = z.infer<typeof chartSchema>;

export const gapSchema = z.strictObject({
  id: text,
  kind: z.enum(GAP_KIND_KEYS),
  title: text,
  description: text,
  program: z.string().optional(),
});
export type Gap = z.infer<typeof gapSchema>;
