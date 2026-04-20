#!/bin/bash
set -e

echo "🔨 [1/2] Building Rust WebAssembly parser..."

cd rust-parser

wasm-pack build --target web --out-dir pkg
cd ..

echo "✅ Rust build complete"