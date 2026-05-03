#!/usr/bin/env bash
# Source from shell scripts that invoke pnpm and cargo (CI mirrors, hooks). Prepend Node when
# `pnpm` is missing, and set RUSTUP_HOME/CARGO_HOME for system toolchains when the rustup shim
# has no default (empty ~/.rustup in minimal shells).
#
# Usage (at top of a bash script, after `set -euo pipefail` if desired):
#   SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
#   # shellcheck source=scripts/ci-env-bootstrap.sh
#   source "${SCRIPT_DIR}/ci-env-bootstrap.sh"
#   ensure_node_on_path
#   ensure_rustup_env
ensure_node_on_path() {
  if command -v pnpm >/dev/null 2>&1 && command -v node >/dev/null 2>&1; then
    return 0
  fi
  # Typical managed Node layout in this repo's remote/agent environments
  local _nd
  shopt -s nullglob 2>/dev/null || true
  for _nd in /opt/node-v*-linux-x64/bin; do
    if [[ -x "${_nd}/pnpm" || -x "${_nd}/node" ]]; then
      PATH="${_nd}:${PATH}"
      export PATH
      break
    fi
  done
}

ensure_rustup_env() {
  if command -v cargo >/dev/null 2>&1 && cargo --version >/dev/null 2>&1; then
    return 0
  fi
  if [[ -n "${RUSTUP_HOME:-}" ]] && [[ -n "${CARGO_HOME:-}" ]]; then
    return 0
  fi
  # `cargo` on PATH can still be the rustup shim and fail when ~/.rustup has no default; use
  # system-wide toolchains when present (common in agent/CI images).
  if [[ -d /usr/local/rustup && -d /usr/local/cargo ]]; then
    export RUSTUP_HOME=/usr/local/rustup
    export CARGO_HOME=/usr/local/cargo
    PATH="/usr/local/cargo/bin:${PATH}"
    export PATH
  fi
}
