// What this file does: keeps every label, color and definition in one place.
// The filters, legend, program pages, map and sources page all read from here,
// so the wording can never differ between screens.

export const FIRST_YEAR = 1972;
export const LAST_YEAR = 1986;

// Window allowed for "today" programs (the echo layer).
export const TODAY_FIRST_YEAR = 2000;
export const TODAY_LAST_YEAR = 2026;

// Which layer a program belongs to. Default is the martial-law layer.
export const ERAS = {
  martial_law: { label: "Martial law" },
  today: { label: "Today" },
} as const;
export type Era = keyof typeof ERAS;
export const ERA_KEYS = Object.keys(ERAS) as [Era, ...Era[]];

export const TOPICS = {
  land: { label: "Land", color: "#b45309" },
  support: { label: "Support", color: "#1d4ed8" },
  groups: { label: "Groups", color: "#15803d" },
  markets: { label: "Markets", color: "#0d9488" },
  displacement: { label: "Displacement", color: "#be123c" },
} as const;
export type Topic = keyof typeof TOPICS;
export const TOPIC_KEYS = Object.keys(TOPICS) as [Topic, ...Topic[]];

export const VOICES = {
  official: { label: "Government", blurb: "Government documents or figures." },
  independent: { label: "Court/archive/study", blurb: "Independent records or research." },
  advocacy: { label: "Advocacy group", blurb: "Reporting by an advocacy group." },
  supporter: { label: "Program supporters", blurb: "Claims made by program supporters." },
} as const;
export type Voice = keyof typeof VOICES;
export const VOICE_KEYS = Object.keys(VOICES) as [Voice, ...Voice[]];

export const PROGRAM_STATUSES = {
  confirmed: "Confirmed",
  checking: "Still checking",
} as const;
export type ProgramStatus = keyof typeof PROGRAM_STATUSES;
export const PROGRAM_STATUS_KEYS = Object.keys(PROGRAM_STATUSES) as [
  ProgramStatus,
  ...ProgramStatus[],
];

export const PROVINCE_KEYS = ["cavite", "laguna", "batangas", "rizal", "quezon"] as const;
export type Province = (typeof PROVINCE_KEYS)[number];

export const PROVINCE_LABELS: Record<Province, string> = {
  cavite: "Cavite",
  laguna: "Laguna",
  batangas: "Batangas",
  rizal: "Rizal",
  quezon: "Quezon",
};

export const GAP_KINDS = {
  method: "Method",
  data_missing: "Data missing",
  unverified: "Unverified",
  scope: "Scope",
} as const;
export type GapKind = keyof typeof GAP_KINDS;
export const GAP_KIND_KEYS = Object.keys(GAP_KINDS) as [GapKind, ...GapKind[]];
