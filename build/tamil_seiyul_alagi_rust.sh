#!/bin/bash
set -e

echo "🔨 [1/2] Building Rust WebAssembly parser..."

cd tamil-seiyul-alagi

# Product WASM: omit offline ml-eval research modules (smaller cdylib). Host/tests use default features.
wasm-pack build --target web --out-dir pkg -- --no-default-features
cd ..

echo "✅ Rust build complete"