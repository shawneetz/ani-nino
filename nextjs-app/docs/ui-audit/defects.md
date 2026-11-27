<!--
what this file does: the ui audit, one line per defect, for round 1 (u0) and round 2 (u10)
severity: P1 breaks reading or looks broken, P2 looks unfinished, P3 polish
the refinement is done when no P1 or P2 is open after round 2
change in this version (u8 to u10): added the states rows and the round 2 table
-->
# UI audit

Round 1 screenshots: `UI_AUDIT=1 pnpm exec playwright test e2e/ui-audit.spec.ts`
Round 2 screenshots: `UI_AUDIT=1 UI_AUDIT_ROUND=2 pnpm exec playwright test e2e/ui-audit.spec.ts`

## Round 1 (u0)

| # | route | width | what looks wrong | status | severity | fixed in |
|---|---|---|---|---|---|---|
| 1 | program page | all | boxed cards remain: `RelatedPrograms`, `CiteBlock` and `ContributeLinks` | confirmed by code | P2 | fixed in U2 |
| 2 | program page | all | `CopyLinkButton` had its own colors, `JumpSelect` and `PageRail` used older styles | confirmed by code | P2 | fixed in U2 |
| 3 | all pages | all | vertical rhythm differed by page | confirmed by code | P2 | fixed in U1 |
| 4 | landing, programs, charts | 1024, 1440 | text blocks capped at 68ch in a 6xl page, the right half may look empty | needs screenshot | ? | U3 did the landing, check by eye |
| 5 | landing | all | the drawn contour fallback may read as a flat dark slab | needs screenshot | ? | U3 redrew it, check contrast by eye |
| 6 | all pages | all | hierarchy may be flat, small size steps | needs screenshot | ? | U1, U3, check by eye |
| 7 | map | 1024, 1440 | bottom edge may be crowded | needs screenshot | ? | U6, check by eye |
| 8 | held topic page | all | the h1 was smaller than every other page title | confirmed by code | P3 | fixed in U1 |
| 9 | sources | all | `SourcesBrowser` kept its own gaps | confirmed by code | P3 | fixed in U5 |
| 10 | programs | all | filter bar padding and row rhythm differed from the other list pages | confirmed by code | P3 | fixed in U5 |
| 11 | map | 640 to 1023 | the map key could sit on the zoom buttons | needs screenshot | ? | U6, check by eye |
| 12 | header | 640 to 1023 | the tagline wrapped unevenly beside the nav | needs screenshot | ? | U7, check by eye |
| 13 | all pages | all | hover, pressed and motion differed between buttons, chips, switches and rows | confirmed by code | P2 | fixed in U8 |
| 14 | programs, sources, map | all | empty and error states had four different looks | confirmed by code | P2 | fixed in U8 |

## Round 2 (u10)

| # | route and width to check | what to look for | round 2 result | still open |
|---|---|---|---|---|
| 1, 2 | program page, 390 and 1440 | no boxed card, copy link and jump select look like the controls | ? | ? |
| 3 | every route, 1440 | the gap between sections is the same on every page | ? | ? |
| 4 | landing, programs, charts, 1440 | the page does not look left heavy, the intro uses the width | ? | ? |
| 5 | landing, 390 and 1440 | contour lines show and hero text stays readable | ? | ? |
| 6 | every route, squint test | one clearly largest element, then two clear levels | ? | ? |
| 7, 11 | map, 1024 and 1440 | time bar, key, zoom buttons and attribution never touch | ? | ? |
| 12 | header, 768 and 1024 | tagline stacks under 1024 and sits beside the wordmark from 1024 | ? | ? |
| 13 | tab through `/`, `/programs`, a program page | same amber ring, hover and pressed look on every control | ? | ? |
| 14 | empty search on `/programs` and `/map`, map with cdn blocked | same dashed outline and wording style | ? | ? |
| new | any screenshot | anything broken or unfinished that is not listed above | ? | ? |
