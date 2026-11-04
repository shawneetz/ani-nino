// What this file does: checks rules that compare data across files.
// Examples: every pin has a source, exactly one anchor marker, every slug
// exists, a verified pin has a "record" source, links join the right layers.
// It is a pure function: data in, list of readable problems out.
import type { SeedBundle } from "./seed-schemas";

export interface ValidationResult {
  errors: string[]; // block the seed and fail CI
  warnings: string[]; // shown, but do not block
}

const MARTIAL_LAW_START = "1972-09-01";
const MARTIAL_LAW_END = "1986-02-01";
const TODAY_START = "1986-03-01";

// Dates are already checked as YYYY-MM-DD, so the day is characters 8 to 10.
const isFirstOfMonth = (date: string) => date.slice(8, 10) === "01";

export function validateSeed(bundle: SeedBundle): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fail = (scope: string, message: string) => {
    errors.push(`${scope}: ${message}`);
  };

  // 1) Ids must be unique inside each kind.
  const checkUnique = (kind: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) fail(`${kind} "${id}"`, "duplicate id");
      seen.add(id);
    }
  };
  checkUnique("source", bundle.sources.map((s) => s.id));
  checkUnique("pin", bundle.pins.map((p) => p.id));
  checkUnique("chart", bundle.charts.map((c) => c.id));
  checkUnique("video", bundle.videos.map((v) => v.id));
  checkUnique("gap", bundle.gaps.map((g) => g.id));

  const sourceIds = new Set(bundle.sources.map((s) => s.id));
  const pinById = new Map(bundle.pins.map((p) => [p.id, p]));
  const usedSources = new Set<string>(); // to warn about unused sources

  // 2) Sources: a link must say when you opened it.
  for (const source of bundle.sources) {
    if ((source.url || source.archivedUrl) && !source.accessedOn) {
      fail(`source "${source.id}"`, "a url needs accessedOn");
    }
  }

  // 3) Pins.
  for (const pin of bundle.pins) {
    const scope = `pin "${pin.id}"`;

    // Dates: first of month, end after start, layer windows.
    if (!isFirstOfMonth(pin.startDate)) fail(scope, "startDate must be the first day of a month");
    if (pin.endDate) {
      if (!isFirstOfMonth(pin.endDate)) fail(scope, "endDate must be the first day of a month");
      if (pin.endDate < pin.startDate) fail(scope, "endDate is before startDate");
    }
    if (
      pin.layer === "martial_law" &&
      (pin.startDate < MARTIAL_LAW_START || pin.startDate > MARTIAL_LAW_END)
    ) {
      fail(scope, `martial-law pins must start between ${MARTIAL_LAW_START} and ${MARTIAL_LAW_END}`);
    }
    if (pin.layer === "today" && pin.startDate < TODAY_START) {
      fail(scope, `today pins must start on or after ${TODAY_START}`);
    }

    // Families.
    if (pin.secondaryFamilies.includes(pin.family)) {
      fail(scope, "primary family is repeated in secondaryFamilies");
    }
    if (new Set(pin.secondaryFamilies).size !== pin.secondaryFamilies.length) {
      fail(scope, "secondaryFamilies has duplicates");
    }

    // Evidence: a record claim always carries a badge.
    if (pin.record && !pin.badge) fail(scope, "a record needs a badge");

    // Status rules.
    if (pin.status === "lead" && !pin.openQuestion?.trim()) {
      fail(scope, "lead pins need an openQuestion");
    }
    if (pin.status === "verified") {
      if (!pin.verifiedOn || !pin.record || !pin.badge) {
        fail(scope, "verified pins need verifiedOn, record and badge");
      }
      if (!pin.sources.some((s) => s.role === "record")) {
        fail(scope, 'verified pins need a source with role "record"');
      }
    }

    // Sources: at least one, all exist, no repeated (source, role) pair.
    if (pin.sources.length === 0) fail(scope, "needs at least one source");
    const pairs = new Set<string>();
    for (const cite of pin.sources) {
      usedSources.add(cite.source);
      if (!sourceIds.has(cite.source)) fail(scope, `cites unknown source "${cite.source}"`);
      const pair = `${cite.source}|${cite.role}`;
      if (pairs.has(pair)) fail(scope, `cites "${cite.source}" twice with role "${cite.role}"`);
      pairs.add(pair);
    }

    // Locations: at least one marker, exactly one anchor.
    if (pin.locations.length === 0) fail(scope, "needs at least one location");
    const anchors = pin.locations.filter((l) => l.isAnchor).length;
    if (anchors !== 1) fail(scope, `needs exactly one anchor location (found ${anchors})`);

    // Events may cite a source.
    for (const event of pin.events) {
      if (event.source) {
        usedSources.add(event.source);
        if (!sourceIds.has(event.source)) {
          fail(scope, `event cites unknown source "${event.source}"`);
        }
      }
    }
  }

  // 4) Links: today side must be a Today pin, past side a martial-law pin.
  const linkPairs = new Set<string>();
  for (const link of bundle.links) {
    const scope = `link "${link.today}" -> "${link.past}"`;
    const today = pinById.get(link.today);
    const past = pinById.get(link.past);
    if (!today) fail(scope, `unknown pin "${link.today}"`);
    else if (today.layer !== "today") fail(scope, "today side must be a today pin");
    if (!past) fail(scope, `unknown pin "${link.past}"`);
    else if (past.layer !== "martial_law") fail(scope, "past side must be a martial-law pin");
    const pair = `${link.today}|${link.past}`;
    if (linkPairs.has(pair)) fail(scope, "duplicate link");
    linkPairs.add(pair);
  }

  // 5) Charts: unique series names, at least one point, every point has a real source.
  for (const chart of bundle.charts) {
    const scope = `chart "${chart.id}"`;
    if (chart.series.length === 0) fail(scope, "needs at least one series");
    const names = new Set<string>();
    for (const series of chart.series) {
      if (names.has(series.name)) fail(scope, `duplicate series name "${series.name}"`);
      names.add(series.name);
      if (series.points.length === 0) fail(scope, `series "${series.name}" has no points`);
      for (const point of series.points) {
        usedSources.add(point.source);
        if (!sourceIds.has(point.source)) {
          fail(scope, `point "${point.xLabel}" cites unknown source "${point.source}"`);
        }
      }
    }
  }

  // 6) Videos and gaps must point at real pins.
  for (const video of bundle.videos) {
    if (!pinById.has(video.pin)) fail(`video "${video.id}"`, `unknown pin "${video.pin}"`);
  }
  for (const gap of bundle.gaps) {
    if (gap.pin && !pinById.has(gap.pin)) fail(`gap "${gap.id}"`, `unknown pin "${gap.pin}"`);
  }

  // 7) Warning only: sources nobody cites will still show on the methods page.
  for (const source of bundle.sources) {
    if (!usedSources.has(source.id)) {
      warnings.push(`source "${source.id}": not cited by any pin, event or chart point`);
    }
  }

  return { errors, warnings };
}
