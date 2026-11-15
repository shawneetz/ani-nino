// What this file does: keeps site-wide text, navigation and GitHub links together.
// GitHub is the ONLY way to contribute in v1, so every link here must point to a real repo.
export const SITE = {
  title: "Anino ng Ani",
  subtitle: "Sino ang Nagbayad sa Masaganang Ani?",
  tagline: "Who Paid for the Harvest?",
  description:
    "An evidence-labeled map of martial-law farm programs in CALABARZON, 1972 to 1986: what each promised, what the record shows, and who says so.",
} as const;

export const REPO_OWNER = "shawneetz";
export const REPO_NAME = "ani-nino";
export const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
const BRANCH = "main";

// Always true: REPO_OWNER is now set to the real account.
// Kept for backward compat with pnpm content:check which calls this.
export function isRepoConfigured(): boolean {
  return true;
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
