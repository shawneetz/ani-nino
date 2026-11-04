// What this file does: keeps every label, color and definition in one place.
// The legend, filters, detail panel and methods page all read from here,
// so the wording can never differ between screens.
import { PROVINCES, type BadgeKind, type Province, type SourceKind, type Status } from "./enums";
export { PROVINCES };
export type { Province };

// Vocabulary for the program explorer batch. These values are intentionally
// separate from the legacy pin vocabulary above until the content is added.
export const FIRST_YEAR = 1972;
export const LAST_YEAR = 1986;

export const TOPICS = {
  land: { label: "Land", color: "#b45309" },
  support: { label: "Support", color: "#1d4ed8" },
  groups: { label: "Groups", color: "#15803d" },
  markets: { label: "Markets", color: "#0d9488" },
  displacement: { label: "Displacement", color: "#be123c" },
} as const;
export const TOPIC_KEYS = Object.keys(TOPICS) as (keyof typeof TOPICS)[];
export type Topic = keyof typeof TOPICS;

export const VOICES = {
  official: { label: "Government", blurb: "Government documents or figures." },
  independent: { label: "Court/archive/study", blurb: "Independent records or research." },
  advocacy: { label: "Advocacy group", blurb: "Reporting by an advocacy group." },
  supporter: { label: "Program supporters", blurb: "Claims made by program supporters." },
} as const;
export type Voice = keyof typeof VOICES;

export const PROGRAM_STATUSES = {
  confirmed: "Confirmed",
  checking: "Still checking",
} as const;
export type ProgramStatus = keyof typeof PROGRAM_STATUSES;
export const PROVINCE_KEYS = ["cavite", "laguna", "batangas", "rizal", "quezon"] as const;

// The six program families. The key is stored in the database;
// the label and color are only for display.
export const FAMILIES = {
  land_reform: {
    label: "Land reform",
    color: "#b45309",
    description: "Land transfer, tenancy and land conversion.",
  },
  credit_production: {
    label: "Credit and production",
    color: "#1d4ed8",
    description: "Loans, research and the rice production package.",
  },
  organizing: {
    label: "Farmer organizing",
    color: "#15803d",
    description: "Cooperatives and farmer associations set up under the programs.",
  },
  export_tax_monopoly: {
    label: "Export taxes and monopolies",
    color: "#7c3aed",
    description: "Levies, monopolies and control over export crops and the lake.",
  },
  markets_prices: {
    label: "Markets and prices",
    color: "#0d9488",
    description: "Where farmers and fisherfolk sold, and at what price.",
  },
  displacement: {
    label: "Displacement",
    color: "#be123c",
    description: "People moved off land or water for other uses.",
  },
} as const;

export type Family = keyof typeof FAMILIES;

export const PROVINCE_LABELS: Record<Province, string> = {
  cavite: "Cavite",
  laguna: "Laguna",
  batangas: "Batangas",
  rizal: "Rizal",
  quezon: "Quezon",
};

// Short label shown on each pin.
export const BADGE_LABELS: Record<BadgeKind, string> = {
  official: "Official record",
  independent_record: "Independent record",
  advocacy_report: "Advocacy report",
  supporters_claim: "Supporters' claim",
};

// Longer definition shown in the legend and on the methods page.
export const BADGE_DEFINITIONS: Record<BadgeKind, string> = {
  official: "The government's own documents or figures.",
  independent_record:
    "Court decisions, archives or academic research not produced by a party to the claim.",
  advocacy_report: "Reporting by groups that advocate a position.",
  supporters_claim: "Claims made by those who ran or promoted the program.",
};

export const STATUS_LABELS: Record<Status, string> = {
  lead: "Lead",
  verified: "Verified",
};

export const SOURCE_KIND_LABELS: Record<SourceKind, string> = {
  law_or_decree: "Law or decree",
  court_decision: "Court decision",
  government_release: "Government release",
  period_publication: "Period publication",
  archive: "Archive",
  academic: "Academic",
  news: "News",
  advocacy_publication: "Advocacy publication",
  video: "Video",
};
