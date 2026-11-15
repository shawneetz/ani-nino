<!--
what this file does: the working todo list for anino ng ani (v9)
it is organized by branch, then by ideal commit, so each checkbox is one commit you can make
there is no fixed deadline, work in priority order and merge only when the gate passes
-->
# Anino ng Ani: Project Todo List (v9, v1 = no accounts, github contributions)

Updated Sun, Nov 15, 2026 (evening). Critical changes 1 to 8 are done on `main`. C1, C2 and C3 are written on `ux-revamp`.

## v1 scope decision (locked)

- **No user accounts, no sign-in, no Supabase, no database, no admin queue in v1.**
- Everything lives on the website: static pages built from YAML files in `content/`.
- **Contributions happen on GitHub only:** issue forms for sources and problems, pull requests for edits.
- The maintainer reviews and merges. CI runs `pnpm content:check` on every pull request.
- Accounts and in-site proposals are **deferred to v2** (see the last section).
- **No deadline.** The live site on `main` stays healthy at all times. Big changes go on a branch and merge only when their gate passes.

---

## Branch map

| Branch | Purpose | Status | Merges into |
|---|---|---|---|
| `main` | the live site (Vercel production) | healthy, 24 static pages, 21/21 unit tests, 6/6 e2e | n/a |
| `ux-revamp` | phase C: landing, bigger UI, new explorer, program page, other pages | C1 to C3 written, C4 to C5 open | `main`, only after the C8 gate |
| `content/*` (optional, short-lived) | content-only work: new programs, source checks, gaps | nothing open | `main` directly (content-only prs are low risk) |
| `v2/*` (not created) | accounts and in-site proposals | deferred | not part of v1 |

### Branch rules
- Never push breaking work to `main`. Every `ux-revamp` commit must still pass `pnpm lint && pnpm typecheck && pnpm test`.
- Content fixes found while on `ux-revamp` go to a `content/*` branch off `main`, then `ux-revamp` pulls `main` (rebase or merge) to get them.
- `ux-revamp` pulls `main` before the C8 gate so the merge is clean.
- One commit = one reviewable change. If a commit needs "and" in its message, split it.

---

## Branch: `main`

### Done (history, in order)
- [x] **M1** `chore: set real github owner and repo in site.ts`
  - `REPO_OWNER="shawneetz"`, `REPO_NAME="ani-nino"`
  - `isRepoConfigured()` simplified to `return true` (fixes TS2367)
- [x] **M2** `fix: correct nasugbu longitude`
  - `121.6319` to `120.6319` in `batangas-nasugbu-sugar-estates.yaml`
- [x] **M3** `chore: remove phase b code and config`
  - `src/types`, `src/actions`, `app/login`, `app/contribute`, `app/me`, `app/admin` removed
  - `.env` and `.env.example` wiped of supabase, turnstile and github-token vars, `.env.supabase` deleted
  - no grep hits for supabase, turnstile, login or admin in `src/` or `app/`
- [x] **M4** `feat: github-only contribution links and about page`
  - `contribute-links.tsx` and `/about` rewritten, no page implies sign-up or in-app proposals
- [x] **M5** `chore: add github contribution plumbing`
  - issue forms (`suggest-source.yml`, `report-problem.yml`, `config.yml`), `CONTRIBUTING.md`, pr template, `ci.yml`
  - form names match `src/lib/site.ts`
- [x] **M6** `content: resolve laguna-lake-fishpens audit`
  - fao, unu and agecon titles confirmed, pd 813 linked via the llda implemented-laws page
  - `pnpm content:audit` returns AUDIT OK
- [x] **M7** verification only, no commit: `content:check`, `lint`, `typecheck`, `test` (21/21), clean `pnpm build`, `pnpm test:e2e` (6/6)

### Open on `main`
- [ ] **manual, no commit:** delete the old supabase, turnstile and github-token env vars in the vercel dashboard
- [ ] **M8** `docs: update todo to v9 (per-branch, per-commit)` (this file)
- [ ] after the revamp merges: re-check `/`, `/map` and one program page on the live url

---

## Branch: `ux-revamp`

Goal: a first-time reader understands the site in 10 seconds, finds a program in 2 taps, and reads comfortably on a phone. No accounts anywhere.

### Setup
- [x] branch `ux-revamp` created and pushed
- [ ] confirm a vercel preview url builds from the branch
- [ ] confirm the c1 to c3 work below is committed in the shape listed (if it is squashed, leave it, just keep the checklist for the preview check)

### Stage 1: foundation (C1), written
- [x] **U1** `feat: bigger base type, tokens and shared ui components`
  - `globals.css`: root size 112.5% (18px), `@theme` tokens, `tap-target` utility (44px)
  - global `focus-visible` ring and reduced-motion rule
  - `Container`, `Section`, `Button`, `ButtonLink`, `Card`
  - chips, buttons, nav and footer links are 44px, no `text-xs` in chips, tags, voice chips or source lists
- [x] **U2** `feat: new header with phone menu and grouped footer`
  - larger wordmark, phone **Menu** button (escape and link click close it)
  - header colors from `neutral-*` to `stone-*`
  - footer grouped into explore, evidence and project, with github link
- [ ] preview check: menu works at 390px, amber focus ring on tab, nothing scrolls sideways

### Stage 2: landing page at `/` (C2), written
- [x] **U3** `feat: move explorer to /map and keep old links working`
  - explorer moved to `app/map/page.tsx`
  - `/` redirects to `/map?...` when `year`, `topic`, `province` or `today` is present
  - `legacyRedirect()` helper with unit test
- [x] **U4** `feat: landing hero, numbers strip and how-to-read section`
  - h1 is the project name at `clamp(2.5rem, 6vw, 4.5rem)`, subtitle, two buttons
  - numbers strip computed at build (`landing-stats.ts` with tests)
  - three cards (promised, record, who says so) with the real voice chips and both statuses
- [x] **U5** `feat: landing start-here, provinces, timeline, gaps and cta`
  - 3 featured programs (`FEATURED` in `site.ts`), province tiles with counts
  - cavite tile says "no program yet" and links to `/sources#gap-cavite-not-covered`
  - timeline strip, 3 gaps, closing call to action (github only, no sign-in language)
  - metadata and og image copy for `/`
  - landing ships no maplibre code

### Stage 3: explorer at `/map` (C3), written
- [x] **U6** `feat: group map pins by place`
  - `src/lib/group-places.ts` (4-decimal rounding, counts, ordering, no program lost) with unit tests
- [x] **U7** `feat: bigger pins, pinned maplibre and select-then-open preview`
  - 28px dot with 44px hit area, shape and fill rules kept
  - maplibre version pinned in `map-config.ts` with integrity hash, failure message kept
  - pin click opens a preview card (escape or map tap closes), no immediate `router.push`
  - `fitBounds` to visible pins (padding 60, max zoom 11), view kept on zero results
- [x] **U8** `feat: explorer layout, sticky filter bar, year control and phone sheet`
  - desktop: list panel left (about 440px), map fills the rest
  - sticky filter bar: topic and province chips, "show today's echoes" switch with hint, count with `aria-live`
  - phone: bottom **Map | List** toggle (default list), filter bottom sheet with active count, apply and clear
  - `YearSlider.tsx` rewritten: aligned ticks, "all years", previous and next year, note "year filters martial-law programs only"
- [x] **U9** `feat: link map and list, empty states, map key and richer cards`
  - `sel=<slug>` url state, card select flies to pins, pin select scrolls to card
  - cavite empty state with link to the gap, otherwise "no programs match" with clear filters
  - "map key" disclosure with real marker samples
  - cards: `text-lg` title, status tag on every card, voice chips, 2-line first sentence
  - focus moves into sheet and preview on open and returns on close
- [x] **U10** `test: update e2e for landing, map, redirect, phone and keyboard flows`
  - covers h1 and hero buttons, `/?topic=land` redirect, pin select and preview, list and map count agreement, cavite empty state, 390x844 layout, keyboard chips, no login or admin links
- [ ] preview check on the branch url, on a phone: items c1, c2 and c3 from the audit table below

### Stage 4: program page, evidence first (C4), open
- [x] helper already exists: `src/lib/first-sentence.ts` (used by landing and cards)
- [x] **U11** `feat: use first sentence for program page metadata`
  - description = first sentence of `happened`, trimmed to 160 characters
  - tests added in `program-description.test.ts` (160 trim already covered in `trim-text.test.ts`)
- [x] **U12** `feat: program header with copy-link button`
  - larger h1, years, topic, large status tag, "checked on" date
  - **copy link** button with a visible "copied" confirmation
- [x] **U13** `feat: promise vs record panels and readable text`
  - two panels side by side from 768px, stacked on phones
  - "who says so" chips and balance note in a strip right under them
  - larger type, `max-w-[68ch]`, stronger "still checking" box right after the record
  - do not change yaml wording
- [ ] **U14** `feat: what-came-after timeline with linked sources and labels`
  - year, text, linked source title, `VoiceChip` (fixes audit item p2)
- [ ] **U15** `feat: single-program mini-map`
  - reuse `PinMap` in single-program mode, lazy-loaded below the fold, places listed beside it
- [ ] **U16** `feat: on-this-page nav`
  - sticky right rail on desktop, compact jump select on phones
- [ ] **U17** `feat: related programs replace previous and next`
  - up to 3 (same province first, then same topic, plus existing echo links)
  - `src/lib/related.ts` with unit test
- [ ] **U18** `refactor: rebuild contribute panel with shared card and button`
  - github-only panel (three 44px buttons, "free github account, a maintainer reviews every change") placed in the page flow

### Stage 5: other pages (C5), open
- [ ] **U19** `feat: add /programs index and nav link`
  - searchable list (title, place), topic and province chips, sort by year or title, "see on map" link carrying filters
  - add `Programs` to `NAV_LINKS` and the footer explore group (closes the leftover from c1.6)
- [ ] **U20** `feat: redesign charts page`
  - jump links, normal-size tables (`chart-card.tsx` rewrite)
  - land transfer as one bar of 210,054 against two labeled target lines (914,914 and 393,778), one source per number
- [ ] **U21** `feat: sources page search, label filter and gap anchors`
  - sticky in-page nav, search box, filter by label, `id="gap-<id>"` on each gap
- [ ] **U22** `feat: about page narrative and where-to-start`
  - short narrative, then method, then how to contribute (already github-only), "where to start" box with featured stories
- [ ] **U23** `feat: add not-found page`
  - links to the map and the programs list
- [ ] **U24** `test: extend e2e for programs index, related programs and not-found`
- [~] check every github link from a program page opens the form with `program` pre-filled (if not, check the form field `id` is still `program`)

### Stage 6: optional polish, cut from the bottom if needed
- [ ] **U25** `feat: print styles for program pages`
- [ ] **U26** `feat: per-program og image`

### Stage 7: gate and merge
- [ ] **U27** verification only, no commit: `pnpm lint && pnpm typecheck && pnpm content:check && pnpm content:audit && pnpm test && pnpm build && pnpm test:e2e` all green
- [ ] `ux-revamp` pulls latest `main` and the check above passes again
- [ ] on the preview url, on a real phone: open `/`, reach a program in 2 taps, share a link, reopen it
- [ ] lighthouse on `/`, `/map` and one program page, scores recorded in the pr
- [ ] targets on a mid-range android: landing lcp under 2.5 s, `/map` usable in under 4 s
- [ ] old link `/?topic=land&province=laguna` lands on the right filtered map
- [ ] each github link from a program page opens the right issue form or edit page
- [ ] **gate:** if any item above fails, do not merge. Fix it on the branch first
- [ ] merge `ux-revamp` into `main` (squash or merge commit, your call), then re-check `/`, `/map` and one program page on the live url

---

## Branch: `content/*` (optional, only when needed)

Use a fresh branch off `main` per topic, for example `content/cavite-program`.

- [ ] **K1** `content: add first cavite program` (cavite has no program page yet, see `gaps.yaml`)
- [ ] **K2** `content: add laguna land-transfer figures` (find dar region iv records or the 1991 uplb thesis)
- [ ] **K3** `content: check coconut levy flow for quezon` (pca or coa records, then verify ra 11524)
- [ ] **K4** `content: resolve hacienda yulo coverage` (needs a dar or court record, not advocacy only)
- [ ] **K5** `content: check laguna coalition in the 2012 coco levy case`
- [ ] any new program must pass `pnpm content:check`, and may be marked `confirmed` only with `checkedOn` and a passing `pnpm content:audit`

---

## Audit of the old site and where each item gets fixed

| Item | Problem | Fixed by |
|---|---|---|
| L1 to L5 | no landing page, name only in a small link, statuses unexplained, no entry points, empty cavite filter | U3 to U5 |
| S1 to S3, S5 | tiny text, 32px chips, 22px pins, neutral colors | U1, U2, U7 |
| S4 | no line length or height on program text | U13 |
| S6 | dense one-line legend | U9 |
| E1 to E9 | stacked pins, instant navigation, unlinked map and list, no fit, phone layout, unclear today switch, year slider labels, hidden status, unpinned maplibre | U6 to U9 |
| P1 | chips before claim, stacked paragraphs | U13 |
| P2 | since-entries have no link or label | U14 |
| P3 | "where" is only a bullet list | U15 |
| P4 | previous and next mixes provinces, topics, eras | U17 |
| P5 | metadata description is the whole paragraph | U11 |
| P6 | no jump links, copy link or share image | U12, U16, U26 |
| P7 | small contribute links | U18 |
| O1 | charts repeat 210,054, small tables | U20 |
| O2 | sources page has no search or anchors | U21 |
| O3 | about page is a bullet list | U22 |
| O4 | nav needs a phone menu | U2 |
| B4 to B6 | stray css comment, empty folders, e2e h1 assertion | M3, U1, U10 |

---

## Priority order if scope needs trimming

Cut from the bottom. There is no deadline, so this is about focus.
1. U26 per-program og image
2. U25 print styles
3. paragraph splitting inside U13
4. timeline strip (already written in U5, keep if it works)
5. U19 `/programs` index (also leave out its nav link)
6. hover pulse for map and list link (already skipped)
7. U16 on-page nav

**Never cut:** M1 to M6, U3 redirect, U4 how-to-read, U6 grouped pins, U7 select-then-open, U8 phone toggle, U13 promise vs record, U14 labels on since-entries, U18 and M5 github contribution path, U1 size and tap-target rules.

---

## Deferred to v2 (not part of v1)

Do not build, ship or mention these as available in v1. No `v2/*` branch exists yet.

- supabase auth, sign-in and sign-up, email verification, turnstile
- `profiles`, `proposals`, `proposal_log` tables with rls
- `/login`, `/contribute/[slug]`, `/me`, `/admin/review`
- proposal schema, limits, proposal-to-yaml, approve-opens-a-github-pr flow, trusted contributors, contributor credit
- reuse note: the content schema, `content:check` and `content:audit` already make github pull requests safe, so v2 only has to turn a form into the same yaml change

---

## Final verification and launch (v1)
- [x] critical changes 1 to 8 done
- [ ] phase c gate passed (U27), or phase c not merged and `main` confirmed healthy
- [ ] `pnpm content:audit` passes: no unchecked program marked `confirmed`, every source shows its label
- [ ] every contribution link on the live site opens the right github page
- [ ] no account, sign-in or admin feature is reachable or mentioned
- [ ] phone and keyboard qa pass on the live url