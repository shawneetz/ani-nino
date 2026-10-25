import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { SOURCE_KINDS, SOURCE_ROLES } from "../src/lib/enums";
import {
  pinDetailSchema,
  pinSummarySchema,
  snapshotSchema,
  sourceSchema,
  type PinDetail,
  type PinSummary,
  type Snapshot,
  type Source,
} from "../src/lib/api-schemas";

const DATA_DIR = "data";
const outputFile = process.argv[2] ?? path.join("snapshot", "snapshot.json");

interface RawLocation {
  name: string;
  municipality?: string | null;
  province: PinSummary["locations"][number]["province"];
  lat: number;
  lng: number;
  precision?: PinSummary["locations"][number]["precision"];
  isAnchor?: boolean;
}
interface RawPinSource {
  source: string;
  role: PinDetail["sources"][number]["role"];
  citationNote?: string | null;
}
interface RawEvent {
  eventDate: string;
  precision?: PinDetail["events"][number]["precision"];
  description: string;
  source?: string | null;
}
interface RawPin {
  id: string;
  layer: PinSummary["layer"];
  title: string;
  program?: string | null;
  instruments?: string[];
  family: PinSummary["family"];
  secondaryFamilies?: PinSummary["secondaryFamilies"];
  startDate: string;
  endDate?: string | null;
  dateLabel: string;
  promise?: string | null;
  record?: string | null;
  badge?: PinSummary["badge"];
  status: PinSummary["status"];
  openQuestion?: string | null;
  verifiedOn?: string | null;
  verificationNote?: string | null;
  locations: RawLocation[];
  sources: RawPinSource[];
  events?: RawEvent[];
}
interface RawLink {
  today: string;
  past: string;
  interpretationNote: string;
}

function asArray<T>(value: unknown, key: string, file: string): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const nested = (value as Record<string, unknown>)[key];
    if (Array.isArray(nested)) return nested as T[];
  }
  throw new Error(`${file} must contain an array or an object with a "${key}" array`);
}

async function readJson(file: string): Promise<unknown> {
  return JSON.parse(await readFile(path.join(DATA_DIR, file), "utf8"));
}

async function readOptionalJson(file: string): Promise<unknown> {
  try {
    return await readJson(file);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return [];
    throw error;
  }
}

function tally(values: Array<string | null>): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values) {
    if (value !== null) counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

async function build(): Promise<Snapshot> {
  const sourceInput = asArray<Partial<Source> & { id: string }>(
    await readJson("sources.json"),
    "sources",
    "data/sources.json",
  );
  const sources = sourceInput.map((source) =>
    sourceSchema.parse({
      id: source.id,
      title: source.title ?? "",
      publisher: source.publisher ?? "",
      author: source.author ?? null,
      kind: source.kind,
      url: source.url ?? null,
      archivedUrl: source.archivedUrl ?? null,
      publishedYear: source.publishedYear ?? null,
      accessedOn: source.accessedOn ?? null,
      note: source.note ?? null,
    }),
  );
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const pinDirectory = path.join(DATA_DIR, "pins");
  const files = (await readdir(pinDirectory)).filter((file) => file.endsWith(".json")).sort();
  const rawPins: RawPin[] = [];
  for (const file of files) {
    rawPins.push(...asArray<RawPin>(await readJson(path.join("pins", file)), "pins", `data/pins/${file}`));
  }
  rawPins.sort((a, b) => a.startDate.localeCompare(b.startDate) || a.id.localeCompare(b.id));

  let locationId = 0;
  let eventId = 0;
  const details: Record<string, PinDetail> = {};
  const pins = rawPins.map((rawPin) => {
    const summary = pinSummarySchema.parse({
      id: rawPin.id,
      layer: rawPin.layer,
      title: rawPin.title,
      program: rawPin.program ?? null,
      instruments: rawPin.instruments ?? [],
      family: rawPin.family,
      secondaryFamilies: rawPin.secondaryFamilies ?? [],
      startDate: rawPin.startDate,
      endDate: rawPin.endDate ?? null,
      dateLabel: rawPin.dateLabel,
      promise: rawPin.promise ?? null,
      record: rawPin.record ?? null,
      badge: rawPin.badge ?? null,
      status: rawPin.status,
      openQuestion: rawPin.openQuestion ?? null,
      verifiedOn: rawPin.verifiedOn ?? null,
      verificationNote: rawPin.verificationNote ?? null,
      locations: rawPin.locations.map((location, index) => ({
        id: ++locationId,
        name: location.name,
        municipality: location.municipality ?? null,
        province: location.province,
        lat: location.lat,
        lng: location.lng,
        precision: location.precision ?? "municipality",
        isAnchor: location.isAnchor ?? false,
        sortOrder: index,
      })),
    });
    const pinSources = rawPin.sources
      .map((rawSource) => {
        const source = sourceById.get(rawSource.source);
        if (!source) throw new Error(`Pin "${rawPin.id}" cites unknown source "${rawSource.source}"`);
        return {
          ...source,
          role: rawSource.role,
          citationNote: rawSource.citationNote ?? null,
        };
      })
      .sort(
        (a, b) =>
          SOURCE_ROLES.indexOf(a.role) - SOURCE_ROLES.indexOf(b.role) ||
          a.title.localeCompare(b.title),
      );

    details[summary.id] = pinDetailSchema.parse({
      ...summary,
      sources: pinSources,
      events: (rawPin.events ?? []).map((event, index) => ({
        id: ++eventId,
        eventDate: event.eventDate,
        precision: event.precision ?? "month",
        description: event.description,
        sourceId: event.source ?? null,
        sortOrder: index,
      })),
      links: [],
      videos: [],
    });
    return summary;
  });

  const rawLinks = asArray<RawLink>(
    await readOptionalJson("links.json"),
    "links",
    "data/links.json",
  );
  for (const link of rawLinks) {
    const today = details[link.today];
    const past = details[link.past];
    if (!today || !past) throw new Error(`Unknown pin in link "${link.today}" -> "${link.past}"`);
    const brief = (pin: PinDetail) => ({
      id: pin.id,
      title: pin.title,
      layer: pin.layer,
      dateLabel: pin.dateLabel,
      family: pin.family,
    });
    today.links.push({ interpretationNote: link.interpretationNote, linkedPin: brief(past) });
    past.links.push({ interpretationNote: link.interpretationNote, linkedPin: brief(today) });
  }

  const snapshot = {
    generatedAt: new Date().toISOString(),
    pins,
    details,
    charts: [],
    methods: {
      sourcesByKind: SOURCE_KINDS.map((kind) => ({
        kind,
        sources: sources.filter((source) => source.kind === kind).sort((a, b) => a.title.localeCompare(b.title)),
      })).filter((group) => group.sources.length > 0),
      gaps: [],
      leadPins: pins
        .filter((pin) => pin.status === "lead")
        .map((pin) => ({
          id: pin.id,
          title: pin.title,
          layer: pin.layer,
          openQuestion: pin.openQuestion,
        })),
      counts: {
        pins: pins.length,
        sources: sources.length,
        byBadge: tally(pins.map((pin) => pin.badge)),
        byStatus: tally(pins.map((pin) => pin.status)),
      },
    },
  };
  return snapshotSchema.parse(snapshot);
}

async function main() {
  const snapshot = await build();
  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(
    `Snapshot written to ${outputFile}: ${snapshot.pins.length} pins, ${snapshot.methods.counts.sources} sources`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
