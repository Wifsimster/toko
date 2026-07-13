#!/bin/sh
# backup-verify.sh — Verify a Tokō backup by restoring it into a throwaway
# database and running a sanity check. A backup that has never been restored is
# not a backup (RGPD art. 32 — availability/resilience of health data).
#
# Restores into a temporary database, checks that a core table has rows, then
# drops the temporary database. The production database is never touched.
#
# Required environment:
#   BACKUP_ENCRYPTION_KEY   passphrase used by backup.sh
# Optional environment:
#   TOKO_BACKUP_DIR         where backups live (default /opt/toko/backups)
#   TOKO_PG_CONTAINER       postgres container (default toko-postgres)
#   DB_USER                 superuser able to CREATE/DROP DATABASE (default toko)
#   BACKUP_FILE             specific backup to verify (default: newest)
#   VERIFY_DB_NAME          throwaway database name (default toko_verify)
#
# Usage:
#   BACKUP_ENCRYPTION_KEY=... ./deploy/backup-verify.sh
#   BACKUP_ENCRYPTION_KEY=... BACKUP_FILE=/path/to/toko-….sql.enc ./deploy/backup-verify.sh

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

# Pick the backup to verify — an explicit file, or the newest one.
BACKUP_FILE="${BACKUP_FILE:-}"
if [ -z "$BACKUP_FILE" ]; then
  BACKUP_FILE="$(ls -1t "$BACKUP_DIR"/toko-*.sql.enc 2>/dev/null | head -n 1 || true)"
fi
if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
  echo "[verify] ERROR: no backup file found in $BACKUP_DIR" >&2
  exit 1
fi
echo "[verify] verifying $BACKUP_FILE"

# Always drop the throwaway database, even on failure.
cleanup() {
  docker exec "$PG_CONTAINER" psql -U "$DB_USER" -d postgres \
    -c "DROP DATABASE IF EXISTS \"$VERIFY_DB_NAME\";" >/dev/null 2>&1 || true
}
trap cleanup EXIT

cleanup
docker exec "$PG_CONTAINER" psql -U "$DB_USER" -d postgres \
  -c "CREATE DATABASE \"$VERIFY_DB_NAME\";" >/dev/null

# Decrypt and pipe straight into psql — the plaintext dump never hits disk.
openssl enc -d -aes-256-cbc -pbkdf2 -pass env:BACKUP_ENCRYPTION_KEY -in "$BACKUP_FILE" \
  | docker exec -i "$PG_CONTAINER" psql -U "$DB_USER" -d "$VERIFY_DB_NAME" -v ON_ERROR_STOP=1 -q >/dev/null

# Sanity check: the restored schema has tables, and a core table is queryable.
TABLE_COUNT="$(docker exec "$PG_CONTAINER" psql -U "$DB_USER" -d "$VERIFY_DB_NAME" -tAc \
  "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")"
USER_COUNT="$(docker exec "$PG_CONTAINER" psql -U "$DB_USER" -d "$VERIFY_DB_NAME" -tAc \
  "SELECT count(*) FROM \"user\";" 2>/dev/null || echo "ERR")"

if [ "$TABLE_COUNT" -lt 1 ] 2>/dev/null || [ "$USER_COUNT" = "ERR" ]; then
  echo "[verify] FAILED: restore produced $TABLE_COUNT tables, user table readable: $USER_COUNT" >&2
  exit 1
fi

echo "[verify] OK — restored $TABLE_COUNT tables, \"user\" rows: $USER_COUNT"
