#!/bin/sh
# deploy.sh — Restricted deploy script for Tokō
# This script is called by GitHub Actions via SSH (command= restricted key).
# It pulls the latest Docker images and restarts the app service.
# Postgres is intentionally excluded — never restart the database from CI.

set -eu

COMPOSE_DIR="${TOKO_COMPOSE_DIR:-/opt/toko}"
COMPOSE_FILE="$COMPOSE_DIR/compose.yml"
HEALTH_URL="${TOKO_HEALTH_URL:-http://localhost:8080/api/health}"
HEALTH_TIMEOUT="${TOKO_HEALTH_TIMEOUT:-60}"

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

echo "[deploy] Waiting for health check (timeout: ${HEALTH_TIMEOUT}s)..."
ELAPSED=0
HEALTHY=0
while [ $ELAPSED -lt $HEALTH_TIMEOUT ]; do
  if docker exec toko wget --no-verbose --tries=1 --spider "$HEALTH_URL" >/dev/null 2>&1; then
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

echo "[deploy] Health check passed."

# ─── Cleanup ──────────────────────────────────────────

echo "[deploy] Cleaning up old images..."
docker image prune -f

echo "[deploy] Done."
