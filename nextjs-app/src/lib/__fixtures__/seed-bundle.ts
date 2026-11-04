// What this file does: a small, VALID example of everything in data/.
// Tests start from this and break one thing at a time.
// A function (not a constant) so each test gets its own copy to change.
import type { SeedBundle } from "../seed-schemas";

export function sampleBundle(): SeedBundle {
  return {
    sources: [
      { id: "pd-27", title: "Presidential Decree No. 27", publisher: "Official Gazette", kind: "law_or_decree" },
      { id: "fixture-report", title: "Fixture report", publisher: "Fixture Press", kind: "advocacy_publication" },
    ],
    pins: [
      {
        id: "fixture-past",
        layer: "martial_law",
        title: "Fixture past pin",
        instruments: [],
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
        locations: [
          { name: "Calamba", municipality: "Calamba", province: "laguna", lat: 14.2117, lng: 121.1653, precision: "municipality", isAnchor: true },
        ],
        sources: [
          { source: "pd-27", role: "promise" },
          { source: "fixture-report", role: "record" },
        ],
        events: [
          { eventDate: "1973-10-03", precision: "day", description: "Threshold lowered", source: "pd-27" },
        ],
      },
      {
        id: "fixture-today",
        layer: "today",
        title: "Fixture today pin",
        instruments: [],
        family: "land_reform",
        secondaryFamilies: [],
        startDate: "2021-01-01",
        dateLabel: "Jan 2021",
        record: "Fixture record",
        badge: "advocacy_report",
        status: "lead",
        openQuestion: "Fixture open question",
        locations: [
          { name: "Calamba", municipality: "Calamba", province: "laguna", lat: 14.2117, lng: 121.1653, precision: "municipality", isAnchor: true },
        ],
        sources: [{ source: "fixture-report", role: "record" }],
        events: [],
      },
    ],
    links: [
      { today: "fixture-today", past: "fixture-past", interpretationNote: "Fixture interpretation" },
    ],
    charts: [
      {
        id: "fixture-chart",
        title: "Fixture chart",
        chartType: "line",
        series: [
          {
            name: "Actual",
            kind: "actual",
            points: [{ xLabel: "Apr 1973", value: 12000, qualifier: "exact", badge: "official", source: "pd-27" }],
          },
          {
            name: "Goal",
            kind: "target",
            points: [{ xLabel: "Goal", value: 914914, qualifier: "exact", badge: "official", source: "pd-27" }],
          },
        ],
      },
    ],
    videos: [
      {
        id: "fixture-video",
        pin: "fixture-past",
        youtubeId: "dQw4w9WgXcQ",
        title: "Fixture video",
        channel: "Fixture channel",
        creditLine: "Fixture credit",
      },
    ],
    gaps: [
      { id: "fixture-gap", kind: "method", title: "Fixture gap", description: "Fixture description", status: "open" },
    ],
  };
}
