#!/usr/bin/env bash
# Pre-push / pre-commit contract: same steps as `ci:frontend` (see `.github/workflows/ci.yml` build job).
# Invoked from Husky; also runnable as `pnpm run gate`.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "${SCRIPT_DIR}/ci-frontend.sh"
