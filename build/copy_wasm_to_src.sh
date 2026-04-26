#!/usr/bin/env bash
# Fallback when `rsync` is unavailable (e.g. Vercel). Dev machines use `rsync_rust_wasm_to_web.sh` via `tamil_seiyul_alagi_wasm.sh` when rsync is on PATH.
set -e

echo "📦 [2/2] Copying WASM files to src/wasm/..."

rm -rf src/wasm
mkdir -p src/wasm
cp -a tamil-seiyul-alagi/pkg/. src/wasm/

echo "✅ WASM files copied successfully"
