#!/usr/bin/env bash
set -euo pipefail

OWNER_PW="${OWNER_PW:-dev-owner-pw}"
APP_PW="${APP_PW:-dev-app-pw}"

docker compose up -d --wait db
docker compose exec -T db psql -U postgres -v ON_ERROR_STOP=1 \
  -v owner_pw="$OWNER_PW" -v app_pw="$APP_PW" \
  -f - < db/roles.sql

echo "Database roles are ready. Next: cp .env.example .env && pnpm db:migrate"
