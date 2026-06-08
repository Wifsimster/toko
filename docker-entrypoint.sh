#!/bin/sh
set -e

echo "Starting Tokō..."

# Validate required environment variables. Fail fast here, before tsx parses
# env, so a misconfiguration produces a clear message instead of a Zod stack.
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

# In production these are not optional: Stripe powers billing and CORS_ORIGIN
# locks down the API. Treat empty or leftover placeholder values as fatal so a
# broken deploy never silently serves billing with test/placeholder keys.
if [ "${NODE_ENV:-}" = "production" ]; then
  prod_errors=""
  # Reject empty, the .env.example placeholders (which contain "..."), and the
  # common sk_test_placeholder/whsec_placeholder sentinels.
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

# Migrations run automatically at API startup via @focusflow/db migrate()

# Start the API server via tsx (handles TypeScript internal packages at runtime)
cd /app/apps/api
exec pnpm exec tsx src/index.ts
