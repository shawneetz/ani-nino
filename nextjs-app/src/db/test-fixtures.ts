import { inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export function requireTestDbUrl(): string {
  const url = process.env.DATABASE_URL_MIGRATE;
  if (!url) throw new Error("DATABASE_URL_MIGRATE is required for database integration tests");
  return url;
}

export function fixtureIds(prefix: string) {
  return {
    past: `${prefix}-past`,
    today: `${prefix}-today`,
    promiseSource: `${prefix}-source-promise`,
    recordSource: `${prefix}-source-record`,
    video: `${prefix}-video`,
    gap: `${prefix}-gap`,
    chart: `${prefix}-chart`,
  };
}

export async function deleteFixtures(prefix: string): Promise<void> {
  const ids = fixtureIds(prefix);
  const pool = new Pool({ connectionString: requireTestDbUrl() });
  const db = drizzle(pool, { schema });
  try {
    await db.delete(schema.videos).where(inArray(schema.videos.id, [ids.video]));
    await db.delete(schema.researchGaps).where(inArray(schema.researchGaps.id, [ids.gap]));
    await db.delete(schema.charts).where(inArray(schema.charts.id, [ids.chart]));
    await db.delete(schema.pins).where(inArray(schema.pins.id, [ids.past, ids.today]));
    await db
      .delete(schema.sources)
      .where(inArray(schema.sources.id, [ids.promiseSource, ids.recordSource]));
  } finally {
    await pool.end();
  }
}

export async function insertFixtures(prefix: string) {
  await deleteFixtures(prefix);
  const ids = fixtureIds(prefix);
  const pool = new Pool({ connectionString: requireTestDbUrl() });
  const db = drizzle(pool, { schema });
  try {
    await db.insert(schema.sources).values([
      {
        id: ids.promiseSource,
        title: "Fixture decree",
        publisher: "Fixture Gazette",
        kind: "law_or_decree",
        publishedYear: 1972,
      },
      {
        id: ids.recordSource,
        title: "Fixture report",
        publisher: "Fixture Press",
        kind: "advocacy_publication",
        url: "https://example.org/report",
        accessedOn: "2026-10-01",
      },
    ]);

    await db.insert(schema.pins).values([
      {
        id: ids.past,
        layer: "martial_law",
        title: "Fixture past pin",
        family: "land_reform",
        secondaryFamilies: ["export_tax_monopoly"],
        startDate: "1973-01-01",
        endDate: "1975-12-01",
        dateLabel: "1973 to 1975",
        promise: "Fixture promise",
        record: "Fixture record",
        badge: "advocacy_report",
        status: "lead",
        openQuestion: "Fixture open question",
      },
      {
        id: ids.today,
        layer: "today",
        title: "Fixture today pin",
        family: "land_reform",
        startDate: "2021-01-01",
        dateLabel: "Jan 2021",
        status: "lead",
        openQuestion: "Fixture open question",
      },
    ]);

    await db.insert(schema.pinLocations).values([
      {
        pinId: ids.past,
        name: "Calamba",
        municipality: "Calamba",
        province: "laguna",
        lat: 14.2117,
        lng: 121.1653,
        isAnchor: true,
        sortOrder: 0,
      },
      {
        pinId: ids.past,
        name: "Sampaloc",
        municipality: "Sampaloc",
        province: "quezon",
        lat: 14,
        lng: 121.6,
        sortOrder: 1,
      },
      {
        pinId: ids.today,
        name: "Calamba",
        municipality: "Calamba",
        province: "laguna",
        lat: 14.2117,
        lng: 121.1653,
        isAnchor: true,
      },
    ]);

    await db.insert(schema.pinSources).values([
      { pinId: ids.past, sourceId: ids.promiseSource, role: "promise", citationNote: "Sec. 2" },
      { pinId: ids.past, sourceId: ids.recordSource, role: "record" },
      { pinId: ids.today, sourceId: ids.recordSource, role: "record" },
    ]);

    await db.insert(schema.pinEvents).values({
      pinId: ids.past,
      eventDate: "1973-10-03",
      precision: "day",
      description: "Threshold lowered",
      sourceId: ids.promiseSource,
    });

    await db.insert(schema.pinLinks).values({
      todayPinId: ids.today,
      pastPinId: ids.past,
      interpretationNote: "Fixture interpretation",
    });

    await db.insert(schema.videos).values({
      id: ids.video,
      pinId: ids.past,
      youtubeId: "dQw4w9WgXcQ",
      title: "Fixture video",
      channel: "Fixture channel",
      creditLine: "Fixture credit",
    });

    await db.insert(schema.researchGaps).values({
      id: ids.gap,
      kind: "method",
      title: "Fixture gap",
      description: "Fixture gap description",
    });

    await db.insert(schema.charts).values({
      id: ids.chart,
      title: "Fixture chart",
      chartType: "line",
      unit: "tenants",
    });
    const [actual, goal] = await db
      .insert(schema.chartSeries)
      .values([
        { chartId: ids.chart, name: "Actual", kind: "actual", sortOrder: 0 },
        { chartId: ids.chart, name: "Goal", kind: "target", sortOrder: 1 },
      ])
      .returning();
    await db.insert(schema.chartPoints).values([
      {
        seriesId: actual.id,
        xLabel: "Apr 1973",
        value: 12_000,
        badge: "government_record",
        sourceId: ids.promiseSource,
        sortOrder: 0,
      },
      {
        seriesId: actual.id,
        xLabel: "Jan 1976",
        value: 210_054,
        qualifier: "at_most",
        badge: "government_record",
        sourceId: ids.promiseSource,
        sortOrder: 1,
      },
      {
        seriesId: goal.id,
        xLabel: "Goal",
        value: 914_914,
        badge: "government_record",
        sourceId: ids.promiseSource,
        sortOrder: 0,
      },
    ]);
  } finally {
    await pool.end();
  }
  return ids;
}
