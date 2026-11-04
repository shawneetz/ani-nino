// What this file does: defines every table, enum and CHECK rule in Postgres.
// The database itself rejects bad rows (wrong dates, missing sources, swapped layers).
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  doublePrecision,
  foreignKey,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";
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
} from "../lib/enums";
import { FAMILIES } from "../lib/vocab";

// Family keys come from vocab.ts so the database enum always matches the UI.
const families = Object.keys(FAMILIES) as [
  keyof typeof FAMILIES,
  ...(keyof typeof FAMILIES)[],
];

/* ---------- Enums ---------- */
export const pinLayer = pgEnum("pin_layer", [...LAYERS]);
export const pinFamily = pgEnum("pin_family", families);
export const pinStatus = pgEnum("pin_status", [...STATUSES]);
export const pinBadge = pgEnum("pin_badge", [...BADGES]);
export const sourceKind = pgEnum("source_kind", [...SOURCE_KINDS]);
export const sourceRole = pgEnum("source_role", [...SOURCE_ROLES]);
export const locationPrecision = pgEnum("location_precision", [...LOCATION_PRECISIONS]);
export const eventPrecision = pgEnum("event_precision", [...EVENT_PRECISIONS]);
export const province = pgEnum("province", [...PROVINCES]);
export const chartType = pgEnum("chart_type", [...CHART_TYPES]);
export const seriesKind = pgEnum("series_kind", [...SERIES_KINDS]);
export const qualifier = pgEnum("chart_qualifier", [...QUALIFIERS]);
export const gapKind = pgEnum("gap_kind", [...GAP_KINDS]);
export const gapStatus = pgEnum("gap_status", [...GAP_STATUSES]);

/* ---------- Pins ---------- */
// One row per program or event shown on the map.
export const pins = pgTable(
  "pins",
  {
    id: text("id").primaryKey(), // slug, also used in share links (?pin=slug)
    layer: pinLayer("layer").notNull(),
    title: text("title").notNull(),
    program: text("program"),
    instruments: text("instruments").array().notNull().default(sql`'{}'::text[]`),
    family: pinFamily("family").notNull(), // primary family, sets the pin color
    secondaryFamilies: pinFamily("secondary_families")
      .array()
      .notNull()
      .default(sql`'{}'::pin_family[]`),
    // Slider window. First-of-month dates. end_date NULL = still in effect.
    startDate: date("start_date", { mode: "string" }).notNull(),
    endDate: date("end_date", { mode: "string" }),
    dateLabel: text("date_label").notNull(), // text shown to readers
    promise: text("promise"),
    record: text("record"),
    badge: pinBadge("badge"), // evidence class of the record claim
    status: pinStatus("status").notNull(),
    openQuestion: text("open_question"),
    verifiedOn: date("verified_on", { mode: "string" }),
    verificationNote: text("verification_note"),
  },
  (table) => [
    // Target of the composite foreign keys in pin_links.
    unique("pins_id_layer_uq").on(table.id, table.layer),
    check("pins_id_slug", sql`${table.id} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
    check("pins_start_first_of_month", sql`EXTRACT(DAY FROM ${table.startDate}) = 1`),
    check(
      "pins_end_first_of_month",
      sql`${table.endDate} IS NULL OR EXTRACT(DAY FROM ${table.endDate}) = 1`,
    ),
    check(
      "pins_end_after_start",
      sql`${table.endDate} IS NULL OR ${table.endDate} >= ${table.startDate}`,
    ),
    check(
      "pins_martial_law_window",
      sql`${table.layer} <> 'martial_law' OR (${table.startDate} >= DATE '1972-09-01' AND ${table.startDate} <= DATE '1986-02-01')`,
    ),
    check(
      "pins_today_after_martial_law",
      sql`${table.layer} <> 'today' OR ${table.startDate} >= DATE '1986-03-01'`,
    ),
    check(
      "pins_lead_needs_question",
      sql`${table.status} <> 'lead' OR ${table.openQuestion} IS NOT NULL`,
    ),
    check(
      "pins_verified_complete",
      sql`${table.status} <> 'verified' OR (${table.verifiedOn} IS NOT NULL AND ${table.record} IS NOT NULL AND ${table.badge} IS NOT NULL)`,
    ),
    check(
      "pins_primary_not_in_secondary",
      sql`NOT (${table.family} = ANY(${table.secondaryFamilies}))`,
    ),
  ],
);

/* ---------- Sources ---------- */
export const sources = pgTable(
  "sources",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    publisher: text("publisher").notNull(),
    author: text("author"),
    kind: sourceKind("kind").notNull(),
    url: text("url"),
    archivedUrl: text("archived_url"), // saved copy, protects against dead links
    publishedYear: integer("published_year"),
    accessedOn: date("accessed_on", { mode: "string" }),
    note: text("note"),
  },
  (table) => [
    check("sources_id_slug", sql`${table.id} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
    // A link must say when you opened it.
    check(
      "sources_url_needs_accessed",
      sql`(${table.url} IS NULL AND ${table.archivedUrl} IS NULL) OR ${table.accessedOn} IS NOT NULL`,
    ),
  ],
);

/* ---------- Pin locations (map markers) ---------- */
// One pin can have several markers (for example three towns).
export const pinLocations = pgTable(
  "pin_locations",
  {
    id: serial("id").primaryKey(),
    pinId: text("pin_id")
      .notNull()
      .references(() => pins.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    municipality: text("municipality"),
    province: province("province").notNull(),
    lat: doublePrecision("lat").notNull(),
    lng: doublePrecision("lng").notNull(),
    precision: locationPrecision("precision").notNull().default("municipality"),
    isAnchor: boolean("is_anchor").notNull().default(false), // marker the map flies to
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    // Coarse Philippines box. The seed validator uses a tighter CALABARZON box.
    check("pin_locations_lat", sql`${table.lat} BETWEEN 4.5 AND 21.5`),
    check("pin_locations_lng", sql`${table.lng} BETWEEN 116 AND 127`),
    check("pin_locations_name_not_empty", sql`length(trim(${table.name})) > 0`),
    // At most one anchor per pin.
    uniqueIndex("pin_locations_one_anchor")
      .on(table.pinId)
      .where(sql`${table.isAnchor}`),
  ],
);

/* ---------- Pin <-> source ---------- */
export const pinSources = pgTable(
  "pin_sources",
  {
    pinId: text("pin_id")
      .notNull()
      .references(() => pins.id, { onDelete: "cascade" }),
    sourceId: text("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "restrict" }),
    role: sourceRole("role").notNull(),
    citationNote: text("citation_note"), // for example "Sec. 2" or "p. 14"
  },
  (table) => [primaryKey({ columns: [table.pinId, table.sourceId, table.role] })],
);

/* ---------- Pin events (mini timeline in the panel) ---------- */
export const pinEvents = pgTable("pin_events", {
  id: serial("id").primaryKey(),
  pinId: text("pin_id")
    .notNull()
    .references(() => pins.id, { onDelete: "cascade" }),
  eventDate: date("event_date", { mode: "string" }).notNull(),
  precision: eventPrecision("precision").notNull().default("month"),
  description: text("description").notNull(),
  sourceId: text("source_id").references(() => sources.id, { onDelete: "set null" }),
  sortOrder: integer("sort_order").notNull().default(0),
});

/* ---------- Pin links (past <-> today, always "my interpretation") ---------- */
// The composite foreign keys force the today side to be a 'today' pin and
// the past side to be a 'martial_law' pin, with no trigger needed.
export const pinLinks = pgTable(
  "pin_links",
  {
    id: serial("id").primaryKey(),
    todayPinId: text("today_pin_id").notNull(),
    todayLayer: pinLayer("today_layer").notNull().default("today"),
    pastPinId: text("past_pin_id").notNull(),
    pastLayer: pinLayer("past_layer").notNull().default("martial_law"),
    interpretationNote: text("interpretation_note").notNull(),
  },
  (table) => [
    unique("pin_links_pair_uq").on(table.todayPinId, table.pastPinId),
    check("pin_links_today_layer", sql`${table.todayLayer} = 'today'`),
    check("pin_links_past_layer", sql`${table.pastLayer} = 'martial_law'`),
    check("pin_links_note_not_empty", sql`length(trim(${table.interpretationNote})) > 0`),
    foreignKey({
      name: "pin_links_today_pin_layer_fk",
      columns: [table.todayPinId, table.todayLayer],
      foreignColumns: [pins.id, pins.layer],
    }).onDelete("cascade"),
    foreignKey({
      name: "pin_links_past_pin_layer_fk",
      columns: [table.pastPinId, table.pastLayer],
      foreignColumns: [pins.id, pins.layer],
    }).onDelete("cascade"),
  ],
);

/* ---------- Videos ---------- */
export const videos = pgTable(
  "videos",
  {
    id: text("id").primaryKey(),
    pinId: text("pin_id").references(() => pins.id, { onDelete: "cascade" }),
    youtubeId: text("youtube_id").notNull(),
    title: text("title").notNull(),
    channel: text("channel").notNull(),
    creditLine: text("credit_line").notNull(), // always shown under the embed
    startSeconds: integer("start_seconds"),
    sortOrder: integer("sort_order").notNull().default(0),
    url: text("url"),
    note: text("note"),
  },
  (table) => [
    check("videos_id_slug", sql`${table.id} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
    check("videos_youtube_id_format", sql`${table.youtubeId} ~ '^[A-Za-z0-9_-]{11}$'`),
    unique("videos_youtube_id_uq").on(table.youtubeId),
  ],
);

/* ---------- Charts: chart > series > points ---------- */
export const charts = pgTable("charts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  chartType: chartType("chart_type").notNull(),
  xLabel: text("x_label"),
  yLabel: text("y_label"),
  unit: text("unit"),
  caveat: text("caveat"), // shown under the chart
  sortOrder: integer("sort_order").notNull().default(0),
});

export const chartSeries = pgTable("chart_series", {
  id: serial("id").primaryKey(),
  chartId: text("chart_id")
    .notNull()
    .references(() => charts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  kind: seriesKind("kind").notNull(), // 'target' draws a goal line
  sortOrder: integer("sort_order").notNull().default(0),
});

// Every point carries its own badge and source, because one chart can mix
// claims of different strength.
export const chartPoints = pgTable("chart_points", {
  id: serial("id").primaryKey(),
  seriesId: integer("series_id")
    .notNull()
    .references(() => chartSeries.id, { onDelete: "cascade" }),
  xLabel: text("x_label").notNull(),
  xDate: date("x_date", { mode: "string" }),
  value: doublePrecision("value").notNull(),
  qualifier: qualifier("qualifier").notNull().default("exact"),
  badge: pinBadge("badge").notNull(),
  note: text("note"),
  sortOrder: integer("sort_order").notNull().default(0),
  sourceId: text("source_id")
    .notNull()
    .references(() => sources.id, { onDelete: "restrict" }),
});

/* ---------- Research gaps (feeds the methods page) ---------- */
export const researchGaps = pgTable(
  "research_gaps",
  {
    id: text("id").primaryKey(),
    kind: gapKind("kind").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    pinId: text("pin_id").references(() => pins.id, { onDelete: "set null" }),
    status: gapStatus("status").notNull().default("open"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [check("research_gaps_id_slug", sql`${table.id} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`)],
);

/* ---------- Seed bookkeeping ---------- */
// One row per seed run. counts is compared with your data files at launch.
export const seedRuns = pgTable("seed_runs", {
  id: serial("id").primaryKey(),
  gitSha: text("git_sha"),
  seededAt: timestamp("seeded_at", { withTimezone: true }).notNull().defaultNow(),
  counts: jsonb("counts").notNull(),
});
