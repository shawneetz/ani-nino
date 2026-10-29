# Anino ng Ani

Interactive map of martial-law farm policy in CALABARZON. Laguna is the complete layer. The
existing app includes a month slider, family and province filters, a map/list view, and a
shareable pin detail panel.

## Run locally

Requirements: Node.js and pnpm.

```bash
pnpm install
cp .env.example .env
pnpm db:setup-local       # starts local Postgres and creates the roles/database
pnpm db:migrate           # applies committed SQL migrations
pnpm snapshot:seed
pnpm dev
```

The app continues to read its verified pin data from the generated snapshot. Phase 1 adds a
read-only database connection for health reporting and migration/test infrastructure; a database
outage does not prevent the site from serving the snapshot.

The repository starts with an empty seed dataset and a matching snapshot. Add verified source and
pin records under `data/`, then rerun `pnpm snapshot:seed`.

### Database

`src/db/schema.ts` defines the Postgres schema. Commit generated SQL migrations under `drizzle/`;
runtime code never runs migrations. The app uses `DATABASE_URL` with the read-only `anino_app`
role. `DATABASE_URL_MIGRATE` is reserved for migrations, seed scripts, and tests, and must never
be set in Coolify.

To regenerate a migration after changing the schema:

```bash
pnpm db:generate
pnpm db:migrate
```

Database-backed tests require the local database and both URLs in `.env`. CI creates a disposable
Postgres instance and verifies that the committed migrations match the schema.

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
pnpm db:setup-local
cp .env.example .env
pnpm lint && pnpm typecheck && pnpm test && pnpm build
pnpm test:e2e
```

`pnpm test` applies migrations to the configured test database before running, so Postgres must be
available. To verify the DB fallback, stop the local service with `docker compose stop db`, open
`/api/health`, and confirm it returns HTTP 200 with `"db":"down"`.

## Deploy

Push to `main`. GitHub Actions runs checks, builds an arm64 image, pushes it to GHCR, joins the
Tailscale network briefly, and triggers Coolify on the Pi. The app health check is `/api/health`.
Set `TS_OAUTH_CLIENT_ID`, `TS_OAUTH_SECRET`, `COOLIFY_URL`, `COOLIFY_TOKEN`, and
`COOLIFY_APP_UUID` in the GitHub repository secrets. Coolify receives only the runtime
`DATABASE_URL`; keep `DATABASE_URL_MIGRATE` out of the app container.

For the Pi's existing Postgres instance, run `db/roles.sql` as the Postgres superuser with
production passwords supplied as psql variables, then run `pnpm db:migrate` from a trusted machine
using `DATABASE_URL_MIGRATE` over Tailscale. Give the app only its `anino_app` URL in Coolify.
Restrict Postgres access to the Tailscale range for migrations and the Coolify Docker network for
the app; never expose port 5432 to the LAN or internet.

## Local container

```bash
docker build -t anino-test .
docker run --rm -p 3000:3000 anino-test
```

Open `http://localhost:3000/api/health`; it returns HTTP 200 with `"ok":true` and a `"db"` field
showing whether Postgres is reachable.
