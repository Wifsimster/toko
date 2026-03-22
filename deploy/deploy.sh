#!/bin/sh
# deploy.sh — Restricted deploy script for Tokō
# This script is called by GitHub Actions via SSH (command= restricted key).
# It pulls the latest Docker images and restarts the app service.
# Postgres is intentionally excluded — never restart the database from CI.

set -eu

COMPOSE_DIR="${TOKO_COMPOSE_DIR:-/opt/toko}"

echo "[deploy] Pulling latest images..."
docker compose -f "$COMPOSE_DIR/compose.yml" pull toko

echo "[deploy] Restarting services..."
docker compose -f "$COMPOSE_DIR/compose.yml" up -d toko

echo "[deploy] Cleaning up old images..."
docker image prune -f

echo "[deploy] Done."
