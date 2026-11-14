// What this file does: keeps site-wide text, navigation and GitHub links together.
// GitHub is the ONLY way to contribute in v1, so every link here must point to a real repo.
export const SITE = {
  title: "Anino ng Ani",
  subtitle: "Sino ang Nagbayad sa Masaganang Ani?",
  tagline: "Who Paid for the Harvest?",
  description:
    "An evidence-labeled map of martial-law farm programs in CALABARZON, 1972 to 1986: what each promised, what the record shows, and who says so.",
} as const;

// TODO (Critical change 1): set these two values to the real GitHub account and repo name.
export const REPO_OWNER = "YOUR-NAME";
export const REPO_NAME = "anino-ng-ani";
export const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
const BRANCH = "main";

// True once the placeholder is replaced. Used by `pnpm content:check` to warn.
export function isRepoConfigured(): boolean {
  return REPO_OWNER !== "YOUR-NAME";
}

// File names of the issue forms in .github/ISSUE_TEMPLATE/. Keep them in sync.
const SOURCE_TEMPLATE = "suggest-source.yml";
const PROBLEM_TEMPLATE = "report-problem.yml";

export const NAV_LINKS = [
  { href: "/", label: "Map" },
  { href: "/charts", label: "Charts" },
  { href: "/sources", label: "Sources" },
  { href: "/about", label: "About" },
] as const;

export function editUrl(slug: string): string {
  return `${REPO_URL}/edit/${BRANCH}/content/programs/${slug}.yaml`;
}

// Opens a new issue from a form. The "program" field is pre-filled with the slug.
function formUrl(template: string, slug: string): string {
  return `${REPO_URL}/issues/new?template=${encodeURIComponent(template)}&program=${encodeURIComponent(slug)}`;
}

export function issueUrl(slug: string): string {
  return formUrl(PROBLEM_TEMPLATE, slug);
}

export function sourceIssueUrl(slug: string): string {
  return formUrl(SOURCE_TEMPLATE, slug);
}
