#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Installing dependencies"
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

echo "==> Building"
pnpm build

echo "==> Running tests"
pnpm test

echo "==> Dev smoke test"
bash scripts/ci-smoke-dev.sh

echo ""
echo "All checks passed. Safe to push."
