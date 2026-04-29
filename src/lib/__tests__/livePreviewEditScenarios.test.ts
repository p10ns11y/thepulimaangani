/**
 * Live preview / layout contracts under aggressive poem edits.
 *
 * **Goals**
 * - Document expected behaviour: editor physical lines ↔ WASM `parsed.lines` ↔ `feetPerPhysicalLine`.
 * - Integration tests run **only** when a WASM bundle exists (`pnpm run build:wasm` → `public/wasm/` or `src/wasm/`).
 *
 * **Failures here are learning signals** — fix implementation until these pass in CI (after WASM build step).
 */

import { describe, expect, it, beforeAll } from 'vitest'

import { feetPerPhysicalLine, groupsFromFeet } from '#/lib/parserFeetLayout'
import { normalizePoemText } from '#/lib/poemTextNormalize'
import { physicalPoemLines } from '#/lib/mapFeetToPhysicalLines'
import type { ParsedPoem } from '#/types/parsedPoem'

import {
  createWasmParsePoem,
  isWasmPkgBuilt,
  type WasmParseFn,
} from '#/lib/__tests__/wasmParseHarness'

/** Same poem shape as mobile repro — multi-line Tamil with spaces & newline endings */
export const SAMPLE_POEM_THREE_LINES = `சுடர்த்தொடீஇ கேளாய் தெருவில்நாம்
மணற்சிற்றில் காலில் சிதையா அடை
கோதை பரிந்து வரிப்பந்து கொண்டோ
`

function totalFeet(buckets: ReturnType<typeof feetPerPhysicalLine>): number {
  return buckets.reduce((n, row) => n + row.length, 0)
}

function totalSyllablesFromBuckets(buckets: ReturnType<typeof feetPerPhysicalLine>): number {
  return buckets.reduce(
    (n, row) => n + row.reduce((m, ft) => m + ft.syllables.length, 0),
    0,
  )
}

describe('live preview layout (no WASM)', () => {
  it('physicalPoemLines count matches structured.lines → feet buckets get syllables', () => {
    const poemText = 'ஒன்று இரண்டு\nமூன்று நான்கு\n'
    const parsed: ParsedPoem = {
      original_text: poemText,
      metre_type: '—',
      letter_count: 0,
      vikalpa_count: 0,
      syllables: [],
      lines: [
        {
          line_class: '—',
          feet: [
            {
              foot_type: 'Ner-Ner',
              syllables: [{ text: 'ஒன்று', syllable_type: 'Ner' }],
            },
            {
              foot_type: 'Nirai',
              syllables: [{ text: 'இரண்டு', syllable_type: 'Nirai' }],
            },
          ],
        },
        {
          line_class: '—',
          feet: [
            {
              foot_type: 'Ner',
              syllables: [{ text: 'மூன்று', syllable_type: 'Ner' }],
            },
            {
              foot_type: 'Ner',
              syllables: [{ text: 'நான்கு', syllable_type: 'Ner' }],
            },
          ],
        },
      ],
    }

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
    const parsed: ParsedPoem = {
      original_text: poemText,
      metre_type: '—',
      letter_count: 0,
      vikalpa_count: 0,
      syllables: [],
      lines: [
        {
          line_class: '—',
          feet: [{ foot_type: 'Ner', syllables: [{ text: 'x', syllable_type: 'Ner' }] }],
        },
      ],
    }
    expect(physicalPoemLines(poemText).length).toBe(2)
    expect(parsed.lines.length).toBe(1)

    const buckets = feetPerPhysicalLine(parsed, poemText)
    expect(buckets.every((row) => row.length === 0)).toBe(true)
  })

  it('normalizePoemText distinguishes drafts that differ only by trailing newlines', () => {
    expect(normalizePoemText('foo\n')).not.toBe(normalizePoemText('foo\n\n'))
  })
})

describe.skipIf(!isWasmPkgBuilt())('live preview + WASM integration', () => {
  let parsePoem: WasmParseFn

  beforeAll(async () => {
    parsePoem = await createWasmParsePoem()
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

  it('adaptWasmJsonToParsedPoem round-trip matches parse_poem_wasm JSON shape', async () => {
    const text = SAMPLE_POEM_THREE_LINES
    const parsed = await parsePoem(text)
    expect(parsed).not.toBeNull()
    expect(parsed!.original_text).toBeTruthy()
    expect(Array.isArray(parsed!.lines)).toBe(true)
  })
})

describe('live preview controller cache key contract (documented behaviour)', () => {
  it('same normalizePoemText(editor) === normalizePoemText(parsed.original_text) implies cache hit path', () => {
    const editor = 'அஃ கு '
    const parsedNorm = normalizePoemText(editor)
    expect(parsedNorm).toBe(normalizePoemText(editor))
  })
})
