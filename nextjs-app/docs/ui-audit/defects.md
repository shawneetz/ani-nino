<!--
what this file does: the u0 ui audit, one line per defect
status of each suspect: "confirmed by code" means the code shows it, "needs screenshot" means it can only be judged by eye
screenshots are taken with e2e/ui-audit.spec.ts and saved next to this file
severity: P1 breaks reading or looks broken, P2 looks unfinished, P3 polish
the audit runs twice, now (u0) and after the refinement (u10), the refinement is done when no P1 or P2 is open
-->
# UI audit, round 1 (u0)

Take the screenshots first: `UI_AUDIT=1 pnpm exec playwright test e2e/ui-audit.spec.ts`

Suspects 4 to 7 are not confirmed or dropped yet. Look at the images, fill in the status and severity, then sort this list by severity.

| # | route | width | what looks wrong | status | severity | fixed in |
|---|---|---|---|---|---|---|
| 1 | program page | all | boxed cards remain: `RelatedPrograms` (rounded white box), `CiteBlock` and `ContributeLinks` (both use `Card`) | confirmed by code | P2 | U2 |
| 2 | program page | all | `CopyLinkButton` has its own emerald and rose colors and `rounded-lg`, `JumpSelect` and `PageRail` use older `rounded-lg` and stone-200 styles | confirmed by code | P2 | U2 |
| 3 | all pages | all | vertical rhythm differed by page (landing 12, About 10, program page and charts 8, programs and sources 6) | confirmed by code | P2 | U1 |
| 4 | landing, programs, charts | 1024, 1440 | text blocks are capped at 68ch in a 6xl page, the right half may look empty on pages without a rail | needs screenshot | ? | U3, U5 |
| 5 | landing | all | the hero ships the drawn contour fallback, thin lines on a dark slab may read as flat | needs screenshot | ? | U3 |
| 6 | all pages | all | hierarchy may be flat, titles, lead sentences and body are all serif with small size steps | needs screenshot | ? | U1, U3 |
| 7 | map | 1024, 1440 | bottom edge may be crowded: time bar, key button, zoom buttons and attribution share it | needs screenshot | ? | U6 |
| 8 | held topic page | all | the h1 was `text-3xl`, smaller than every other page title | confirmed by code | P3 | U1 |
| 9 | sources | all | `SourcesBrowser` keeps its own `space-y-8` and `space-y-5` inside the page, so it does not use the shared rhythm | confirmed by code | P3 | U5 |
