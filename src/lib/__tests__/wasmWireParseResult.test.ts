import { describe, expect, it } from 'vitest'

import rawParseResult from '#/lib/__tests__/fixtures/samplePoemThreeLines.parseResult.json'
import {
  safeParseWasmWireJson,
  wasmJsonToParsedPoem,
  wasmWireJsonSchema,
} from '#/lib/wasmWireParseResult'

describe('wasmWireJsonSchema', () => {
  it('accepts committed real fixture and preserves extra top-level fields (passthrough)', () => {
    expect(
      (rawParseResult as { parse_result_schema_version?: number })
        .parse_result_schema_version,
    ).toBe(1)
    const withFutureKey = {
      ...rawParseResult,
      _future_wasm_field: { note: 'must survive schema for forward compatibility' },
    }
    const parsed = wasmWireJsonSchema.safeParse(withFutureKey)
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.original_text).toBeTypeOf('string')
      expect(Array.isArray(parsed.data.syllables)).toBe(true)
      expect(
        (parsed.data as typeof withFutureKey)._future_wasm_field,
      ).toEqual({ note: 'must survive schema for forward compatibility' })
    }
  })

  it('rejects when syllables is not an array', () => {
    const bad = { ...rawParseResult, syllables: null }
    expect(wasmWireJsonSchema.safeParse(bad).success).toBe(false)
  })
})

describe('wasmJsonToParsedPoem', () => {
  it('maps fixture JSON to a non-null ParsedPoem', () => {
    expect(wasmJsonToParsedPoem(rawParseResult)).not.toBeNull()
  })

  it('returns null with a ZodError from safeParseWasmWireJson when wire contract fails', () => {
    const parseOutcome = safeParseWasmWireJson({ original_text: 'x' })
    expect(parseOutcome.success).toBe(false)
    if (!parseOutcome.success) {
      expect(parseOutcome.error.issues.some((issue) => issue.path.includes('syllables'))).toBe(true)
    }
    expect(wasmJsonToParsedPoem({ original_text: 'x' })).toBeNull()
  })
})
