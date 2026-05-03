#!/usr/bin/env bash
# Mirrors `.github/workflows/ci.yml` build job front-end gates (install → build → typecheck → wasm check → test).
# Requires: Node 22 (see `.nvmrc`), pnpm, Rust+wasm32+wasm-pack for `pnpm run build`.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/ci-env-bootstrap.sh
source "${SCRIPT_DIR}/ci-env-bootstrap.sh"
ensure_node_on_path
ensure_rustup_env
cd "$(dirname "$0")/.."

echo "== pnpm install --frozen-lockfile"
pnpm install --frozen-lockfile

echo "== pnpm run build"
pnpm run build

echo "== pnpm run typecheck"
pnpm run typecheck

echo "== Verify WASM for Vitest"
test -f public/wasm/thepulimaangani_parser_bg.wasm

echo "== pnpm run test (Rust + Vitest)"
pnpm run test

echo "== OK: frontend CI gates passed"
