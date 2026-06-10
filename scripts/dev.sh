#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
STATE_FILE="$ROOT/.dev.state"

has_docker() {
  command -v docker >/dev/null 2>&1
}

postgres_port_open() {
  nc -z localhost 5432 2>/dev/null
}

wait_for_postgres_docker() {
  echo "Waiting for Postgres (Docker)..."
  local retries=0
  until docker compose exec -T postgres pg_isready -U automate -d automate_workflow >/dev/null 2>&1; do
    retries=$((retries + 1))
    if [ "$retries" -ge 30 ]; then
      echo "Postgres failed to start within 30s"
      exit 1
    fi
    sleep 1
  done
}

wait_for_postgres_port() {
  echo "Waiting for Postgres on localhost:5432..."
  local retries=0
  until postgres_port_open; do
    retries=$((retries + 1))
    if [ "$retries" -ge 30 ]; then
      echo "Postgres is not reachable on localhost:5432"
      exit 1
    fi
    sleep 1
  done
}

start_postgres() {
  rm -f "$STATE_FILE"

  if has_docker; then
    echo "Starting Postgres (Docker)..."
    docker compose up -d postgres
    wait_for_postgres_docker
    echo "STARTED_DOCKER=1" >> "$STATE_FILE"
    return
  fi

  if postgres_port_open; then
    echo "Docker not found — using existing Postgres on localhost:5432"
    return
  fi

  cat <<'EOF'
Postgres is not running and Docker is not installed.

Options:
  1. Install Docker Desktop: https://www.docker.com/products/docker-desktop/
     Then run: pnpm dev

  2. Install Postgres via Homebrew:
       brew install postgresql@16
       brew services start postgresql@16
       createuser -s automate 2>/dev/null || true
       createdb automate_workflow -O automate 2>/dev/null || createdb automate_workflow
     Then set DATABASE_URL in apps/api/.env

  3. Use a remote Postgres (Neon, Supabase, etc.) and set DATABASE_URL in apps/api/.env
EOF
  exit 1
}

stop_postgres() {
  if [ -f "$STATE_FILE" ] && grep -q "STARTED_DOCKER=1" "$STATE_FILE" && has_docker; then
    echo "Stopping Postgres (Docker)..."
    docker compose down
  fi
  rm -f "$STATE_FILE"
}

kill_ports() {
  for port in 3000 3001; do
    local pids
    pids=$(lsof -ti:"$port" 2>/dev/null || true)
    if [ -n "$pids" ]; then
      echo "$pids" | xargs kill -9 2>/dev/null || true
    fi
  done
}

cleanup() {
  trap - INT TERM EXIT
  echo ""
  echo "Stopping API and Web..."
  kill_ports
  stop_postgres
  echo "All services stopped."
}

start() {
  start_postgres

  echo ""
  echo "  Web:      http://localhost:3000"
  echo "  API:      http://localhost:3001"
  echo "  Postgres: localhost:5432"
  echo ""
  echo "Press Ctrl+C to stop all services, or run: pnpm stop"
  echo ""

  trap cleanup INT TERM EXIT

  pnpm exec concurrently -k -n api,web -c blue,green \
    "pnpm --filter api dev" \
    "pnpm --filter web dev"
}

stop() {
  echo "Stopping API and Web..."
  kill_ports
  stop_postgres
  echo "All services stopped."
}

case "${1:-start}" in
  start) start ;;
  stop) stop ;;
  restart)
    stop
    start
    ;;
  *)
    echo "Usage: $0 {start|stop|restart}"
    exit 1
    ;;
esac
