#!/usr/bin/env bash
# Local dev: incremental sync of wasm-pack output into src/wasm/ and public/wasm/ (requires `rsync`).
set -e

echo "📦 [2/2] Syncing WASM files to src/wasm/ and public/wasm/..."

rsync --mkpath -a tamil-seiyul-alagi/pkg/ src/wasm/
rsync --mkpath -a tamil-seiyul-alagi/pkg/ public/wasm/

echo "✅ WASM files copied successfully"
