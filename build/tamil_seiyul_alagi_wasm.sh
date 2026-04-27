#!/bin/bash
set -e

echo "🚀 Starting WASM build process..."
echo ""

bash build/tamil_seiyul_alagi_rust.sh
echo ""
# Prefer rsync on dev machines; Vercel/minimal images have no rsync — use cp fallback.
if command -v rsync >/dev/null 2>&1; then
  bash build/rsync_rust_wasm_to_web.sh
else
  bash build/copy_wasm_to_src.sh
fi

echo ""
echo "🎉 Build complete! WASM is ready in src/wasm/ and public/wasm/"