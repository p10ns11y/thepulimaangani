#!/usr/bin/env bash
# Fast local hook: TypeScript + Vitest only (no WASM rebuild, no Rust, no production build).
# Full parity with GitHub Actions `build`: run `pnpm run gate` before push or open PR.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/ci-env-bootstrap.sh
source "${SCRIPT_DIR}/ci-env-bootstrap.sh"
ensure_node_on_path
ensure_rustup_env
cd "$(dirname "$0")/.."

if [[ ! -f public/wasm/thepulimaangani_parser_bg.wasm ]] && [[ ! -f src/wasm/thepulimaangani_parser_bg.wasm ]]; then
  echo "pre-commit: WASM missing for Vitest. Run \`pnpm run build:wasm\` once, then retry." >&2
  exit 1
fi

pnpm run typecheck
pnpm run test:frontend
