#!/bin/sh
set -e

echo "🔄 Running database migrations..."

node ./dist/migrate.js

echo "✅ Migrations completed successfully"

echo "🚀 Starting server..."
exec node ./dist/server.js
