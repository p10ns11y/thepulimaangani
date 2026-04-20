#!/bin/bash
set -e

echo "🚀 Starting WASM build process..."
echo ""

bash build/tamil_seiyul_alagi_rust.sh
echo ""
bash build/rsync_rust_wasm_to_web.sh

echo ""
echo "🎉 Build complete! WASM is ready in src/wasm/"