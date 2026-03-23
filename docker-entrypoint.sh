#!/bin/sh
set -e

echo "Starting Tokō..."

# Migrations run automatically at API startup via @focusflow/db migrate()

# Start the API server via tsx (handles TypeScript internal packages at runtime)
cd /app/apps/api
exec pnpm exec tsx src/index.ts
