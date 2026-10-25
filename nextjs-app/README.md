# Ani Nino

A time-and-place explorer for public programs, claims, records, and sources. The UI includes a
month slider, family and province filters, a map/list view, and a shareable pin detail panel.

## Run locally

Requirements: Node.js and pnpm.

```bash
pnpm install
pnpm snapshot:seed
pnpm dev
```

The repository starts with an empty seed dataset and a matching snapshot. Add the project's
verified source and pin records under `data/`, then rerun `pnpm snapshot:seed`. This workspace
does not include a database or project dataset, so its API reads the generated snapshot directly.

### Seed files

- `data/sources.json`: an array of source objects (`id`, `title`, `publisher`, `kind`, plus optional
  author, URLs, publication year, access date, and note).
- `data/pins/*.json`: arrays of pins. Each pin has a slug `id`, layer, title, family, start date,
  date label, status, locations, and source references. Optional fields include the promise,
  record, end date, verification details, and timeline events.
- `data/links.json`: optional links with `today`, `past`, and `interpretationNote`; each link appears
  in both pins' detail panels and is explicitly labelled as interpretation.

`pnpm snapshot:seed` validates the generated output against the Zod API contract before writing
`snapshot/snapshot.json`. Do not put unverified claims or placeholder citations into production
seed files.

## API

- `GET /api/pins?month=1975-06&family=land_reform&province=laguna&today=1`
- `GET /api/pins/{slug}`
- `GET /api/health`

The map uses MapLibre GL JS with OpenStreetMap raster tiles and requires an internet connection to
load map tiles.

## Checks

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm build
pnpm test:e2e
```
