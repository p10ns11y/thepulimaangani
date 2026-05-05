import { describe, expect, it } from 'vitest'

import type { ParseResultWire } from '#/generated/parseResultWire'

import samplePoemThreeLinesParseResultJson from './fixtures/samplePoemThreeLines.parseResult.json'

describe('ParseResultWire (OpenAPI-generated)', () => {
  it('accepts the regenerated sample poem fixture shape', () => {
    const wasmParseResult: ParseResultWire =
      samplePoemThreeLinesParseResultJson as ParseResultWire

    expect(typeof wasmParseResult.original_text).toBe('string')
    expect(Array.isArray(wasmParseResult.syllables)).toBe(true)
    expect(typeof wasmParseResult.parse_result_schema_version).toBe('number')
  })
})
