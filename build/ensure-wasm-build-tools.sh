#!/usr/bin/env bash
# Idempotent: stable Rust, wasm32 target, and wasm-pack for environments that only
# ship Node (Vercel, some CI) — required because `src/wasm/` is generated, not in git.
set -euo pipefail

export CARGO_HOME="${CARGO_HOME:-$HOME/.cargo}"
export RUSTUP_HOME="${RUSTUP_HOME:-$HOME/.rustup}"
BIN="${CARGO_HOME}/bin"
mkdir -p "$BIN"
export PATH="${BIN}:${PATH}"

WASM_PACK_VERSION="${WASM_PACK_VERSION:-0.13.1}"

if ! command -v rustc >/dev/null 2>&1; then
  echo ">>> Installing rustup (stable)..."
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable --profile minimal
fi

# shellcheck disable=SC1090
if [[ -f "${CARGO_HOME}/env" ]]; then
  source "${CARGO_HOME}/env"
fi
export PATH="${CARGO_HOME}/bin:${PATH}"

echo ">>> rust: $(rustc -V)"
echo ">>> Ensuring wasm32-unknown-unknown target..."
rustup target add wasm32-unknown-unknown

if command -v wasm-pack >/dev/null 2>&1; then
  echo ">>> wasm-pack already on PATH: $(command -v wasm-pack) ($(wasm-pack -V))."
  exit 0
fi

os="$(uname -s)"
arch="$(uname -m)"
base="https://github.com/wasm-bindgen/wasm-pack/releases/download/v${WASM_PACK_VERSION}"

if [[ "$os" == "Linux" && "$arch" == "x86_64" ]]; then
  name="wasm-pack-v${WASM_PACK_VERSION}-x86_64-unknown-linux-musl.tar.gz"
elif [[ "$os" == "Linux" && "$arch" == "aarch64" ]]; then
  name="wasm-pack-v${WASM_PACK_VERSION}-aarch64-unknown-linux-musl.tar.gz"
elif [[ "$os" == "Darwin" && "$arch" == "arm64" ]]; then
  name="wasm-pack-v${WASM_PACK_VERSION}-aarch64-apple-darwin.tar.gz"
elif [[ "$os" == "Darwin" && "$arch" == "x86_64" ]]; then
  name="wasm-pack-v${WASM_PACK_VERSION}-x86_64-apple-darwin.tar.gz"
else
  echo ">>> No prebuilt wasm-pack for ${os} ${arch}; using cargo install (slow)."
  cargo install "wasm-pack@${WASM_PACK_VERSION}" --locked
  command -v wasm-pack
  wasm-pack -V
  exit 0
fi

echo ">>> Installing wasm-pack ${WASM_PACK_VERSION} (${name})..."
tmpdir="$(mktemp -d)"
curl -sSL "${base}/${name}" | tar xz -C "$tmpdir"
# Release tarball contains a `wasm-pack` binary (path varies slightly by archive).
if [[ -f "${tmpdir}/wasm-pack" ]]; then
  install -m 0755 "${tmpdir}/wasm-pack" "${BIN}/wasm-pack"
else
  wp="$(find "$tmpdir" -name wasm-pack -type f 2>/dev/null | head -1)"
  if [[ -n "${wp}" && -f "${wp}" ]]; then
    install -m 0755 "${wp}" "${BIN}/wasm-pack"
  else
    echo ">>> Failed to find wasm-pack binary in archive; falling back to cargo install."
    cargo install "wasm-pack@${WASM_PACK_VERSION}" --locked
  fi
fi
rm -rf "$tmpdir"

command -v wasm-pack
wasm-pack -V
