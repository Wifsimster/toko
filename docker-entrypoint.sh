#!/bin/sh
set -e

echo "Starting Tokō..."

# Run database migrations before starting the server
echo "Running database migrations..."
cd packages/db && pnpm exec drizzle-kit migrate && cd /app

# Start the API server via tsx (handles TypeScript internal packages at runtime)
echo "Starting API server..."
cd /app/apps/api
exec pnpm exec tsx src/index.ts
