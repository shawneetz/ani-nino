# Anino ng Ani

Anino ng Ani ("Who Paid for the Harvest?") is a public, evidence-labeled map of
martial-law farm programs in CALABARZON, 1972 to 1986, with a "Today" layer
showing programs that echo them. All content is plain YAML in `content/`.
There is no database and no login.

## Run locally

Requirements: Node.js and pnpm.

    pnpm install
    pnpm dev

Open http://localhost:3000. No environment variables are needed.

## Content

- `content/programs/*.yaml`: one file per program. The filename must match the `slug`.
- `content/charts/*.yaml`: one file per chart. Every number needs a source link and access date.
- `content/gaps.yaml`: research gaps shown on the Sources page.

Key rules (checked by `pnpm content:check`, which also runs before every build):

- `status: checking` needs a `question`. `status: confirmed` needs `checkedOn` and a source with a URL.
- `era: today` programs use years 2000 to 2026 and may set `echoOf` to a martial-law program slug.
- Past/present links are labeled as interpretation on the page.

## How readers contribute

Each program page has three GitHub links: suggest a source, report a problem, or
edit the YAML file. Changes arrive as issues or pull requests and are merged by hand.

## Commands

    pnpm content:check   validate all content
    pnpm lint
    pnpm typecheck
    pnpm test            unit tests
    pnpm test:e2e        browser tests (Playwright)
    pnpm build

## Deployment

Deploy to Vercel. No secrets are required. The map needs an internet
connection to load OpenFreeMap tiles.
