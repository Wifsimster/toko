#!/bin/sh
set -e

echo "Starting Tokō..."

missing=""
for var in DATABASE_URL BETTER_AUTH_SECRET BETTER_AUTH_URL DB_ENCRYPTION_KEY; do
  eval "value=\${$var:-}"
  if [ -z "$value" ]; then
    missing="$missing $var"
  fi
done

if [ -n "$missing" ]; then
  echo "ERROR: Missing required environment variables:$missing" >&2
  exit 1
fi

if [ "${NODE_ENV:-}" = "production" ]; then
  prod_errors=""
  case "${STRIPE_SECRET_KEY:-}" in
    "" | *...* | sk_test_placeholder) prod_errors="$prod_errors STRIPE_SECRET_KEY" ;;
  esac
  case "${STRIPE_WEBHOOK_SECRET:-}" in
    "" | *...* | whsec_placeholder) prod_errors="$prod_errors STRIPE_WEBHOOK_SECRET" ;;
  esac
  if [ -z "${CORS_ORIGIN:-}" ]; then
    prod_errors="$prod_errors CORS_ORIGIN"
  fi
  if [ -n "$prod_errors" ]; then
    echo "ERROR: production requires real (non-placeholder) values for:$prod_errors" >&2
    exit 1
  fi
fi

cd /app/apps/api
exec pnpm exec tsx src/index.ts
