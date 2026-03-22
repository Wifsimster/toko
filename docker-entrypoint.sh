#!/bin/sh
set -e

echo "Starting Tokō..."

# Start the API server via tsx (handles TypeScript internal packages at runtime)
echo "Starting API server..."
exec npx tsx apps/api/src/index.ts
