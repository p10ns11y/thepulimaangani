/**
 * Load Rust WASM parser for Vitest integration tests.
 *
 * Resolution order (same artifacts as `pnpm run build:wasm`):
 * 1. `public/wasm/` — copied for static serving (preferred)
 * 2. `src/wasm/` — same copy for app imports
 * 3. `tamil-seiyul-alagi/pkg/` — raw wasm-pack output
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { wasmJsonToParsedPoem } from '#/lib/wasmWireParseResult'
import type { ParsedPoem } from '#/types/parsedPoem'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
/** Repo root: `src/lib/__tests__` → `../../../` */
export const WORKSPACE_ROOT = path.resolve(__dirname, '../../..')

const WASM_BUNDLE_DIRS = [
  path.join(WORKSPACE_ROOT, 'public/wasm'),
  path.join(WORKSPACE_ROOT, 'src/wasm'),
  path.join(WORKSPACE_ROOT, 'tamil-seiyul-alagi/pkg'),
] as const

function resolveWasmBundle(): { js: string; wasm: string } | null {
  for (const dir of WASM_BUNDLE_DIRS) {
    const js = path.join(dir, 'thepulimaangani_parser.js')
    const wasm = path.join(dir, 'thepulimaangani_parser_bg.wasm')
    if (fs.existsSync(js) && fs.existsSync(wasm)) {
      return { js, wasm }
    }
  }
  return null
}

export function isWasmPkgBuilt(): boolean {
  return resolveWasmBundle() != null
}

export type WasmParseFn = (poemText: string) => Promise<ParsedPoem | null>

export type WasmParseRawFn = (poemText: string) => Promise<unknown | null>

/** Throws if bundle missing — callers should guard with `isWasmPkgBuilt()`. */
export async function createWasmParsePoem(): Promise<WasmParseFn> {
  const parseRaw = await createWasmParseRaw()
  return async (poemText: string) => {
    const json = await parseRaw(poemText)
    return json == null ? null : wasmJsonToParsedPoem(json)
  }
}

/** Raw JSON from `parse_poem_wasm` (before {@link wasmJsonToParsedPoem}). */
export async function createWasmParseRaw(): Promise<WasmParseRawFn> {
  const bundle = resolveWasmBundle()
  if (!bundle) {
    throw new Error(
      'WASM bundle not found. Run `pnpm run build:wasm` (outputs public/wasm/ and src/wasm/).',
    )
  }
  const wasmBuf = fs.readFileSync(bundle.wasm)
  const mod = await import(pathToFileURL(bundle.js).href)
  await mod.default({ module_or_path: wasmBuf })

  const parse_poem_wasm = mod.parse_poem_wasm as (text: string) => string

  return async (poemText: string) => {
    const raw = parse_poem_wasm(poemText)
    if (typeof raw !== 'string' || raw.includes('Error:')) return null
    try {
      return JSON.parse(raw) as unknown
    } catch {
      return null
    }
  }
}
