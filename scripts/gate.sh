#!/usr/bin/env bash
# Full CI parity (same as `ci:frontend` / GitHub Actions `build` job). Run before push or when changing Rust/WASM/build.
# Husky uses the lighter `scripts/pre-commit.sh` instead — see `pnpm run precommit`.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "${SCRIPT_DIR}/ci-frontend.sh"
