# Anino ng Ani

Interactive map of martial-law farm policy in CALABARZON. Laguna is the complete layer. The
existing app includes a month slider, family and province filters, a map/list view, and a
shareable pin detail panel.

## Run locally

Requirements: Node.js and pnpm.

```bash
pnpm install
docker compose up -d      # local Postgres 16
pnpm snapshot:seed
pnpm dev
```

Copy `.env.example` to `.env.local` first (needed from Phase 1 on). The app currently reads its
verified pin data from the generated snapshot; local Postgres is available for development and
will be used when the database integration is added.

The repository starts with an empty seed dataset and a matching snapshot. Add verified source and
pin records under `data/`, then rerun `pnpm snapshot:seed`.

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
pnpm lint && pnpm typecheck && pnpm test && pnpm build
pnpm test:e2e
```

## Deploy

Push to `main`. GitHub Actions runs checks, builds an arm64 image, pushes it to GHCR, joins the
Tailscale network briefly, and triggers Coolify on the Pi. The app health check is `/api/health`.
Set `TS_OAUTH_CLIENT_ID`, `TS_OAUTH_SECRET`, `COOLIFY_URL`, `COOLIFY_TOKEN`, and
`COOLIFY_APP_UUID` in the GitHub repository secrets. Coolify receives only the runtime
`DATABASE_URL`; keep `DATABASE_URL_MIGRATE` out of the app container.

## Local container

```bash
docker build -t anino-test .
docker run --rm -p 3000:3000 anino-test
```

Open `http://localhost:3000/api/health`; the response should be `{"ok":true}`.
