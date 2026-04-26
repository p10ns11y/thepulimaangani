import { describe, expect, it } from 'vitest'

import { buildWavyBrokenGrid, WIRE_VB } from '#/lib/redfillGridWires'

describe('buildWavyBrokenGrid', () => {
  it('produces 13 horizontal and 19 vertical line slots for 12x18', () => {
    const { horiz, vert } = buildWavyBrokenGrid(18, 12, 0.5)
    expect(horiz).toHaveLength(13)
    expect(vert).toHaveLength(19)
  })

  it('has many non-empty wavy path strings', () => {
    const { horiz, vert } = buildWavyBrokenGrid(18, 12, 1.1)
    const hOk = horiz.filter((d) => d && d.length > 8).length
    const vOk = vert.filter((d) => d && d.length > 8).length
    expect(hOk).toBeGreaterThan(8)
    expect(vOk).toBeGreaterThan(10)
  })

  it('paths start with M and contain L (polyline segments)', () => {
    const { horiz, vert } = buildWavyBrokenGrid(18, 12, 2.2)
    const all = [...horiz, ...vert].filter(Boolean)
    for (const p of all.slice(0, 3)) {
      expect(p!.trim().startsWith('M')).toBe(true)
      expect(p!.includes('L')).toBe(true)
    }
  })

  it('viewBox size constant is stable', () => {
    expect(WIRE_VB).toBe(1000)
  })
})
