#!/bin/sh
# backup.sh — Encrypted PostgreSQL backup for Tokō.
#
# Runs on the host (e.g. via daily cron), dumps the database from the
# toko-postgres container, encrypts the dump at rest with AES-256, and prunes
# old backups. Because the database holds children's health data (RGPD art. 9),
# backups MUST be encrypted (art. 32 — security of processing) and stored in
# the EU (art. 44+ — no transfer outside the EU).
#
# Required environment:
#   BACKUP_ENCRYPTION_KEY   passphrase used to encrypt/decrypt the dump
# Optional environment:
#   TOKO_BACKUP_DIR         where to write backups (default /opt/toko/backups)
#   TOKO_PG_CONTAINER       postgres container name (default toko-postgres)
#   DB_USER / DB_NAME       database credentials (default toko / toko)
#   BACKUP_RETENTION_DAYS   how long to keep backups (default 30)
#
# Restore:
#   openssl enc -d -aes-256-cbc -pbkdf2 -pass env:BACKUP_ENCRYPTION_KEY \
#     -in toko-YYYYMMDD-HHMMSS.sql.enc | \
#     docker exec -i toko-postgres psql -U toko -d toko

set -eu

BACKUP_DIR="${TOKO_BACKUP_DIR:-/opt/toko/backups}"
PG_CONTAINER="${TOKO_PG_CONTAINER:-toko-postgres}"
DB_USER="${DB_USER:-toko}"
DB_NAME="${DB_NAME:-toko}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

if [ -z "${BACKUP_ENCRYPTION_KEY:-}" ]; then
  echo "[backup] ERROR: BACKUP_ENCRYPTION_KEY is required" >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "[backup] ERROR: docker command not found" >&2
  exit 1
fi

if ! command -v openssl >/dev/null 2>&1; then
  echo "[backup] ERROR: openssl command not found" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

# A UTC timestamp is passed in so the filename is stable across the pipeline.
STAMP="$(date -u +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/toko-$STAMP.sql.enc"
TMP="$OUT.partial"

echo "[backup] dumping $DB_NAME from $PG_CONTAINER"

# Stream the dump straight into the encryptor — the plaintext never touches disk.
if docker exec "$PG_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --clean \
  | openssl enc -aes-256-cbc -pbkdf2 -salt -pass env:BACKUP_ENCRYPTION_KEY -out "$TMP"; then
  mv "$TMP" "$OUT"
  chmod 600 "$OUT"
  echo "[backup] wrote $OUT ($(wc -c < "$OUT") bytes, encrypted)"
else
  echo "[backup] ERROR: dump failed" >&2
  rm -f "$TMP"
  exit 1
fi

# Prune backups older than the retention window.
PRUNED="$(find "$BACKUP_DIR" -name 'toko-*.sql.enc' -type f -mtime "+$RETENTION_DAYS" -print -delete | wc -l)"
echo "[backup] pruned $PRUNED backup(s) older than $RETENTION_DAYS days"
