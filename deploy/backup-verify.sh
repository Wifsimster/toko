#!/bin/sh

set -eu

BACKUP_DIR="${TOKO_BACKUP_DIR:-/opt/toko/backups}"
PG_CONTAINER="${TOKO_PG_CONTAINER:-toko-postgres}"
DB_USER="${DB_USER:-toko}"
VERIFY_DB_NAME="${VERIFY_DB_NAME:-toko_verify}"

if [ -z "${BACKUP_ENCRYPTION_KEY:-}" ]; then
  echo "[verify] ERROR: BACKUP_ENCRYPTION_KEY is required" >&2
  exit 1
fi

for cmd in docker openssl; do
  command -v "$cmd" >/dev/null 2>&1 || { echo "[verify] ERROR: $cmd not found" >&2; exit 1; }
done

BACKUP_FILE="${BACKUP_FILE:-}"
if [ -z "$BACKUP_FILE" ]; then
  BACKUP_FILE="$(ls -1t "$BACKUP_DIR"/toko-*.sql.enc 2>/dev/null | head -n 1 || true)"
fi
if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
  echo "[verify] ERROR: no backup file found in $BACKUP_DIR" >&2
  exit 1
fi
echo "[verify] verifying $BACKUP_FILE"

cleanup() {
  docker exec "$PG_CONTAINER" psql -U "$DB_USER" -d postgres \
    -c "DROP DATABASE IF EXISTS \"$VERIFY_DB_NAME\";" >/dev/null 2>&1 || true
}
trap cleanup EXIT

cleanup
docker exec "$PG_CONTAINER" psql -U "$DB_USER" -d postgres \
  -c "CREATE DATABASE \"$VERIFY_DB_NAME\";" >/dev/null

openssl enc -d -aes-256-cbc -pbkdf2 -pass env:BACKUP_ENCRYPTION_KEY -in "$BACKUP_FILE" \
  | docker exec -i "$PG_CONTAINER" psql -U "$DB_USER" -d "$VERIFY_DB_NAME" -v ON_ERROR_STOP=1 -q >/dev/null

TABLE_COUNT="$(docker exec "$PG_CONTAINER" psql -U "$DB_USER" -d "$VERIFY_DB_NAME" -tAc \
  "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")"
USER_COUNT="$(docker exec "$PG_CONTAINER" psql -U "$DB_USER" -d "$VERIFY_DB_NAME" -tAc \
  "SELECT count(*) FROM \"user\";" 2>/dev/null || echo "ERR")"

if [ "$TABLE_COUNT" -lt 1 ] 2>/dev/null || [ "$USER_COUNT" = "ERR" ]; then
  echo "[verify] FAILED: restore produced $TABLE_COUNT tables, user table readable: $USER_COUNT" >&2
  exit 1
fi

echo "[verify] OK — restored $TABLE_COUNT tables, \"user\" rows: $USER_COUNT"
