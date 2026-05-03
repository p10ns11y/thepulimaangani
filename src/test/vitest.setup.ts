/**
 * Vitest global setup: serve real WASM bytes for `/wasm/thepulimaangani_parser_bg.wasm`
 * so jsdom tests run the actual parser (same artifact as `pnpm run build:wasm` → public/wasm).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { vi } from 'vitest'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')

const wasmCandidates = [
  path.join(repoRoot, 'public/wasm/thepulimaangani_parser_bg.wasm'),
  path.join(repoRoot, 'src/wasm/thepulimaangani_parser_bg.wasm'),
]

function readWasmBytes(): Buffer {
  for (const p of wasmCandidates) {
    if (fs.existsSync(p)) {
      return fs.readFileSync(p)
    }
  }
  throw new Error(
    'WASM binary not found. Run `pnpm run build:wasm` so `public/wasm/` (or `src/wasm/`) contains thepulimaangani_parser_bg.wasm.',
  )
}

const wasmBuf = readWasmBytes()

function matchesWasmRequest(url: string): boolean {
  return (
    url.endsWith('/wasm/thepulimaangani_parser_bg.wasm') ||
    url.includes('thepulimaangani_parser_bg.wasm')
  )
}

const origFetch = globalThis.fetch?.bind(globalThis)

vi.stubGlobal(
  'fetch',
  vi.fn((input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : typeof Request !== 'undefined' && input instanceof Request
            ? input.url
            : String(input)

    if (matchesWasmRequest(url)) {
      return Promise.resolve(
        new Response(wasmBuf, {
          status: 200,
          headers: { 'Content-Type': 'application/wasm' },
        }),
      )
    }
    if (origFetch) {
      return origFetch(input as RequestInfo, init)
    }
    throw new Error(`Unhandled fetch in tests: ${url}`)
  }),
)
