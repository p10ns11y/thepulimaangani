import { z } from 'zod'

import { adaptWasmJsonToParsedPoem } from '#/lib/adaptWasmParseJson'
import type { ParseResultWire } from '#/generated/parseResultWire'
import type { ParsedPoem } from '#/types/parsedPoem'

export type { ParseResultWire } from '#/generated/parseResultWire'

/**
 * Minimum WASM `ParseResult` JSON contract before {@link adaptWasmJsonToParsedPoem}.
 * Runtime validation checks only what the adapter needs first; TypeScript shape comes from
 * OpenAPI-generated {@link ParseResultWire} (`pnpm run codegen:parse-result-client`).
 *
 * Full-graph runtime Zod aligned with OpenAPI is a future step; see
 * `tamil-seiyul-alagi/CANONICAL_JSON_TRAVERSAL.md` (“TypeScript vs runtime validation”).
 *
 * Uses `.passthrough()` so new Rust/WASM fields are preserved without schema churn.
 * Keys stay snake_case — same as serde JSON output.
 */
export const wasmWireJsonSchema = z
  .object({
    original_text: z.string(),
    syllables: z.array(z.unknown()),
  })
  .passthrough()

/**
 * Successfully parsed wire JSON: OpenAPI `ParseResult` plus unknown keys from `.passthrough()`
 * (forward-compatible extra fields from WASM).
 */
export type WasmWireParseJson = ParseResultWire & Record<string, unknown>

export type SafeParseWasmWireResult =
  | { success: true; data: WasmWireParseJson }
  | { success: false; error: z.ZodError }

export function safeParseWasmWireJson(data: unknown): SafeParseWasmWireResult {
  const wireValidation = wasmWireJsonSchema.safeParse(data)
  if (wireValidation.success) {
    return {
      success: true,
      data: wireValidation.data as WasmWireParseJson,
    }
  }
  return { success: false, error: wireValidation.error }
}

/**
 * Validates WASM wire JSON (Zod) then maps to {@link ParsedPoem}.
 * Prefer this over calling {@link adaptWasmJsonToParsedPoem} on raw `unknown`.
 */
export function wasmJsonToParsedPoem(data: unknown): ParsedPoem | null {
  const wireParseOutcome = safeParseWasmWireJson(data)
  if (!wireParseOutcome.success) return null
  return adaptWasmJsonToParsedPoem(wireParseOutcome.data)
}
