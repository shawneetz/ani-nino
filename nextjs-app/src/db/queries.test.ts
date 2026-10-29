import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { snapshotSchema } from "../lib/api-schemas";
import { deleteFixtures, fixtureIds, insertFixtures, requireTestDbUrl } from "./test-fixtures";

const PREFIX = "test-query";
const ids = fixtureIds(PREFIX);
let queries: typeof import("./queries");

beforeAll(async () => {
  vi.stubEnv("DATABASE_URL", requireTestDbUrl());
  await insertFixtures(PREFIX);
  queries = await import("./queries");
});

afterAll(async () => {
  await deleteFixtures(PREFIX);
  const { closePool } = await import("./client");
  await closePool();
  vi.unstubAllEnvs();
});

beforeEach(() => queries.clearQueryCache());

describe("getPin", () => {
  it("returns locations, cited sources, events, and videos", async () => {
    const pin = await queries.getPin(ids.past);
    expect(pin?.locations.map((location) => location.province)).toEqual(["laguna", "quezon"]);
    expect(pin?.locations.filter((location) => location.isAnchor)).toHaveLength(1);
    expect(pin?.sources.map((source) => [source.id, source.role])).toEqual([
      [ids.promiseSource, "promise"],
      [ids.recordSource, "record"],
    ]);
    expect(pin?.sources[0].citationNote).toBe("Sec. 2");
    expect(pin?.events[0].eventDate).toBe("1973-10-03");
    expect(pin?.videos.map((video) => video.id)).toEqual([ids.video]);
  });

  it("returns linked pins in both directions and null for unknown pins", async () => {
    const past = await queries.getPin(ids.past);
    expect(past?.links[0].linkedPin).toMatchObject({ id: ids.today, layer: "today" });
    const today = await queries.getPin(ids.today);
    expect(today?.links[0]).toMatchObject({
      linkedPin: { id: ids.past, layer: "martial_law" },
      interpretationNote: "Fixture interpretation",
    });
    expect(await queries.getPin(`${PREFIX}-missing`)).toBeNull();
  });
});

describe("getPins", () => {
  it("filters date windows, secondary families, locations, and the Today layer", async () => {
    expect((await queries.getPins()).some((pin) => pin.id === ids.today)).toBe(false);
    expect((await queries.getPins({ today: true })).some((pin) => pin.id === ids.today)).toBe(true);

    const hasPin = async (month: string) =>
      (await queries.getPins({ month })).some((pin) => pin.id === ids.past);
    expect(await hasPin("1973-01")).toBe(true);
    expect(await hasPin("1975-12")).toBe(true);
    expect(await hasPin("1976-01")).toBe(false);
    expect(await hasPin("1972-12")).toBe(false);
    expect((await queries.getPins({ families: ["export_tax_monopoly"] })).some(
      (pin) => pin.id === ids.past,
    )).toBe(true);
    expect((await queries.getPins({ provinces: ["quezon"] })).some(
      (pin) => pin.id === ids.past,
    )).toBe(true);
  });
});

describe("chart and methods queries", () => {
  it("returns chart series and sourced, qualified points", async () => {
    const chart = (await queries.getCharts()).find((item) => item.id === ids.chart);
    expect(chart?.series.map((series) => [series.name, series.kind])).toEqual([
      ["Actual", "actual"],
      ["Goal", "target"],
    ]);
    expect(chart?.series[0].points[1]).toMatchObject({
      value: 210_054,
      qualifier: "at_most",
      badge: "government_record",
      source: { id: ids.promiseSource, title: "Fixture decree" },
    });
  });

  it("groups sources, reports gaps, leads, and counts", async () => {
    const methods = await queries.getMethods();
    expect(methods.sourcesByKind.map((group) => group.kind)).toEqual(
      expect.arrayContaining(["law_or_decree", "advocacy_publication"]),
    );
    expect(methods.gaps.some((gap) => gap.id === ids.gap)).toBe(true);
    expect(methods.leadPins.map((pin) => pin.id)).toEqual(
      expect.arrayContaining([ids.past, ids.today]),
    );
    expect(methods.counts.pins).toBeGreaterThanOrEqual(2);
    expect(methods.counts.byStatus.lead).toBeGreaterThanOrEqual(2);
  });
});

it("buildSnapshot returns data that satisfies the snapshot schema", async () => {
  const snapshot = snapshotSchema.parse(await queries.buildSnapshot());
  expect(Object.keys(snapshot.details)).toEqual(expect.arrayContaining([ids.past, ids.today]));
  expect(snapshot.pins.length).toBe(Object.keys(snapshot.details).length);
});
