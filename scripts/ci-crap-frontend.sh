#!/usr/bin/env bash
# Mirrors `crap_analysis` Vitest coverage step (after wasm build). Full CRAP job also runs cargo llvm-cov + lizard.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/ci-env-bootstrap.sh
source "${SCRIPT_DIR}/ci-env-bootstrap.sh"
ensure_node_on_path
ensure_rustup_env
cd "$(dirname "$0")/.."

pnpm install --frozen-lockfile
pnpm run build:wasm
test -f public/wasm/thepulimaangani_parser_bg.wasm
pnpm run test:frontend:coverage
