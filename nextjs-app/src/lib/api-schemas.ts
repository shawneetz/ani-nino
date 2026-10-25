import { z } from "zod";
import {
  BADGES,
  EVENT_PRECISIONS,
  LAYERS,
  LOCATION_PRECISIONS,
  PROVINCES,
  SOURCE_KINDS,
  SOURCE_ROLES,
  STATUSES,
} from "./enums";
import { FAMILIES } from "./vocab";

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const familySchema = z.enum(Object.keys(FAMILIES) as [keyof typeof FAMILIES, ...(keyof typeof FAMILIES)[]]);
const sourceKindSchema = z.enum(SOURCE_KINDS);
const sourceRoleSchema = z.enum(SOURCE_ROLES);

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
  title: z.string(),
  url: z.url().nullable(),
  note: z.string().nullable(),
});

export const pinDetailSchema = pinSummarySchema.extend({
  sources: z.array(pinSourceSchema),
  events: z.array(eventSchema),
  links: z.array(pinLinkSchema),
  videos: z.array(videoSchema),
});

const sourceGroupSchema = z.object({
  kind: sourceKindSchema,
  sources: z.array(sourceSchema),
});

export const snapshotSchema = z.object({
  generatedAt: z.iso.datetime(),
  pins: z.array(pinSummarySchema),
  details: z.record(z.string(), pinDetailSchema),
  charts: z.array(z.unknown()),
  methods: z.object({
    sourcesByKind: z.array(sourceGroupSchema),
    gaps: z.array(z.unknown()),
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
  }),
});

export type PinSummary = z.infer<typeof pinSummarySchema>;
export type PinDetail = z.infer<typeof pinDetailSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type Snapshot = z.infer<typeof snapshotSchema>;
