// what this file does: keeps site-wide text, navigation and github links together
// github is the only way to contribute in v1, so every link here must point to a real repo
// "map" lives at /map (the landing page owns "/"), and "programs" lists every program
// featured and featured_gaps feed the landing page, plus two general github links
// change in this version (c3): added HOLDING_URL, the github folder of held topics
// change in this version (c5): added SITE_URL, moved here from layout.tsx so the
// program page can build the citation url on the server

/**
 * Site-wide text used by the header, metadata and the landing page.
 */
export const SITE = {
  title: "Anino ng Ani",
  subtitle: "Sino ang Nagbayad sa Masaganang Ani?",
  tagline: "Who Paid for the Harvest?",
  description:
    "An evidence-labeled map of martial-law farm programs in CALABARZON, 1972 to 1986: what each promised, what the record shows, and who says so.",
} as const;

/**
 * The public address of the site, with no trailing slash.
 *
 * @remarks
 * Read from a server-only env var, so a client component cannot see it.
 * Build any text that needs it (such as the citation) on the server and pass
 * the finished text down as a prop.
 */
export const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

/** GitHub account that owns the repository. */
export const REPO_OWNER = "shawneetz";
/** Name of the GitHub repository. */
export const REPO_NAME = "ani-nino";
/** Full address of the repository, the base of every contribution link. */
export const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
const BRANCH = "main";

/**
 * Tells whether the repository owner has been set.
 *
 * @remarks
 * Always `true` now that `REPO_OWNER` is a real account. It stays because
 * `pnpm content:check` still calls it.
 *
 * @returns `true`.
 */
export function isRepoConfigured(): boolean {
  return true;
}

// file names of the issue forms in .github/issue_template/. keep them in sync
const SOURCE_TEMPLATE = "suggest-source.yml";
const PROBLEM_TEMPLATE = "report-problem.yml";

/**
 * Main navigation links, in the order they appear in the header and on phones.
 *
 * @remarks
 * The footer's "Explore" group lists the same pages, keep them in step.
 */
export const NAV_LINKS = [
  { href: "/map", label: "Map" },
  { href: "/programs", label: "Programs" },
  { href: "/charts", label: "Charts" },
  { href: "/sources", label: "Sources" },
  { href: "/about", label: "About" },
] as const;

/**
 * Slugs of the three programs shown in the landing page "Start here" section.
 *
 * @remarks
 * Slugs must match files in `content/programs/`. A slug that does not exist
 * is skipped, so a typo never breaks the page.
 */
export const FEATURED = [
  "laguna-operation-land-transfer",
  "laguna-lake-fishpens",
  "quezon-coconut-levy",
] as const;

/**
 * Ids of the gaps shown in the landing page "What we do not know yet" section.
 *
 * @remarks
 * Ids must match entries in `content/gaps.yaml`.
 */
export const FEATURED_GAPS = [
  "laguna-land-transfer-numbers",
  "coconut-levy-flow",
  "hacienda-yulo-coverage",
] as const;

/** Opens GitHub's issue form chooser, not tied to one program. */
export const ISSUES_URL = `${REPO_URL}/issues/new/choose`;
/** Lists the program files on GitHub. */
export const CONTENT_URL = `${REPO_URL}/tree/${BRANCH}/content/programs`;
/** Lists the held topic files on GitHub, linked from the held topics section on /sources. */
export const HOLDING_URL = `${REPO_URL}/tree/${BRANCH}/content/holding`;

/**
 * Builds the GitHub link that edits one program file.
 *
 * @param slug - The program slug, which is also the yaml file name.
 * @returns The address of GitHub's file editor for that program.
 */
export function editUrl(slug: string): string {
  return `${REPO_URL}/edit/${BRANCH}/content/programs/${slug}.yaml`;
}

/**
 * Builds the link that opens a new issue from a form, with the program field filled in.
 *
 * @param template - File name of the issue form.
 * @param slug - The program slug to pre-fill.
 * @returns The address of the new issue page.
 */
function formUrl(template: string, slug: string): string {
  return `${REPO_URL}/issues/new?template=${encodeURIComponent(template)}&program=${encodeURIComponent(slug)}`;
}

/**
 * Builds the "report a problem" link for a program.
 *
 * @param slug - The program slug to pre-fill.
 * @returns The address of the problem form.
 */
export function issueUrl(slug: string): string {
  return formUrl(PROBLEM_TEMPLATE, slug);
}

/**
 * Builds the "suggest a source" link for a program.
 *
 * @param slug - The program slug to pre-fill.
 * @returns The address of the source form.
 */
export function sourceIssueUrl(slug: string): string {
  return formUrl(SOURCE_TEMPLATE, slug);
}