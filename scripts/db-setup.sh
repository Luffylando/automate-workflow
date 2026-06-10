#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PG_BIN="/opt/homebrew/opt/postgresql@16/bin"

if [ ! -x "$PG_BIN/initdb" ]; then
  echo "PostgreSQL 16 not found. Install with:"
  echo "  brew install postgresql@16"
  exit 1
fi

DATA_DIR="/opt/homebrew/var/postgresql@16"

if [ ! -f "$DATA_DIR/postgresql.conf" ]; then
  echo "Initializing Postgres data directory..."
  "$PG_BIN/initdb" -D "$DATA_DIR"
fi

echo "Starting Postgres..."
brew services start postgresql@16
sleep 3

until "$PG_BIN/pg_isready" >/dev/null 2>&1; do
  sleep 1
done

echo "Creating user and database..."
"$PG_BIN/psql" postgres -tc "SELECT 1 FROM pg_roles WHERE rolname='automate'" | grep -q 1 \
  || "$PG_BIN/psql" postgres -c "CREATE USER automate WITH PASSWORD 'automate' SUPERUSER;"

"$PG_BIN/psql" postgres -tc "SELECT 1 FROM pg_database WHERE datname='automate_workflow'" | grep -q 1 \
  || "$PG_BIN/psql" postgres -c "CREATE DATABASE automate_workflow OWNER automate;"

echo ""
echo "Postgres is ready."
echo "  DATABASE_URL=postgresql://automate:automate@localhost:5432/automate_workflow"
echo ""
echo "Run: pnpm dev"
