// What this file does: defines the single contract for everything in content/.
// Zod checks YAML files and the inferred types are used by the pages.
import { z } from "zod";
import {
  FIRST_YEAR,
  GAP_KIND_KEYS,
  LAST_YEAR,
  PROGRAM_STATUS_KEYS,
  PROVINCE_KEYS,
  SCOPE_KEYS,
  TODAY_FIRST_YEAR,
  TODAY_LAST_YEAR,
  ERA_KEYS,
  TOPIC_KEYS,
  VOICE_KEYS,
} from "./vocab";

const text = z.string().trim().min(1);
const isoDate = z.iso.date();
// Widest allowed year. The era rules below narrow it per program.
const anyYear = z.number().int().min(FIRST_YEAR).max(TODAY_LAST_YEAR);
const url = z.url({ protocol: /^https?$/ });

/**
 * Validates one cited source.
 *
 * @remarks
 * `voice` says who is speaking. It is a label, not a verdict on whether the source is right.
 */
export const sourceSchema = z.strictObject({
  title: text,
  publisher: text,
  voice: z.enum(VOICE_KEYS),
  cite: text.optional(),
  url: url.optional(),
  accessed: isoDate.optional(),
  backs: z.enum(["promise", "happened", "context"]).optional(),
});
/** A source as written in yaml, after validation. */
export type Source = z.infer<typeof sourceSchema>;

/**
 * Validates one place on the map, with coordinates limited to the CALABARZON area.
 */
export const placeSchema = z.strictObject({
  name: text,
  province: z.enum(PROVINCE_KEYS),
  lat: z.number().min(12.8).max(15.2),
  lng: z.number().min(120.2).max(122.8),
  approximate: z.boolean().default(false),
});
/** A place as written in yaml, after validation. */
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

const plainSchema = z.strictObject({
  promised: text,
  according: text,
  happened: text,
  missing: text.optional(),
});
export type Plain = z.infer<typeof plainSchema>;

/**
 * Validates one program file in `content/programs/`.
 *
 * @remarks
 * The rules at the bottom keep unchecked claims from being shown as confirmed:
 * a "checking" program needs an open question, and a "confirmed" program needs
 * `checkedOn` and at least one source with a url. Each era also has its own year window.
 */
export const programSchema = z
  .strictObject({
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    title: text,
    when: text,
    topic: z.enum(TOPIC_KEYS),
    // "martial_law" is the main layer. "today" is the echo layer.
    era: z.enum(ERA_KEYS).default("martial_law"),
    // Only for today programs: the slug of the martial-law program it echoes.
    echoOf: z.string().optional(),
    status: z.enum(PROGRAM_STATUS_KEYS),
    startYear: anyYear,
    endYear: anyYear.nullish(),
    places: z.array(placeSchema).min(1),
    promised: text.optional(),
    happened: text,
    question: text.optional(),
    plain: plainSchema.optional(),
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
    // Each era has its own year window.
    if (program.era === "martial_law") {
      if (program.startYear > LAST_YEAR) fail(`a martial-law program must start by ${LAST_YEAR}`, "startYear");
      if (program.endYear != null && program.endYear > LAST_YEAR) {
        fail(`a martial-law program must end by ${LAST_YEAR} (use endYear: null for ongoing)`, "endYear");
      }
    } else if (program.startYear < TODAY_FIRST_YEAR) {
      fail(`a today program must start in ${TODAY_FIRST_YEAR} or later`, "startYear");
    }
    if (program.echoOf && program.era !== "today") {
      fail("only a today program can have echoOf", "echoOf");
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
/** A program as written in yaml, after validation. */
export type Program = z.infer<typeof programSchema>;

// a chart source must always be linkable and dated
const chartSourceSchema = sourceSchema.required({ url: true, accessed: true });

/**
 * Validates one number in a chart.
 *
 * @remarks
 * `kind` decides how the number is drawn. A `"bar"` (the default) is a bar.
 * A `"target"` is a labeled line across the chart, for example a goal.
 * Every point, bar or target, carries a scope and its own single source.
 */
export const chartPointSchema = z.strictObject({
  label: text,
  value: z.number(),
  // "bar" is a drawn bar. "target" is a labeled line across the chart (for example a goal)
  // every point, bar or target, carries a scope and its own single source
  kind: z.enum(["bar", "target"]).default("bar"),
  qualifier: z.enum(["exact", "approx", "at_most", "at_least"]).default("exact"),
  scope: z.enum(SCOPE_KEYS),
  source: chartSourceSchema,
  note: text.optional(),
});
/** A chart point as written in yaml, after validation. */
export type ChartPoint = z.infer<typeof chartPointSchema>;

/**
 * Validates one chart file in `content/charts/`.
 *
 * @remarks
 * A chart may have no points yet. Once it has points, it needs at least two
 * bars or one bar and a target line. The old `goal` field is no longer accepted,
 * use a point with `kind: target`.
 */
export const chartSchema = z
  .strictObject({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    title: text,
    question: text,
    description: text.optional(),
    unit: z.string().default(""),
    caveat: text.optional(),
    sameTotal: z.boolean().default(false),
    points: z.array(chartPointSchema),
  })
  .superRefine((chart, ctx) => {
    if (chart.points.length === 0) return;

    const bars = chart.points.filter((point) => point.kind === "bar").length;
    const targets = chart.points.length - bars;
    if (bars === 0) {
      ctx.addIssue({ code: "custom", message: "a chart needs at least one bar, not only targets", path: ["points"] });
    } else if (bars === 1 && targets === 0) {
      ctx.addIssue({
        code: "custom",
        message: "a chart needs at least two bars or one bar and a target",
        path: ["points"],
      });
    }
  });
/** A chart as written in yaml, after validation. */
export type Chart = z.infer<typeof chartSchema>;

/**
 * Validates one research gap listed in `content/gaps.yaml`.
 *
 * @remarks
 * `program`, when given, must match an existing program slug. The content loader checks that.
 */
export const gapSchema = z.strictObject({
  id: text,
  kind: z.enum(GAP_KIND_KEYS),
  title: text,
  description: text,
  program: z.string().optional(),
});
/** A gap as written in yaml, after validation. */
export type Gap = z.infer<typeof gapSchema>;