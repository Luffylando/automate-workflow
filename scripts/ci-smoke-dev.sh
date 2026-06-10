#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

API_PORT="${API_PORT:-3001}"
WEB_PORT="${WEB_PORT:-3000}"
DATABASE_URL="${DATABASE_URL:-postgresql://automate:automate@localhost:5432/automate_workflow}"

kill_port() {
  local port="$1"
  local pids
  pids=$(lsof -ti:"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "$pids" | xargs kill -9 2>/dev/null || true
  fi
}

wait_for_url() {
  local url="$1"
  local label="$2"
  local retries=0

  until curl -sf "$url" >/dev/null; do
    retries=$((retries + 1))
    if [ "$retries" -ge 60 ]; then
      echo "$label failed to start at $url"
      return 1
    fi
    sleep 1
  done

  echo "$label is up at $url"
}

cleanup() {
  if [ -n "${API_PID:-}" ]; then
    kill "$API_PID" 2>/dev/null || true
  fi
  if [ -n "${WEB_PID:-}" ]; then
    kill "$WEB_PID" 2>/dev/null || true
  fi
  kill_port "$API_PORT"
  kill_port "$WEB_PORT"
}

trap cleanup EXIT INT TERM

echo "Smoke test: checking Postgres..."
if ! (echo >/dev/tcp/localhost/5432) 2>/dev/null; then
  echo "Postgres is not available on localhost:5432"
  exit 1
fi

kill_port "$API_PORT"
kill_port "$WEB_PORT"

export PORT="$API_PORT"
export DATABASE_URL
export ADMIN_EMAIL=admin@localhost
export ADMIN_PASSWORD=ci-test-password
export SESSION_SECRET=ci-session-secret-with-enough-length-32chars
export CURSOR_API_KEY=
export GITHUB_REPO_URL=
export API_URL="http://127.0.0.1:${API_PORT}"

echo "Smoke test: starting API..."
pnpm --filter api dev > /tmp/automate-api-smoke.log 2>&1 &
API_PID=$!

wait_for_url "http://127.0.0.1:${API_PORT}/health" "API"

echo "Smoke test: starting Web..."
pnpm --filter web dev --port "$WEB_PORT" > /tmp/automate-web-smoke.log 2>&1 &
WEB_PID=$!

wait_for_url "http://127.0.0.1:${WEB_PORT}/" "Web"

echo "Smoke test: all services started successfully"
