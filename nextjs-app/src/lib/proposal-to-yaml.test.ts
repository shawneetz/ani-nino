// What this file does: checks that approved proposals become valid YAML.
import { parse } from "yaml";
import { describe, expect, it } from "vitest";
import { proposalPayloadSchema } from "./proposal-schema";
import { applyProposal, GAPS_PATH, programPath, ProposalApplyError } from "./proposal-to-yaml";

const SLUG = "laguna-operation-land-transfer";

const PROGRAM_YAML = `# What this file does: a test program.
slug: laguna-operation-land-transfer
title: Operation Land Transfer in Laguna
when: 1972 onward
topic: land
status: checking
startYear: 1972
endYear: null
places:
  - { name: Calamba, province: laguna, lat: 14.2117, lng: 121.1653, approximate: true }
promised: PD 27 declared tenant-farmers owners of the land they till.
happened: Tenants were meant to receive land. How many did is still being checked.
question: Find Laguna figures for tenants covered and titles awarded.
sources:
  - title: Presidential Decree No. 27
    publisher: Official Gazette
    voice: official
    backs: promise
`;

const GAPS_YAML = `- id: laguna-land-transfer-numbers
  kind: data_missing
  title: No Laguna figures
  description: Not found yet.
  program: laguna-operation-land-transfer
- id: cavite-not-covered
  kind: scope
  title: Cavite has no programs
  description: None yet.
`;

const source = {
  title: "DAR report",
  publisher: "DAR",
  voice: "official",
  url: "https://example.org/dar",
  accessed: "2020-01-01",
};

const files = { [programPath(SLUG)]: PROGRAM_YAML, [GAPS_PATH]: GAPS_YAML };

describe("applyProposal", () => {
  it("adds a source and keeps the rest of the file", () => {
    const payload = proposalPayloadSchema.parse({ type: "add_source", source });
    const [change] = applyProposal({ programSlug: SLUG, payload, files });
    const data = parse(change.content);
    expect(data.sources).toHaveLength(2);
    expect(data.sources[1].url).toBe("https://example.org/dar");
    expect(data.status).toBe("checking");
    expect(change.content).toContain("# What this file does");
    expect(change.content).toContain("{ name: Calamba");
  });

  it("adds a follow-up entry", () => {
    const payload = proposalPayloadSchema.parse({
      type: "add_since",
      year: 1990,
      text: "A later study counted the titles.",
      source,
    });
    const [change] = applyProposal({ programSlug: SLUG, payload, files });
    expect(parse(change.content).since[0].year).toBe(1990);
  });

  it("changes one text field", () => {
    const payload = proposalPayloadSchema.parse({
      type: "correction",
      field: "when",
      newText: "1972 to 1986",
      source,
    });
    const [change] = applyProposal({ programSlug: SLUG, payload, files });
    expect(parse(change.content).when).toBe("1972 to 1986");
  });

  it("changes the coordinates of an existing place", () => {
    const payload = proposalPayloadSchema.parse({
      type: "correction_place",
      placeName: "Calamba",
      lat: 14.2,
      lng: 121.15,
      approximate: false,
      source,
    });
    const [change] = applyProposal({ programSlug: SLUG, payload, files });
    const place = parse(change.content).places[0];
    expect(place.lat).toBe(14.2);
    expect(place.approximate).toBe(false);
  });

  it("refuses a place that does not exist", () => {
    const payload = proposalPayloadSchema.parse({
      type: "correction_place",
      placeName: "Nowhere",
      lat: 14.2,
      lng: 121.15,
      approximate: false,
      source,
    });
    expect(() => applyProposal({ programSlug: SLUG, payload, files })).toThrow(ProposalApplyError);
  });

  it("fills a gap: updates the program and removes the gap", () => {
    const payload = proposalPayloadSchema.parse({
      type: "fill_gap",
      gapId: "laguna-land-transfer-numbers",
      happenedText: "A DAR report lists the certificates issued.",
      source,
    });
    const changes = applyProposal({ programSlug: SLUG, payload, files });
    expect(changes).toHaveLength(2);
    expect(parse(changes[0].content).happened).toContain("A DAR report lists");
    expect(parse(changes[1].content).map((gap: { id: string }) => gap.id)).toEqual(["cavite-not-covered"]);
  });

  it("refuses a gap that belongs to no program or another program", () => {
    const payload = proposalPayloadSchema.parse({
      type: "fill_gap",
      gapId: "cavite-not-covered",
      happenedText: "Something.",
      source,
    });
    expect(() => applyProposal({ programSlug: SLUG, payload, files })).toThrow(ProposalApplyError);
  });

  it("creates a new program that is always still checking", () => {
    const payload = proposalPayloadSchema.parse({
      type: "new_program",
      program: {
        slug: "new-one",
        title: "A new program",
        when: "1975 onward",
        topic: "support",
        startYear: 1975,
        places: [{ name: "Calamba", province: "laguna", lat: 14.2, lng: 121.1, approximate: true }],
        happened: "Something happened.",
        question: "What else happened?",
        sources: [source],
      },
    });
    const [change] = applyProposal({ programSlug: "new-one", payload, files: {} });
    expect(change.path).toBe("content/programs/new-one.yaml");
    expect(parse(change.content).status).toBe("checking");
    expect(parse(change.content).checkedOn).toBeUndefined();
  });

  it("refuses a new program when the file already exists", () => {
    const payload = proposalPayloadSchema.parse({
      type: "new_program",
      program: {
        slug: SLUG,
        title: "Copy",
        when: "1975",
        topic: "land",
        startYear: 1975,
        places: [{ name: "Calamba", province: "laguna", lat: 14.2, lng: 121.1, approximate: true }],
        happened: "Something happened.",
        question: "What else?",
        sources: [source],
      },
    });
    expect(() => applyProposal({ programSlug: SLUG, payload, files })).toThrow(ProposalApplyError);
  });

  it("refuses to change a program file that does not exist", () => {
    const payload = proposalPayloadSchema.parse({ type: "add_source", source });
    expect(() => applyProposal({ programSlug: "missing", payload, files: {} })).toThrow(ProposalApplyError);
  });
});
