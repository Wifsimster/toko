#!/bin/sh
# deploy.sh — Deploy script for Tokō
# Run by the Release workflow on the self-hosted runner that sits on the
# docker host. Pulls the published image, restarts the app service, and
# rolls back to the previous image if it does not come up healthy.
# Postgres is intentionally excluded — never restart the database from CI.

set -eu

COMPOSE_DIR="${TOKO_COMPOSE_DIR:-/opt/docker/toko}"
COMPOSE_FILE="$COMPOSE_DIR/compose.yml"
HEALTH_URL="${TOKO_HEALTH_URL:-http://localhost:8080/api/health}"
HEALTH_TIMEOUT="${TOKO_HEALTH_TIMEOUT:-120}"

# ─── Pre-flight validation ─────────────────────────────

if ! command -v docker >/dev/null 2>&1; then
  echo "[deploy] ERROR: docker command not found" >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "[deploy] ERROR: docker daemon is not running or not accessible" >&2
  exit 1
fi

if [ ! -d "$COMPOSE_DIR" ]; then
  echo "[deploy] ERROR: COMPOSE_DIR not found: $COMPOSE_DIR" >&2
  exit 1
fi

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "[deploy] ERROR: compose.yml not found: $COMPOSE_FILE" >&2
  exit 1
fi

# ─── Capture previous image digest for rollback ────────

PREVIOUS_IMAGE=$(docker inspect --format='{{.Image}}' toko 2>/dev/null || echo "")

# ─── Pull & restart ────────────────────────────────────

echo "[deploy] Pulling latest images..."
docker compose -f "$COMPOSE_FILE" pull toko

echo "[deploy] Restarting toko service..."
docker compose -f "$COMPOSE_FILE" up -d --no-deps toko

# ─── Health check with rollback ────────────────────────

# /api/health answers 200 even when degraded, on purpose: a dead Stripe or
# Postgres is a signal for the uptime monitor, not a reason to fail
# liveness (apps/api/src/routes/health.ts). A status-only probe would
# therefore green-light a deploy whose database is unreachable, so we read
# the body instead of just the status line.
#
# Both probes start at `ok: true, checkedAt: 0` and are refreshed by a
# fire-and-forget call on each request, so the first response after a
# restart carries that optimistic default with `checkedAt: null`. Only a
# verdict with a real timestamp reflects an actual `select 1`, so we keep
# polling until we get one.
check_health() {
  body=$(docker exec toko wget -qO- "$HEALTH_URL" 2>/dev/null) || return 1

  case "$body" in
    *'"status":"ok"'*) ;;
    *) return 1 ;;
  esac

  db=$(printf '%s' "$body" | grep -o '"db":{[^}]*}') || return 1
  case "$db" in
    *'"checkedAt":null'*) return 1 ;;
    *'"ok":true'*) ;;
    *) return 1 ;;
  esac

  HEALTH_BODY="$body"
  return 0
}

echo "[deploy] Waiting for health check (timeout: ${HEALTH_TIMEOUT}s)..."
ELAPSED=0
HEALTHY=0
HEALTH_BODY=""
while [ $ELAPSED -lt $HEALTH_TIMEOUT ]; do
  if check_health; then
    HEALTHY=1
    break
  fi
  sleep 2
  ELAPSED=$((ELAPSED + 2))
done

if [ $HEALTHY -eq 0 ]; then
  echo "[deploy] ERROR: Health check failed after ${HEALTH_TIMEOUT}s" >&2
  if [ -n "$PREVIOUS_IMAGE" ]; then
    echo "[deploy] Rolling back to previous image: $PREVIOUS_IMAGE" >&2
    docker tag "$PREVIOUS_IMAGE" ghcr.io/wifsimster/toko:latest
    docker compose -f "$COMPOSE_FILE" up -d --no-deps toko
  fi
  exit 1
fi

echo "[deploy] Health check passed (API up, database reachable)."

# Stripe is checked but never fails the deploy: a Stripe incident is not
# this image's fault, and rolling a good build back would not fix it. The
# entrypoint already refuses to boot on placeholder keys.
case "$HEALTH_BODY" in
  *'"stripe":{"ok":false'*)
    echo "[deploy] WARNING: Stripe probe is failing — billing may be degraded." >&2
    ;;
esac

# ─── Cleanup ──────────────────────────────────────────

echo "[deploy] Cleaning up old images..."
docker image prune -f

echo "[deploy] Done."
