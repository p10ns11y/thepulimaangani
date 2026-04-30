/**
 * Live preview layout: editor physical lines ↔ `parsed.lines` ↔ `feetPerPhysicalLine`.
 *
 * The multi-line sample uses **committed real parser output** (`samplePoemThreeLines.parseResult.json`)
 * so tests never hand-invent Ner/Nirai on Tamil surface forms.
 *
 * WASM integration tests run only when a bundle exists (`pnpm run build:wasm`).
 */

import { beforeAll, describe, expect, it } from 'vitest'

import { feetPerPhysicalLine, groupsFromFeet } from '#/lib/parserFeetLayout'
import { normalizePoemText } from '#/lib/poemTextNormalize'
import { physicalPoemLines } from '#/lib/mapFeetToPhysicalLines'

import {
  assertSamplePhysicalLineCount,
  parsedSampleFirstTwoLines,
  parsedSampleThreeLines,
  SAMPLE_POEM_THREE_LINES,
} from '#/lib/__tests__/fixtures/samplePoemThreeLines.fixture'
import {
  createWasmParsePoem,
  createWasmParseRaw,
  isWasmPkgBuilt,
  type WasmParseFn,
  type WasmParseRawFn,
} from '#/lib/__tests__/wasmParseHarness'
import { adaptWasmJsonToParsedPoem } from '#/lib/adaptWasmParseJson'

export { SAMPLE_POEM_THREE_LINES }

function totalFeet(buckets: ReturnType<typeof feetPerPhysicalLine>): number {
  return buckets.reduce((n, row) => n + row.length, 0)
}

function totalSyllablesFromBuckets(buckets: ReturnType<typeof feetPerPhysicalLine>): number {
  return buckets.reduce(
    (n, row) => n + row.reduce((m, ft) => m + ft.syllables.length, 0),
    0,
  )
}

function flattenFootSyllableTexts(lineFeet: ReturnType<typeof feetPerPhysicalLine>[number]): string[] {
  return lineFeet.flatMap((ft) => ft.syllables.map((s) => s.text))
}

function isFirstRowOnlyEntirePoemLayout(
  buckets: ReturnType<typeof feetPerPhysicalLine>,
  totalSyllablesInParse: number,
): boolean {
  if (buckets.length < 2) return false
  const s0 = flattenFootSyllableTexts(buckets[0] ?? []).length
  const sRest = buckets
    .slice(1)
    .reduce((n, row) => n + flattenFootSyllableTexts(row).length, 0)
  return s0 > 0 && sRest === 0 && s0 === totalSyllablesInParse && totalSyllablesInParse > 4
}

describe('live preview layout (no WASM)', () => {
  it('first two lines of the sample poem: real parser feet align with physical lines', () => {
    assertSamplePhysicalLineCount()
    const parsed = parsedSampleFirstTwoLines()
    const poemText = parsed.original_text

    expect(physicalPoemLines(poemText).length).toBe(parsed.lines.length)

    const buckets = feetPerPhysicalLine(parsed, poemText)
    expect(buckets.length).toBe(2)
    expect(totalFeet(buckets)).toBeGreaterThan(0)
    expect(totalSyllablesFromBuckets(buckets)).toBeGreaterThan(0)

    const row0 = groupsFromFeet(buckets[0] ?? [])
    expect(row0.length).toBeGreaterThan(0)
    expect(row0.every((g) => g.syllables.length > 0)).toBe(true)
  })

  it('when editor lines ≠ structured.lines, buckets are empty (no wrong-row bleed)', () => {
    const poemText = 'a\nb\n'
    const parsed = parsedSampleThreeLines()
    const oneLine = { ...parsed, lines: [parsed.lines[0]!] }
    expect(physicalPoemLines(poemText).length).toBe(2)
    expect(oneLine.lines.length).toBe(1)

    const buckets = feetPerPhysicalLine(oneLine, poemText)
    expect(buckets.every((row) => row.length === 0)).toBe(true)
  })

  it('normalizePoemText distinguishes drafts that differ only by trailing newlines', () => {
    expect(normalizePoemText('foo\n')).not.toBe(normalizePoemText('foo\n\n'))
  })
})

describe.skipIf(!isWasmPkgBuilt())('live preview + WASM integration', () => {
  let parsePoem: WasmParseFn
  let parseRaw: WasmParseRawFn

  beforeAll(async () => {
    ;[parsePoem, parseRaw] = await Promise.all([createWasmParsePoem(), createWasmParseRaw()])
  })

  it('parses sample poem and returns structured lines count matching physicalPoemLines', async () => {
    const text = SAMPLE_POEM_THREE_LINES
    const parsed = await parsePoem(text)
    expect(parsed).not.toBeNull()
    const p = parsed!

    const phys = physicalPoemLines(text)
    expect(p.lines.length).toBeGreaterThan(0)
    expect(
      phys.length,
      'editor physical line count must equal WASM ParseResult.lines length for chip sync',
    ).toBe(p.lines.length)

    const buckets = feetPerPhysicalLine(p, text)
    expect(totalFeet(buckets)).toBeGreaterThan(0)
    expect(totalSyllablesFromBuckets(buckets)).toBeGreaterThan(0)

    const s0 = flattenFootSyllableTexts(buckets[0] ?? []).length
    expect(
      s0 < p.syllables.length,
      'first physical row must not show every syllable of the poem (regression: collapsed legacy lines)',
    ).toBe(true)
    expect(isFirstRowOnlyEntirePoemLayout(buckets, p.syllables.length)).toBe(false)
    expect(totalSyllablesFromBuckets(buckets)).toBe(p.syllables.length)

    for (let i = 0; i < buckets.length; i++) {
      const groups = groupsFromFeet(buckets[i] ?? [])
      expect(
        groups.length,
        `line ${i} should show at least one word group when layout matches`,
      ).toBeGreaterThan(0)
    }
  })

  it('every step in an aggressive edit sequence stays layout-aligned or intentionally empties chips', async () => {
    const steps: string[] = [
      SAMPLE_POEM_THREE_LINES.trim(),
      SAMPLE_POEM_THREE_LINES,
      SAMPLE_POEM_THREE_LINES.split('\n').reverse().join('\n'),
      SAMPLE_POEM_THREE_LINES.replace(/\n/g, '\n\n'),
      SAMPLE_POEM_THREE_LINES + '\n\n',
      `${SAMPLE_POEM_THREE_LINES}\r\n`,
      SAMPLE_POEM_THREE_LINES.split('\n')[0] ?? '',
      SAMPLE_POEM_THREE_LINES.replace('கோதை', ''),
      'கற்றது மொழிந்தது\nஅறிந்தவர் சொல்லும் வழி',
      'ஒரே வரியில் மட்டும் எல்லாம்',
    ]

    for (let step = 0; step < steps.length; step++) {
      const text = steps[step]!
      const parsed = await parsePoem(text)
      if (!parsed) continue

      const phys = physicalPoemLines(text)
      const buckets = feetPerPhysicalLine(parsed, text)

      expect(buckets.length).toBe(phys.length)

      if (phys.length === parsed.lines.length) {
        expect(
          totalSyllablesFromBuckets(buckets),
          `step ${step}: aligned layout should surface syllables`,
        ).toBeGreaterThan(0)
      } else {
        expect(
          buckets.every((r) => r.length === 0),
          `step ${step}: mismatched counts should avoid placing feet on wrong rows`,
        ).toBe(true)
      }
    }
  })

  it('multi-line sample: total syllables partition across rows (not collapsed into row 0)', async () => {
    const text = SAMPLE_POEM_THREE_LINES
    const parsed = await parsePoem(text)
    expect(parsed).not.toBeNull()
    const buckets = feetPerPhysicalLine(parsed!, text)
    expect(totalSyllablesFromBuckets(buckets)).toBe(parsed!.syllables.length)
    const maxSingleRow = Math.max(
      ...buckets.map((row) => flattenFootSyllableTexts(row).length),
      0,
    )
    expect(maxSingleRow).toBeLessThan(parsed!.syllables.length)
  })

  it('deleting lines or fragments: no “whole poem on row 0” when counts stay aligned', async () => {
    const variants = [
      SAMPLE_POEM_THREE_LINES.split('\n').slice(0, 2).join('\n') + '\n',
      SAMPLE_POEM_THREE_LINES.replace(/\n.+$/s, ''),
      SAMPLE_POEM_THREE_LINES.trim(),
      SAMPLE_POEM_THREE_LINES.replace(/கோதை\s*/, ''),
    ]
    for (let i = 0; i < variants.length; i++) {
      const text = variants[i]!
      const parsed = await parsePoem(text)
      if (!parsed) continue
      const phys = physicalPoemLines(text)
      if (phys.length < 2 || phys.length !== parsed.lines.length) continue
      const buckets = feetPerPhysicalLine(parsed, text)
      expect(isFirstRowOnlyEntirePoemLayout(buckets, parsed.syllables.length)).toBe(false)
      expect(totalSyllablesFromBuckets(buckets)).toBe(parsed.syllables.length)
    }
  })

  it('WASM output matches committed fixture (adapter parity)', async () => {
    const text = SAMPLE_POEM_THREE_LINES
    const raw = await parseRaw(text)
    expect(raw).not.toBeNull()
    const viaAdapter = adaptWasmJsonToParsedPoem(raw!)
    const fixture = parsedSampleThreeLines()
    expect(viaAdapter).not.toBeNull()
    expect(viaAdapter!.lines.length).toBe(fixture.lines.length)
    expect(viaAdapter!.lines.map((ln) => ln.feet.length)).toEqual(fixture.lines.map((ln) => ln.feet.length))
    const viaHarness = await parsePoem(text)
    expect(viaHarness!.lines.map((ln) => ln.feet.length)).toEqual(fixture.lines.map((ln) => ln.feet.length))
  })
})
