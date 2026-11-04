# Anino ng Ani

Interactive map of martial-law farm policy in CALABARZON. Laguna is the complete layer. The
existing app includes a month slider, family and province filters, a map/list view, and a
shareable pin detail panel.

## Run locally

Requirements: Node.js and pnpm.

```bash
pnpm install
cp .env.supabase .env
pnpm db:migrate:prod      # applies committed SQL migrations to Supabase
pnpm snapshot:seed
pnpm dev
```

The app reads content from Postgres when available and falls back to the validated snapshot when
the database is unavailable. Requests are cached in memory for 60 seconds; after a database error,
the app waits 15 seconds before retrying Postgres.

The repository starts with an empty seed dataset and a matching snapshot. Add verified source and
pin records under `data/`, then rerun `pnpm snapshot:seed`.

### Database

`src/db/schema.ts` defines the Postgres schema. Commit generated SQL migrations under `drizzle/`;
runtime code never runs migrations. The app uses `DATABASE_URL` with the read-only `anino_app`
role. `DATABASE_URL_MIGRATE` is reserved for migrations and seed scripts, and must never be set
in the runtime deployment.

To regenerate a migration after changing the schema:

```bash
pnpm db:generate
pnpm db:migrate:prod
```

Tests use the database-independent unit configuration. Run migrations and content publishing
against Supabase explicitly with the `:prod` scripts.

### Seed files

- `data/sources.json`: an array of source objects (`id`, `title`, `publisher`, `kind`, plus optional
  author, URLs, publication year, access date, and note).
- `data/pins/*.json`: arrays of pins. Each pin has a slug `id`, layer, title, family, start date,
  date label, status, locations, and source references. Optional fields include the promise,
  record, end date, verification details, and timeline events.
- `data/links.json`: optional links with `today`, `past`, and `interpretationNote`; each link appears
  in both pins' detail panels and is explicitly labelled as interpretation.

`pnpm snapshot:seed` builds the static pin snapshot from the seed files.
`pnpm export:snapshot` exports pins and their full details, charts, and methods data from Postgres
to `snapshot/snapshot.json` for runtime fallback. Both outputs are validated against the Zod API
contract. Do not put unverified claims or placeholder citations into production seed files.

## API

- `GET /api/pins?month=1975-06&family=land_reform&province=laguna&today=1`
- `GET /api/pins/{slug}`
- `GET /api/charts`
- `GET /api/methods`
- `GET /api/health`

The map uses MapLibre GL JS with OpenStreetMap raster tiles and requires an internet connection to
load map tiles.

## Checks

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
pnpm test:e2e
```

`pnpm test` runs the database-independent backend, fallback, API contract, and component tests.

## Deploy

Deploy the Next.js app with the Supabase `DATABASE_URL` runtime connection string. Keep
`DATABASE_URL_MIGRATE` out of the runtime deployment.
