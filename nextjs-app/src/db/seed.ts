// What this file does: writes the validated seed data into Postgres.
// Everything happens in ONE transaction: wipe all content tables, insert
// everything, record a seed_runs row. Readers never see a half-seeded
// database, and a deleted or renamed pin can never leave orphans behind.
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import type { SeedBundle } from "../lib/seed-schemas";
import * as schema from "./schema";

export type SeedCounts = Record<string, number>;

export async function seedDatabase(
  bundle: SeedBundle,
  connectionString: string,
  gitSha: string | null,
): Promise<SeedCounts> {
  // One connection is enough for a one-off script.
  const pool = new Pool({ connectionString, max: 1 });
  const db = drizzle(pool, { schema });

  // Turn the nested seed data into flat rows, one list per table.
  const sourceRows = bundle.sources.map((s) => ({
    id: s.id,
    title: s.title,
    publisher: s.publisher,
    author: s.author ?? null,
    kind: s.kind,
    url: s.url ?? null,
    archivedUrl: s.archivedUrl ?? null,
    publishedYear: s.publishedYear ?? null,
    accessedOn: s.accessedOn ?? null,
    note: s.note ?? null,
  }));

  const pinRows = bundle.pins.map((p) => ({
    id: p.id,
    layer: p.layer,
    title: p.title,
    program: p.program ?? null,
    instruments: p.instruments,
    family: p.family,
    secondaryFamilies: p.secondaryFamilies,
    startDate: p.startDate,
    endDate: p.endDate ?? null,
    dateLabel: p.dateLabel,
    promise: p.promise ?? null,
    record: p.record ?? null,
    badge: p.badge ?? null,
    status: p.status,
    openQuestion: p.openQuestion ?? null,
    verifiedOn: p.verifiedOn ?? null,
    verificationNote: p.verificationNote ?? null,
  }));

  // sortOrder follows the order in the JSON file.
  const locationRows = bundle.pins.flatMap((p) =>
    p.locations.map((l, index) => ({
      pinId: p.id,
      name: l.name,
      municipality: l.municipality ?? null,
      province: l.province,
      lat: l.lat,
      lng: l.lng,
      precision: l.precision,
      isAnchor: l.isAnchor,
      sortOrder: index,
    })),
  );

  const pinSourceRows = bundle.pins.flatMap((p) =>
    p.sources.map((s) => ({
      pinId: p.id,
      sourceId: s.source,
      role: s.role,
      citationNote: s.citationNote ?? null,
    })),
  );

  const eventRows = bundle.pins.flatMap((p) =>
    p.events.map((e, index) => ({
      pinId: p.id,
      eventDate: e.eventDate,
      precision: e.precision,
      description: e.description,
      sourceId: e.source ?? null,
      sortOrder: index,
    })),
  );

  const linkRows = bundle.links.map((l) => ({
    todayPinId: l.today,
    pastPinId: l.past,
    interpretationNote: l.interpretationNote,
  }));

  const videoRows = bundle.videos.map((v, index) => ({
    id: v.id,
    pinId: v.pin,
    youtubeId: v.youtubeId,
    title: v.title,
    channel: v.channel,
    creditLine: v.creditLine,
    startSeconds: v.startSeconds ?? null,
    sortOrder: index,
    url: v.url ?? null,
    note: v.note ?? null,
  }));

  const gapRows = bundle.gaps.map((g, index) => ({
    id: g.id,
    kind: g.kind,
    title: g.title,
    description: g.description,
    pinId: g.pin ?? null,
    status: g.status,
    sortOrder: index,
  }));

  const chartRows = bundle.charts.map((c, index) => ({
    id: c.id,
    title: c.title,
    description: c.description ?? null,
    chartType: c.chartType,
    xLabel: c.xLabel ?? null,
    yLabel: c.yLabel ?? null,
    unit: c.unit ?? null,
    caveat: c.caveat ?? null,
    sortOrder: index,
  }));

  const seriesCount = bundle.charts.reduce((n, c) => n + c.series.length, 0);
  const pointCount = bundle.charts.reduce(
    (n, c) => n + c.series.reduce((m, s) => m + s.points.length, 0),
    0,
  );

  // What this run loaded. Compare these numbers with your data files at launch.
  const counts: SeedCounts = {
    sources: sourceRows.length,
    pins: pinRows.length,
    locations: locationRows.length,
    pinSources: pinSourceRows.length,
    events: eventRows.length,
    links: linkRows.length,
    videos: videoRows.length,
    gaps: gapRows.length,
    charts: chartRows.length,
    series: seriesCount,
    points: pointCount,
  };

  try {
    await db.transaction(async (tx) => {
      // Step 1: empty every content table. seed_runs is kept as history.
      await tx.execute(sql`
        TRUNCATE TABLE
          pin_links, pin_events, pin_sources, pin_locations, videos, research_gaps,
          chart_points, chart_series, charts, pins, sources
        RESTART IDENTITY CASCADE
      `);

      // Step 2: insert. Parents first. Drizzle rejects empty lists, so skip those.
      if (sourceRows.length) await tx.insert(schema.sources).values(sourceRows);
      if (pinRows.length) await tx.insert(schema.pins).values(pinRows);
      if (locationRows.length) await tx.insert(schema.pinLocations).values(locationRows);
      if (pinSourceRows.length) await tx.insert(schema.pinSources).values(pinSourceRows);
      if (eventRows.length) await tx.insert(schema.pinEvents).values(eventRows);
      if (linkRows.length) await tx.insert(schema.pinLinks).values(linkRows);
      if (videoRows.length) await tx.insert(schema.videos).values(videoRows);
      if (gapRows.length) await tx.insert(schema.researchGaps).values(gapRows);
      if (chartRows.length) await tx.insert(schema.charts).values(chartRows);

      // Charts need their series ids before points can be inserted.
      for (const chart of bundle.charts) {
        for (const [seriesIndex, series] of chart.series.entries()) {
          const [row] = await tx
            .insert(schema.chartSeries)
            .values({
              chartId: chart.id,
              name: series.name,
              kind: series.kind,
              sortOrder: seriesIndex,
            })
            .returning({ id: schema.chartSeries.id });
          const pointRows = series.points.map((point, pointIndex) => ({
            seriesId: row.id,
            xLabel: point.xLabel,
            xDate: point.xDate ?? null,
            value: point.value,
            qualifier: point.qualifier,
            badge: point.badge,
            note: point.note ?? null,
            sortOrder: pointIndex,
            sourceId: point.source,
          }));
          if (pointRows.length) await tx.insert(schema.chartPoints).values(pointRows);
        }
      }

      // Step 3: remember what was loaded.
      await tx.insert(schema.seedRuns).values({ gitSha, counts });
    });
  } finally {
    await pool.end();
  }

  return counts;
}
