# Anino ng Ani: Project Todo List

Updated from the v5 plan (revamp first, accounts second). Priority A is the launch-critical
reader experience; Priority B starts only after the Nov 10 core gate passes.

## Phase A: Core Revamp (Priority A)
*Goal: ship the static Git/YAML reader experience by Nov 10.*

### A1. Reset and cleanup
- [ ] Tag the current state as `v3-supabase` and move to the `simplify` branch.
- [x] Remove the retired database layer:
  - [x] `src/db/`, `drizzle/`, `drizzle.config.ts`, `db/`
  - [x] database scripts, `snapshot/`, `app/api/`, DB tests
  - [x] Docker and Coolify files (none were present)
- [x] Remove obsolete pin/API helpers and hooks:
  - [x] `api-schemas.ts`, `api-response.ts`, `snapshot.ts`, `seed-*`
  - [x] `pin-query.ts`, `load-pins.ts`, `enums.ts`, `visible-for-ui.ts`
  - [x] `map-types.ts`, `slider.ts`, and old pin hooks
- [x] Remove `drizzle-orm`, `drizzle-kit`, `pg`, `@types/pg`, and `dotenv`.
- [ ] Keep Supabase for Priority B only; do not remove the project.
- [x] Clean `package.json` scripts and simplify `next.config.ts`.
- [x] Add the MapLibre dependency.

### A2. Content layer
- [x] Keep `src/lib/vocab.ts` and finalize the vocabulary.
- [x] Keep `src/lib/content-schema.ts` and finalize the Zod schema.
- [x] Keep `src/lib/load-content.ts`.
- [x] Add `src/lib/content.ts` with memoized server-side getters.
- [x] Add `src/lib/filter.ts` with the shared `visiblePrograms` function.
- [x] Add `src/lib/site.ts` with the site title, tagline, metadata text, and repository links.
- [x] Add `src/lib/explorer-types.ts` for the slim browser payload.
- [x] Add `src/lib/source-summary.ts` for source-balance notices.
- [x] Add the Laguna Hacienda Yulo example YAML.
- [x] Add the remaining 6 Laguna program YAML files.
- [x] Add 5 starter programs for Rizal, Batangas, and Quezon.
- [x] Add `content/charts/` with three empty, sourced-data-ready chart files.
- [x] Add `content/gaps.yaml` with the initial gap list.
- [ ] Verify all sources and coordinates; only mark a program `confirmed` with `checkedOn`.

### A3. Validation, tests, and CI
- [x] Add `scripts/check-content.ts`.
- [ ] Add schema tests for status rules, years, URLs, coordinates, filenames, and gap references (deferred; no tests yet).
- [ ] Add `src/lib/filter.test.ts` for year, topic, province, open-ended, and URL-filter behavior (deferred; no tests yet).
- [x] Add `content:check` to `package.json`.
- [x] Update CI to run lint, typecheck, `content:check`, tests, and build.
- [ ] Remove obsolete deployment steps.
- [x] Add the contribution pull request template.

### A4. Reader frontend
- [x] Update the shell, metadata, Open Graph image, navigation, and footer.
- [x] Add `src/hooks/use-filter-state.ts` for `?year=&topic=&province=` URL state.
- [x] Add `YearSlider`.
- [x] Add topic and province filter controls.
- [x] Add status tags, voice chips, and the map legend.
- [x] Add `ProgramCard`.
- [x] Add the MapLibre/OpenFreeMap `PinMap`.
- [x] Add the combined `Explorer` map/list view.
- [x] Update the home page.
- [x] Add the dynamic `/programs/[slug]` page with static params, metadata, sections, sources, navigation, edit/report links, and video support.
- [x] Add `/charts` with three sourced Recharts charts.
- [x] Add `/sources` with source-label guidance, all sources, gaps, and open questions.
- [x] Add `/about` with the method and contribution guidance.
- [x] Add the program-page contribution button fallback links.

### A5. Core gate and QA
- [x] Run `pnpm content:check` (passes; three empty chart warnings are expected).
- [ ] Run the production build and deploy the core.
- [ ] Verify a shared program link works on a phone.
- [ ] Complete the reader flow test: open, filter, map/list, program page, and sources.
- [ ] Pass keyboard navigation and mobile checks.
- [ ] Run Lighthouse on `/`.

## Phase B: Accounts and approved contributions (Priority B)
*Start only after the Priority A core gate passes on Nov 10. Cut this phase if the core is late.*

### B1. Supabase and environment
- [ ] Enable Supabase email sign-in with verification; disable other providers.
- [ ] Create `profiles`, `proposals`, and `proposal_log`.
- [ ] Add Row Level Security and the sign-up profile trigger.
- [ ] Set the admin account role by hand.
- [ ] Add server-only Vercel variables for Supabase, GitHub, and Turnstile.
- [ ] Create a fine-grained GitHub token limited to this repository's contents and pull requests.

### B2. Proposal validation and server logic
- [ ] Add `src/lib/proposal-schema.ts` using the content schema's source rules.
- [ ] Add `src/lib/limits.ts` for role limits, caps, duplicate URLs, bans, and field lengths.
- [ ] Add `src/lib/proposal-to-yaml.ts` and re-validate approved YAML.
- [ ] Add server actions for submit, edit/resubmit, withdraw, approve, request changes, reject, ban, and promote.
- [ ] Add `src/lib/github.ts` to create a branch, commit the YAML change, and open a PR.
- [ ] Start with the minimum viable proposal type: Add a source.
- [ ] Add follow-up, correction, gap, and trusted-contributor new-program proposals if time remains.
- [ ] Test limits, authorization, invalid proposals, contributor restrictions, and valid PR output.

### B3. Contributor pages
- [ ] Add `/login` with sign-in, sign-up, verification notice, and Turnstile.
- [ ] Add `/contribute/[slug]` with proposal type selection and live pending limits.
- [ ] Add `/me` with submission states, review notes, display name, and credit opt-in.
- [ ] Add the signed-in flow from a program page to contribution.

### B4. Admin review and publishing
- [ ] Add `/admin/review` with queue, before/after diff, source labels, and review actions.
- [ ] Enforce server-side admin checks for every review action.
- [ ] Verify approve -> GitHub PR -> CI -> manual merge -> rebuild.
- [ ] Show contributor credit only when the contributor opted in.

## Final verification and launch
- [ ] Run Priority A content checks and Priority B abuse tests.
- [ ] Verify no unchecked program is marked `confirmed`.
- [ ] Verify submission caps, pending caps, duplicate checks, ban behavior, and Turnstile.
- [ ] Pass phone and keyboard QA.
- [ ] Submit the final URL by Nov 14; keep Nov 15 as the buffer.
