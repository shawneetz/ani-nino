import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb } from "./client";
import {
  chartPoints,
  chartSeries,
  charts,
  pinEvents,
  pinLinks,
  pinLocations,
  pinSources,
  pins,
  researchGaps,
  sources,
  videos,
} from "./schema";
import { visiblePins, type PinFilters } from "../lib/filter";
import { SOURCE_KINDS } from "../lib/enums";
import { readSnapshot } from "../lib/snapshot";
import type {
  Chart,
  Methods,
  PinDetail,
  PinSummary,
  Snapshot,
  Source,
} from "../lib/api-schemas";

const CACHE_TTL_MS = 60_000;
const DB_RETRY_DELAY_MS = 15_000;
const cache = new Map<string, { at: number; value: unknown }>();
let dbRetryAt = 0;

export function clearQueryCache(): void {
  cache.clear();
  dbRetryAt = 0;
}

async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value as T;
  const value = await load();
  if (value !== null) cache.set(key, { at: Date.now(), value });
  return value;
}

async function fromDbOrSnapshot<T>(
  fromDb: () => Promise<T>,
  fromSnapshot: (snapshot: Snapshot) => T,
): Promise<T> {
  if (Date.now() >= dbRetryAt) {
    try {
      return await fromDb();
    } catch (error) {
      dbRetryAt = Date.now() + DB_RETRY_DELAY_MS;
      console.warn(
        "[queries] database failed, using snapshot:",
        error instanceof Error ? error.message : error,
      );
    }
  }
  return fromSnapshot(await readSnapshot());
}

function groupBy<T, K>(rows: T[], key: (row: T) => K): Map<K, T[]> {
  const grouped = new Map<K, T[]>();
  for (const row of rows) {
    const value = key(row);
    const group = grouped.get(value);
    if (group) group.push(row);
    else grouped.set(value, [row]);
  }
  return grouped;
}

function tally(values: (string | null)[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values) {
    if (value !== null) counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

function toSource(row: typeof sources.$inferSelect): Source {
  return {
    id: row.id,
    title: row.title,
    publisher: row.publisher,
    author: row.author,
    kind: row.kind,
    url: row.url,
    archivedUrl: row.archivedUrl,
    publishedYear: row.publishedYear,
    accessedOn: row.accessedOn,
    note: row.note,
  };
}

function toPinSummary(
  row: typeof pins.$inferSelect,
  locations: (typeof pinLocations.$inferSelect)[],
): PinSummary {
  return {
    id: row.id,
    layer: row.layer,
    title: row.title,
    program: row.program,
    instruments: row.instruments,
    family: row.family,
    secondaryFamilies: row.secondaryFamilies,
    startDate: row.startDate,
    endDate: row.endDate,
    dateLabel: row.dateLabel,
    promise: row.promise,
    record: row.record,
    badge: row.badge,
    status: row.status,
    openQuestion: row.openQuestion,
    verifiedOn: row.verifiedOn,
    verificationNote: row.verificationNote,
    locations: locations.map((location) => ({
      id: location.id,
      name: location.name,
      municipality: location.municipality,
      province: location.province,
      lat: location.lat,
      lng: location.lng,
      precision: location.precision,
      isAnchor: location.isAnchor,
      sortOrder: location.sortOrder,
    })),
  };
}

async function loadPinsFromDb(): Promise<PinSummary[]> {
  const db = getDb();
  const [pinRows, locationRows] = await Promise.all([
    db.select().from(pins).orderBy(asc(pins.startDate), asc(pins.id)),
    db.select().from(pinLocations).orderBy(asc(pinLocations.sortOrder), asc(pinLocations.id)),
  ]);
  const locationsByPin = groupBy(locationRows, (location) => location.pinId);
  return pinRows.map((pin) =>
    toPinSummary(pin, locationsByPin.get(pin.id) ?? []),
  );
}

async function loadPinDetailFromDb(slug: string): Promise<PinDetail | null> {
  const db = getDb();
  const [pin] = await db.select().from(pins).where(eq(pins.id, slug)).limit(1);
  if (!pin) return null;

  const [locationRows, sourceRows, eventRows, linksToPast, linksToToday, videoRows] =
    await Promise.all([
      db
        .select()
        .from(pinLocations)
        .where(eq(pinLocations.pinId, slug))
        .orderBy(asc(pinLocations.sortOrder), asc(pinLocations.id)),
      db
        .select({
          source: sources,
          role: pinSources.role,
          citationNote: pinSources.citationNote,
        })
        .from(pinSources)
        .innerJoin(sources, eq(sources.id, pinSources.sourceId))
        .where(eq(pinSources.pinId, slug))
        .orderBy(asc(pinSources.role), asc(sources.title)),
      db
        .select()
        .from(pinEvents)
        .where(eq(pinEvents.pinId, slug))
        .orderBy(asc(pinEvents.eventDate), asc(pinEvents.sortOrder)),
      db
        .select({
          note: pinLinks.interpretationNote,
          id: pins.id,
          title: pins.title,
          layer: pins.layer,
          dateLabel: pins.dateLabel,
          family: pins.family,
        })
        .from(pinLinks)
        .innerJoin(pins, eq(pins.id, pinLinks.pastPinId))
        .where(eq(pinLinks.todayPinId, slug))
        .orderBy(asc(pins.startDate), asc(pins.id)),
      db
        .select({
          note: pinLinks.interpretationNote,
          id: pins.id,
          title: pins.title,
          layer: pins.layer,
          dateLabel: pins.dateLabel,
          family: pins.family,
        })
        .from(pinLinks)
        .innerJoin(pins, eq(pins.id, pinLinks.todayPinId))
        .where(eq(pinLinks.pastPinId, slug))
        .orderBy(asc(pins.startDate), asc(pins.id)),
      db
        .select()
        .from(videos)
        .where(eq(videos.pinId, slug))
        .orderBy(asc(videos.sortOrder), asc(videos.id)),
    ]);

  return {
    ...toPinSummary(pin, locationRows),
    sources: sourceRows.map((row) => ({
      ...toSource(row.source),
      role: row.role,
      citationNote: row.citationNote,
    })),
    events: eventRows.map((event) => ({
      id: event.id,
      eventDate: event.eventDate,
      precision: event.precision,
      description: event.description,
      sourceId: event.sourceId,
      sortOrder: event.sortOrder,
    })),
    links: [...linksToPast, ...linksToToday].map((link) => ({
      interpretationNote: link.note,
      linkedPin: {
        id: link.id,
        title: link.title,
        layer: link.layer,
        dateLabel: link.dateLabel,
        family: link.family,
      },
    })),
    videos: videoRows.map((video) => ({
      id: video.id,
      pinId: video.pinId,
      youtubeId: video.youtubeId,
      title: video.title,
      channel: video.channel,
      creditLine: video.creditLine,
      startSeconds: video.startSeconds,
      sortOrder: video.sortOrder,
      url: video.url,
      note: video.note,
    })),
  };
}

async function loadChartsFromDb(): Promise<Chart[]> {
  const db = getDb();
  const [chartRows, seriesRows, pointRows] = await Promise.all([
    db.select().from(charts).orderBy(asc(charts.sortOrder), asc(charts.id)),
    db.select().from(chartSeries).orderBy(asc(chartSeries.sortOrder), asc(chartSeries.id)),
    db
      .select({
        id: chartPoints.id,
        seriesId: chartPoints.seriesId,
        xLabel: chartPoints.xLabel,
        xDate: chartPoints.xDate,
        value: chartPoints.value,
        qualifier: chartPoints.qualifier,
        badge: chartPoints.badge,
        note: chartPoints.note,
        sortOrder: chartPoints.sortOrder,
        sourceId: sources.id,
        sourceTitle: sources.title,
        sourcePublisher: sources.publisher,
        sourceUrl: sources.url,
      })
      .from(chartPoints)
      .innerJoin(sources, eq(sources.id, chartPoints.sourceId))
      .orderBy(asc(chartPoints.sortOrder), asc(chartPoints.id)),
  ]);
  const pointsBySeries = groupBy(pointRows, (point) => point.seriesId);
  const seriesByChart = groupBy(seriesRows, (series) => series.chartId);

  return chartRows.map((chart) => ({
    id: chart.id,
    title: chart.title,
    description: chart.description,
    chartType: chart.chartType,
    xLabel: chart.xLabel,
    yLabel: chart.yLabel,
    unit: chart.unit,
    caveat: chart.caveat,
    sortOrder: chart.sortOrder,
    series: (seriesByChart.get(chart.id) ?? []).map((series) => ({
      id: series.id,
      name: series.name,
      kind: series.kind,
      sortOrder: series.sortOrder,
      points: (pointsBySeries.get(series.id) ?? []).map((point) => ({
        id: point.id,
        xLabel: point.xLabel,
        xDate: point.xDate,
        value: point.value,
        qualifier: point.qualifier,
        badge: point.badge,
        note: point.note,
        sortOrder: point.sortOrder,
        source: {
          id: point.sourceId,
          title: point.sourceTitle,
          publisher: point.sourcePublisher,
          url: point.sourceUrl,
        },
      })),
    })),
  }));
}

async function loadMethodsFromDb(): Promise<Methods> {
  const db = getDb();
  const [sourceRows, gapRows, pinRows] = await Promise.all([
    db.select().from(sources).orderBy(asc(sources.title)),
    db.select().from(researchGaps).orderBy(asc(researchGaps.sortOrder), asc(researchGaps.id)),
    db
      .select({
        id: pins.id,
        title: pins.title,
        layer: pins.layer,
        status: pins.status,
        badge: pins.badge,
        openQuestion: pins.openQuestion,
      })
      .from(pins)
      .orderBy(asc(pins.startDate), asc(pins.id)),
  ]);

  return {
    sourcesByKind: SOURCE_KINDS.map((kind) => ({
      kind,
      sources: sourceRows.filter((source) => source.kind === kind).map(toSource),
    })).filter((group) => group.sources.length > 0),
    gaps: gapRows.map((gap) => ({
      id: gap.id,
      kind: gap.kind,
      title: gap.title,
      description: gap.description,
      pinId: gap.pinId,
      status: gap.status,
      sortOrder: gap.sortOrder,
    })),
    leadPins: pinRows
      .filter((pin) => pin.status === "lead")
      .map((pin) => ({
        id: pin.id,
        title: pin.title,
        layer: pin.layer,
        openQuestion: pin.openQuestion,
      })),
    counts: {
      pins: pinRows.length,
      sources: sourceRows.length,
      byBadge: tally(pinRows.map((pin) => pin.badge)),
      byStatus: tally(pinRows.map((pin) => pin.status)),
    },
  };
}

export async function getPins(filters: PinFilters = {}): Promise<PinSummary[]> {
  const allPins = await cached("pins", () => fromDbOrSnapshot(loadPinsFromDb, (s) => s.pins));
  return visiblePins(allPins, filters);
}

export async function getPin(slug: string): Promise<PinDetail | null> {
  return cached(`pin:${slug}`, () =>
    fromDbOrSnapshot(
      () => loadPinDetailFromDb(slug),
      (snapshot) => (Object.hasOwn(snapshot.details, slug) ? snapshot.details[slug] : null),
    ),
  );
}

export async function getCharts(): Promise<Chart[]> {
  return cached("charts", () => fromDbOrSnapshot(loadChartsFromDb, (s) => s.charts));
}

export async function getMethods(): Promise<Methods> {
  return cached("methods", () => fromDbOrSnapshot(loadMethodsFromDb, (s) => s.methods));
}

export async function buildSnapshot(): Promise<Snapshot> {
  const pinList = await loadPinsFromDb();
  const details: Record<string, PinDetail> = {};
  for (const pin of pinList) {
    const detail = await loadPinDetailFromDb(pin.id);
    if (!detail) throw new Error(`Pin "${pin.id}" disappeared while exporting the snapshot`);
    details[pin.id] = detail;
  }
  return {
    generatedAt: new Date().toISOString(),
    pins: pinList,
    details,
    charts: await loadChartsFromDb(),
    methods: await loadMethodsFromDb(),
  };
}
