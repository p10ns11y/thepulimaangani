/** @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  buildPrintableHtml,
  downloadHtmlFile,
  openPrintableView,
} from '#/lib/prosody/printView'
import {
  parsedFoot,
  parsedLine,
  parsedPoem,
  parsedSyllable,
} from '#/lib/__tests__/fixtures/parsedPoemBuilders'

describe('buildPrintableHtml', () => {
  it('includes poem text, metre, and line structure for print/PDF', () => {
    const poem = parsedPoem({
      original_text: 'தமிழ்\nபாடம்',
      metre_type: 'வெண்பா',
      vikalpa_count: 2,
      presentation: { metre_type: 'வெண்பா · presentation', feet: [], talai: [] },
      lines: [
        parsedLine([parsedFoot('Ner', [parsedSyllable('தமிழ்', 'Ner')])]),
        parsedLine([parsedFoot('Nirai', [parsedSyllable('பாடம்', 'Nirai')])]),
      ],
      linkage: [
        {
          from_foot: 0,
          to_foot: 1,
          linkage_type: 'VenTalai',
          linkage_special_type: 'IyarcirVenTalai',
          is_valid: true,
        },
        {
          from_foot: 1,
          to_foot: 2,
          linkage_type: 'VenTalai',
          linkage_special_type: 'Unknown',
          is_valid: false,
        },
      ],
    })
    const html = buildPrintableHtml(poem.original_text, poem)
    expect(html).toMatch(/<!DOCTYPE html>/i)
    expect(html).toContain('தமிழ்')
    expect(html).toContain('வெண்பா · presentation')
    expect(html).toContain('Metre · பா')
    expect(html).toContain('Vikalpa')
    expect(html).toContain('Line 1')
    // UI Tamil labels — not raw wire keys
    expect(html).toContain('நேர்')
    expect(html).toMatch(/இயற்சீர் வெண்டளை|IyarcirVenTalai/)
    expect(html).toContain('இயற்சீர் வெண்டளை')
    expect(html).not.toContain('IyarcirVenTalai')
    expect(html).toContain('invalid')
    expect(html).toMatch(/@media print/)
    const withLt = buildPrintableHtml('a < b', null)
    expect(withLt).toContain('a &lt; b')
    expect(withLt).not.toContain('a < b')
    expect(withLt).toContain('No bonds in this parse')
  })

  it('truncates long bond lists and prefers generic linkage labels', () => {
    const linkage = Array.from({ length: 50 }, (_, i) => ({
      from_foot: i,
      to_foot: i + 1,
      linkage_type: 'VenTalai',
      linkage_special_type: 'Unknown',
      is_valid: true,
    }))
    const poem = parsedPoem({
      original_text: 'x',
      lines: [parsedLine([parsedFoot('Ner', [parsedSyllable('x', 'Ner')])])],
      linkage,
    })
    const html = buildPrintableHtml(poem.original_text, poem)
    expect(html).toMatch(/…and 2 more/)
  })
})

describe('openPrintableView / downloadHtmlFile', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('writes HTML and schedules print when a window opens', () => {
    vi.useFakeTimers()
    const print = vi.fn()
    const focus = vi.fn()
    const doc = {
      open: vi.fn(),
      write: vi.fn(),
      close: vi.fn(),
    }
    const open = vi.spyOn(window, 'open').mockReturnValue({
      document: doc,
      focus,
      print,
    } as unknown as Window)
    expect(openPrintableView('<html>ok</html>')).toBe(true)
    expect(open).toHaveBeenCalled()
    expect(doc.write).toHaveBeenCalledWith('<html>ok</html>')
    expect(focus).toHaveBeenCalled()
    vi.advanceTimersByTime(250)
    expect(print).toHaveBeenCalled()
  })

  it('returns false when the popup is blocked', () => {
    vi.spyOn(window, 'open').mockReturnValue(null)
    expect(openPrintableView('<html/>')).toBe(false)
  })

  it('downloads HTML via a temporary object URL', () => {
    const click = vi.fn()
    const createEl = vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      rel: '',
      click,
    } as unknown as HTMLAnchorElement)
    const createObjectURL = vi.fn(() => 'blob:test')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL,
      revokeObjectURL,
    })
    downloadHtmlFile('<html>x</html>', 'poem.html')
    expect(createObjectURL).toHaveBeenCalled()
    expect(createEl).toHaveBeenCalledWith('a')
    expect(click).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test')
  })
})

