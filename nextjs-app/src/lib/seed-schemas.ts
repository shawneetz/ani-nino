// What this file does: describes the shape of every file in data/ using Zod.
// It checks structure only (types, allowed values, coordinates).
// Rules that compare things (every source exists, one anchor per pin)
// live in seed-validate.ts.
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
import { SLUG_RE } from "./api-schemas";
import { FAMILIES, type Family } from "./vocab";

// Small reusable pieces.
const slug = z.string().regex(SLUG_RE, "must be a lowercase-kebab slug");
const isoDate = z.iso.date();
const text = z.string().trim().min(1, "must not be empty");
const familyKeys = Object.keys(FAMILIES) as [Family, ...Family[]];
const family = z.enum(familyKeys);

// Generous box around CALABARZON. A typo like swapped lat/lng fails here.
export const CALABARZON_BOX = { minLat: 13.0, maxLat: 15.0, minLng: 120.5, maxLng: 122.8 };

/* ---------- sources.json ---------- */
export const seedSourceSchema = z.strictObject({
  id: slug,
  title: text,
  publisher: text,
  author: z.string().nullish(),
  kind: z.enum(SOURCE_KINDS),
  url: z.url().nullish(),
  archivedUrl: z.url().nullish(),
  publishedYear: z.number().int().min(1900).max(2100).nullish(),
  accessedOn: isoDate.nullish(),
  note: z.string().nullish(),
});

/* ---------- pins/*.json (each pin is nested) ---------- */
const seedLocationSchema = z.strictObject({
  name: text,
  municipality: z.string().nullish(),
  province: z.enum(PROVINCES),
  lat: z.number().min(CALABARZON_BOX.minLat).max(CALABARZON_BOX.maxLat),
  lng: z.number().min(CALABARZON_BOX.minLng).max(CALABARZON_BOX.maxLng),
  precision: z.enum(LOCATION_PRECISIONS).default("municipality"),
  isAnchor: z.boolean().default(false),
});

const seedPinSourceSchema = z.strictObject({
  source: slug, // id of an entry in sources.json
  role: z.enum(SOURCE_ROLES),
  citationNote: z.string().nullish(),
});

const seedEventSchema = z.strictObject({
  eventDate: isoDate,
  precision: z.enum(EVENT_PRECISIONS).default("month"),
  description: text,
  source: slug.nullish(),
});

export const seedPinSchema = z.strictObject({
  id: slug,
  layer: z.enum(LAYERS),
  title: text,
  program: z.string().nullish(),
  instruments: z.array(text).default([]),
  family,
  secondaryFamilies: z.array(family).default([]),
  startDate: isoDate,
  endDate: isoDate.nullish(),
  dateLabel: text,
  promise: z.string().nullish(),
  record: z.string().nullish(),
  badge: z.enum(BADGES).nullish(),
  status: z.enum(STATUSES),
  openQuestion: z.string().nullish(),
  verifiedOn: isoDate.nullish(),
  verificationNote: z.string().nullish(),
  locations: z.array(seedLocationSchema).default([]),
  sources: z.array(seedPinSourceSchema).default([]),
  events: z.array(seedEventSchema).default([]),
});

/* ---------- links.json ---------- */
export const seedLinkSchema = z.strictObject({
  today: slug, // id of a Today pin
  past: slug, // id of a martial-law pin
  interpretationNote: text,
});

/* ---------- charts.json (chart > series > points) ---------- */
const seedPointSchema = z.strictObject({
  xLabel: text,
  xDate: isoDate.nullish(),
  value: z.number(),
  qualifier: z.enum(QUALIFIERS).default("exact"),
  badge: z.enum(BADGES),
  source: slug,
  note: z.string().nullish(),
});

const seedSeriesSchema = z.strictObject({
  name: text,
  kind: z.enum(SERIES_KINDS).default("actual"),
  points: z.array(seedPointSchema).default([]),
});

export const seedChartSchema = z.strictObject({
  id: slug,
  title: text,
  description: z.string().nullish(),
  chartType: z.enum(CHART_TYPES),
  xLabel: z.string().nullish(),
  yLabel: z.string().nullish(),
  unit: z.string().nullish(),
  caveat: z.string().nullish(),
  series: z.array(seedSeriesSchema).default([]),
});

/* ---------- videos.json (every video belongs to a pin) ---------- */
export const seedVideoSchema = z.strictObject({
  id: slug,
  pin: slug,
  youtubeId: z.string().regex(/^[A-Za-z0-9_-]{11}$/, "must be an 11-character YouTube id"),
  title: text,
  channel: text,
  creditLine: text,
  startSeconds: z.number().int().min(0).nullish(),
  url: z.url().nullish(),
  note: z.string().nullish(),
});

/* ---------- gaps.json (feeds the methods page) ---------- */
export const seedGapSchema = z.strictObject({
  id: slug,
  kind: z.enum(GAP_KINDS),
  title: text,
  description: text,
  pin: slug.nullish(),
  status: z.enum(GAP_STATUSES).default("open"),
});

/* ---------- Types: the parsed content of all files ---------- */
export type SeedSource = z.output<typeof seedSourceSchema>;
export type SeedPin = z.output<typeof seedPinSchema>;
export type SeedLink = z.output<typeof seedLinkSchema>;
export type SeedChart = z.output<typeof seedChartSchema>;
export type SeedVideo = z.output<typeof seedVideoSchema>;
export type SeedGap = z.output<typeof seedGapSchema>;

export interface SeedBundle {
  sources: SeedSource[];
  pins: SeedPin[];
  links: SeedLink[];
  charts: SeedChart[];
  videos: SeedVideo[];
  gaps: SeedGap[];
}
