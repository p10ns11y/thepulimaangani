import { z } from 'zod'

import { adaptWasmJsonToParsedPoem } from '#/lib/adaptWasmParseJson'
import type { ParsedPoem } from '#/types/parsedPoem'

/**
 * Minimum WASM `ParseResult` JSON contract before {@link adaptWasmJsonToParsedPoem}.
 * Matches its guard: `original_text` must be a string and `syllables` must be an array.
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

export type WasmWireParseJson = z.infer<typeof wasmWireJsonSchema>

export type SafeParseWasmWireResult =
  | { success: true; data: WasmWireParseJson }
  | { success: false; error: z.ZodError }

export function safeParseWasmWireJson(data: unknown): SafeParseWasmWireResult {
  const wireValidation = wasmWireJsonSchema.safeParse(data)
  if (wireValidation.success) {
    return { success: true, data: wireValidation.data }
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
