import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { PinDetail, Snapshot } from "../lib/api-schemas";

vi.mock("server-only", () => ({}));
vi.mock("./client", () => ({
  getDb: () => {
    throw new Error("database unavailable");
  },
}));

const pin: PinDetail = {
  id: "snapshot-pin",
  layer: "martial_law",
  title: "Snapshot pin",
  program: null,
  instruments: [],
  family: "land_reform",
  secondaryFamilies: [],
  startDate: "1973-01-01",
  endDate: null,
  dateLabel: "1973 onward",
  promise: null,
  record: null,
  badge: null,
  status: "lead",
  openQuestion: "Question to research",
  verifiedOn: null,
  verificationNote: null,
  locations: [
    {
      id: 1,
      name: "Calamba",
      municipality: "Calamba",
      province: "laguna",
      lat: 14.2,
      lng: 121.1,
      precision: "municipality",
      isAnchor: true,
      sortOrder: 0,
    },
  ],
  sources: [],
  events: [],
  links: [],
  videos: [],
};

const snapshot: Snapshot = {
  generatedAt: "2026-10-25T00:00:00.000Z",
  pins: [pin],
  details: { [pin.id]: pin },
  charts: [],
  methods: {
    sourcesByKind: [],
    gaps: [],
    leadPins: [
      { id: pin.id, title: pin.title, layer: pin.layer, openQuestion: pin.openQuestion },
    ],
    counts: { pins: 1, sources: 0, byBadge: {}, byStatus: { lead: 1 } },
  },
};

let directory = "";
let queries: typeof import("./queries");

beforeAll(async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), "anino-snapshot-"));
  const file = path.join(directory, "snapshot.json");
  await writeFile(file, JSON.stringify(snapshot), "utf8");
  vi.stubEnv("SNAPSHOT_PATH", file);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  queries = await import("./queries");
});

afterAll(async () => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  await rm(directory, { recursive: true, force: true });
});

describe("query snapshot fallback", () => {
  it("uses the snapshot for pin queries and preserves filtering", async () => {
    expect((await queries.getPins()).map((result) => result.id)).toEqual([pin.id]);
    expect(await queries.getPins({ provinces: ["cavite"] })).toEqual([]);
    expect((await queries.getPins({ month: "1980-01" })).map((result) => result.id)).toEqual([
      pin.id,
    ]);
  });

  it("returns snapshot detail and methods without a database", async () => {
    expect((await queries.getPin(pin.id))?.title).toBe(pin.title);
    expect(await queries.getPin("__proto__")).toBeNull();
    expect((await queries.getMethods()).counts.pins).toBe(1);
    expect(await queries.getCharts()).toEqual([]);
  });
});
