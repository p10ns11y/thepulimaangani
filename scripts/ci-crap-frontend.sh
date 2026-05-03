#!/usr/bin/env bash
# Mirrors `crap_analysis` Vitest coverage step (after wasm build). Full CRAP job also runs cargo llvm-cov + lizard.
set -euo pipefail
cd "$(dirname "$0")/.."

pnpm install --frozen-lockfile
pnpm run build:wasm
test -f public/wasm/thepulimaangani_parser_bg.wasm
pnpm run test:frontend:coverage
