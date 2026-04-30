/**
 * Live preview layout: physical editor lines ↔ `parsed.lines` ↔ `feetPerPhysicalLine`.
 *
 * WASM-backed tests run only when a bundle exists (`pnpm run build:wasm`).
 */

import { beforeAll, describe, expect, it } from 'vitest'

import { feetPerPhysicalLine, groupsFromFeet } from '#/lib/parserFeetLayout'
import { physicalPoemLines } from '#/lib/mapFeetToPhysicalLines'
import { normalizePoemText } from '#/lib/poemTextNormalize'
import {
  flattenFootSyllableTexts,
  isFirstRowOnlyEntirePoemLayout,
  totalFeet,
  totalSyllablesFromBuckets,
} from '#/lib/__tests__/fixtures/livePreviewLayoutHelpers'
import {
  parsedFoot,
  parsedLine,
  parsedPoem,
  parsedSyllable,
} from '#/lib/__tests__/fixtures/parsedPoemBuilders'
import { SAMPLE_POEM_THREE_LINES } from '#/lib/__tests__/fixtures/sampleTamilPoems'
import { adaptWasmJsonToParsedPoem } from '#/lib/adaptWasmParseJson'
import {
  createWasmParsePoem,
  createWasmParseRaw,
  isWasmPkgBuilt,
  type WasmParseFn,
  type WasmParseRawFn,
} from '#/lib/__tests__/wasmParseHarness'

export { SAMPLE_POEM_THREE_LINES }

describe('live preview layout (no WASM)', () => {
  it('when physical line count equals parsed.lines, feet and groups are populated', () => {
    const poemText = 'ஒன்று இரண்டு\nமூன்று நான்கு\n'
    const parsed = parsedPoem({
      original_text: poemText,
      lines: [
        parsedLine([
          parsedFoot('Ner-Ner', [parsedSyllable('ஒன்று', 'Ner')]),
          parsedFoot('Nirai', [parsedSyllable('இரண்டு', 'Nirai')]),
        ]),
        parsedLine([
          parsedFoot('Ner', [parsedSyllable('மூன்று', 'Ner')]),
          parsedFoot('Ner', [parsedSyllable('நான்கு', 'Ner')]),
        ]),
      ],
    })

    expect(physicalPoemLines(poemText).length).toBe(parsed.lines.length)

    const buckets = feetPerPhysicalLine(parsed, poemText)
    expect(buckets.length).toBe(2)
    expect(totalFeet(buckets)).toBeGreaterThan(0)
    expect(totalSyllablesFromBuckets(buckets)).toBeGreaterThan(0)

    const row0 = groupsFromFeet(buckets[0] ?? [])
    expect(row0.length).toBeGreaterThan(0)
    expect(row0.every((g) => g.syllables.length > 0)).toBe(true)
  })

  it('when physical line count ≠ parsed.lines, every bucket is empty', () => {
    const poemText = 'a\nb\n'
    const parsed = parsedPoem({
      original_text: poemText,
      lines: [parsedLine([parsedFoot('Ner', [parsedSyllable('x', 'Ner')])])],
    })
    expect(physicalPoemLines(poemText).length).toBe(2)
    expect(parsed.lines.length).toBe(1)

    const buckets = feetPerPhysicalLine(parsed, poemText)
    expect(buckets.every((row) => row.length === 0)).toBe(true)
  })

  it('normalizePoemText differs for drafts that only differ by trailing newlines', () => {
    expect(normalizePoemText('foo\n')).not.toBe(normalizePoemText('foo\n\n'))
  })
})

describe.skipIf(!isWasmPkgBuilt())('live preview + WASM integration', () => {
  let parsePoem: WasmParseFn
  let parseRaw: WasmParseRawFn

  beforeAll(async () => {
    ;[parsePoem, parseRaw] = await Promise.all([createWasmParsePoem(), createWasmParseRaw()])
  })

  it('sample poem: physical lines match WASM lines; syllables not collapsed to row 0', async () => {
    const text = SAMPLE_POEM_THREE_LINES
    const parsed = await parsePoem(text)
    expect(parsed).not.toBeNull()
    const p = parsed!

    const phys = physicalPoemLines(text)
    expect(p.lines.length).toBeGreaterThan(0)
    expect(phys.length, 'editor lines must match WASM ParseResult.lines for chip sync').toBe(
      p.lines.length,
    )

    const buckets = feetPerPhysicalLine(p, text)
    expect(totalFeet(buckets)).toBeGreaterThan(0)
    expect(totalSyllablesFromBuckets(buckets)).toBeGreaterThan(0)

    const s0 = flattenFootSyllableTexts(buckets[0] ?? []).length
    expect(
      s0 < p.syllables.length,
      'first row must not contain every syllable (regression: collapsed legacy lines)',
    ).toBe(true)
    expect(isFirstRowOnlyEntirePoemLayout(buckets, p.syllables.length)).toBe(false)
    expect(totalSyllablesFromBuckets(buckets)).toBe(p.syllables.length)

    for (let i = 0; i < buckets.length; i++) {
      const groups = groupsFromFeet(buckets[i] ?? [])
      expect(groups.length, `line ${i} needs at least one word group when aligned`).toBeGreaterThan(
        0,
      )
    }
  })

  it('edit sequence: aligned steps show syllables; misaligned steps use empty buckets', async () => {
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
        expect(totalSyllablesFromBuckets(buckets), `step ${step}: aligned layout surfaces syllables`).toBeGreaterThan(0)
      } else {
        expect(
          buckets.every((r) => r.length === 0),
          `step ${step}: misaligned counts must not place feet on wrong rows`,
        ).toBe(true)
      }
    }
  })

  it('multi-line sample: syllable count partitions across rows', async () => {
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

  it('adaptWasmJsonToParsedPoem on raw WASM JSON matches harness ParsedPoem', async () => {
    const text = SAMPLE_POEM_THREE_LINES
    const raw = await parseRaw(text)
    expect(raw).not.toBeNull()
    const viaAdapter = adaptWasmJsonToParsedPoem(raw!)
    const viaHarness = await parsePoem(text)
    expect(viaAdapter).not.toBeNull()
    expect(viaHarness).not.toBeNull()
    expect(viaAdapter!.lines.length).toBe(viaHarness!.lines.length)
    expect(viaAdapter!.lines.map((ln) => ln.feet.length)).toEqual(
      viaHarness!.lines.map((ln) => ln.feet.length),
    )
  })
})
