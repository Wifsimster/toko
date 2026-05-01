#!/bin/sh
set -e

echo "Starting Tokō..."

# Validate required environment variables
missing=""
for var in DATABASE_URL BETTER_AUTH_SECRET BETTER_AUTH_URL; do
  eval "value=\${$var:-}"
  if [ -z "$value" ]; then
    missing="$missing $var"
  fi
done

if [ -n "$missing" ]; then
  echo "ERROR: Missing required environment variables:$missing" >&2
  exit 1
fi

# Warn on missing optional but recommended vars in production
if [ "${NODE_ENV:-}" = "production" ]; then
  for var in STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET CORS_ORIGIN; do
    eval "value=\${$var:-}"
    if [ -z "$value" ]; then
      echo "WARN: $var is not set (recommended in production)" >&2
    fi
  done
fi

# Migrations run automatically at API startup via @focusflow/db migrate()

# Start the API server via tsx (handles TypeScript internal packages at runtime)
cd /app/apps/api
exec pnpm exec tsx src/index.ts
