#!/usr/bin/env bash
# Local dev: incremental sync of wasm-pack output into src/wasm/ (requires `rsync`).
set -e

echo "📦 [2/2] Syncing  WASM files to src/wasm/..."

rsync --mkpath -a tamil-seiyul-alagi/pkg/ src/wasm/

echo "✅ WASM files copied successfully"
