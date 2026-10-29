// What this file does: defines Zod checks for pin, source, and snapshot data.
import { z } from "zod";
import {
  BADGES,
  CHART_TYPES,
  EVENT_PRECISIONS,
  GAP_KINDS,
  GAP_STATUSES,
  LAYERS,
  LOCATION_PRECISIONS,
  PROVINCES,
  QUALIFIERS,
  SERIES_KINDS,
  SOURCE_KINDS,
  SOURCE_ROLES,
  STATUSES,
} from "./enums";
import { FAMILIES } from "./vocab";

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Keep family values aligned with the labels used throughout the interface.
const familySchema = z.enum(Object.keys(FAMILIES) as [keyof typeof FAMILIES, ...(keyof typeof FAMILIES)[]]);
const sourceKindSchema = z.enum(SOURCE_KINDS);
const sourceRoleSchema = z.enum(SOURCE_ROLES);
const badgeSchema = z.enum(BADGES);

export const locationSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  municipality: z.string().nullable(),
  province: z.enum(PROVINCES),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  precision: z.enum(LOCATION_PRECISIONS),
  isAnchor: z.boolean(),
  sortOrder: z.number().int(),
});

export const pinSummarySchema = z.object({
  id: z.string().regex(SLUG_RE),
  layer: z.enum(LAYERS),
  title: z.string().min(1),
  program: z.string().nullable(),
  instruments: z.array(z.string()),
  family: familySchema,
  secondaryFamilies: z.array(familySchema),
  startDate: z.iso.date(),
  endDate: z.iso.date().nullable(),
  dateLabel: z.string().min(1),
  promise: z.string().nullable(),
  record: z.string().nullable(),
  badge: z.enum(BADGES).nullable(),
  status: z.enum(STATUSES),
  openQuestion: z.string().nullable(),
  verifiedOn: z.iso.date().nullable(),
  verificationNote: z.string().nullable(),
  locations: z.array(locationSchema),
});

export const sourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  publisher: z.string().min(1),
  author: z.string().nullable(),
  kind: sourceKindSchema,
  url: z.url().nullable(),
  archivedUrl: z.url().nullable(),
  publishedYear: z.number().int().nullable(),
  accessedOn: z.iso.date().nullable(),
  note: z.string().nullable(),
});

const pinSourceSchema = sourceSchema.extend({
  role: sourceRoleSchema,
  citationNote: z.string().nullable(),
});

const eventSchema = z.object({
  id: z.number().int(),
  eventDate: z.iso.date(),
  precision: z.enum(EVENT_PRECISIONS),
  description: z.string().min(1),
  sourceId: z.string().nullable(),
  sortOrder: z.number().int(),
});

const linkedPinSchema = z.object({
  id: z.string().regex(SLUG_RE),
  title: z.string().min(1),
  layer: z.enum(LAYERS),
  dateLabel: z.string().min(1),
  family: familySchema,
});

const pinLinkSchema = z.object({
  interpretationNote: z.string().min(1),
  linkedPin: linkedPinSchema,
});

const videoSchema = z.object({
  id: z.string(),
  pinId: z.string().nullable(),
  youtubeId: z.string(),
  title: z.string(),
  channel: z.string(),
  creditLine: z.string(),
  startSeconds: z.number().int().nullable(),
  sortOrder: z.number().int(),
  url: z.url().nullable(),
  note: z.string().nullable(),
});

export const pinDetailSchema = pinSummarySchema.extend({
  sources: z.array(pinSourceSchema),
  events: z.array(eventSchema),
  links: z.array(pinLinkSchema),
  videos: z.array(videoSchema),
});

export const chartPointSchema = z.object({
  id: z.number().int(),
  xLabel: z.string(),
  xDate: z.iso.date().nullable(),
  value: z.number(),
  qualifier: z.enum(QUALIFIERS),
  badge: badgeSchema,
  note: z.string().nullable(),
  sortOrder: z.number().int(),
  source: z.object({
    id: z.string(),
    title: z.string(),
    publisher: z.string(),
    url: z.url().nullable(),
  }),
});

export const chartSeriesSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  kind: z.enum(SERIES_KINDS),
  sortOrder: z.number().int(),
  points: z.array(chartPointSchema),
});

export const chartSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  chartType: z.enum(CHART_TYPES),
  xLabel: z.string().nullable(),
  yLabel: z.string().nullable(),
  unit: z.string().nullable(),
  caveat: z.string().nullable(),
  sortOrder: z.number().int(),
  series: z.array(chartSeriesSchema),
});

export const chartsResponseSchema = z.object({ charts: z.array(chartSchema) });

export const gapSchema = z.object({
  id: z.string(),
  kind: z.enum(GAP_KINDS),
  title: z.string(),
  description: z.string(),
  pinId: z.string().nullable(),
  status: z.enum(GAP_STATUSES),
  sortOrder: z.number().int(),
});

export const methodsSchema = z.object({
  sourcesByKind: z.array(z.object({ kind: sourceKindSchema, sources: z.array(sourceSchema) })),
  gaps: z.array(gapSchema),
  leadPins: z.array(
    z.object({
      id: z.string().regex(SLUG_RE),
      title: z.string(),
      layer: z.enum(LAYERS),
      openQuestion: z.string().nullable(),
    }),
  ),
  counts: z.object({
    pins: z.number().int().nonnegative(),
    sources: z.number().int().nonnegative(),
    byBadge: z.record(z.string(), z.number().int().nonnegative()),
    byStatus: z.record(z.string(), z.number().int().nonnegative()),
  }),
});

export const pinsResponseSchema = z.object({
  count: z.number().int(),
  filters: z.object({
    month: z.string().optional(),
    mode: z.enum(["range", "cumulative"]),
    families: z.array(familySchema),
    provinces: z.array(z.enum(PROVINCES)),
    today: z.boolean(),
  }),
  pins: z.array(pinSummarySchema),
});

export const errorResponseSchema = z.object({
  error: z.string(),
  issues: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
});

export const snapshotSchema = z.object({
  generatedAt: z.iso.datetime(),
  pins: z.array(pinSummarySchema),
  details: z.record(z.string(), pinDetailSchema),
  charts: z.array(chartSchema),
  methods: methodsSchema,
});

export type PinSummary = z.infer<typeof pinSummarySchema>;
export type PinDetail = z.infer<typeof pinDetailSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type Chart = z.infer<typeof chartSchema>;
export type Methods = z.infer<typeof methodsSchema>;
export type PinsResponse = z.infer<typeof pinsResponseSchema>;
export type Snapshot = z.infer<typeof snapshotSchema>;
