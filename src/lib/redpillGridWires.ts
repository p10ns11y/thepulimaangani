import { prng1 } from '#/lib/matrixPrng'

const V = 1000
export const WIRE_VB = V
const N_STEPS = 220

type Paths = { horiz: string[]; vert: string[] }

/**
 * Wavy, broken polylines for a (rows+1) × (cols+1) line grid in viewBox 0..V.
 */
export function buildWavyBrokenGrid(cols: number, rows: number, seed = 0): Paths {
  const horiz: string[] = []
  const vert: string[] = []

  for (let r = 0; r <= rows; r++) {
    if (prng1(seed + r * 0.71) < 0.07) {
      horiz.push('')
      continue
    }
    const baseY = (r * V) / rows
    const segs: string[] = []
    for (let k = 0; k <= N_STEPS; k++) {
      const x = (k * V) / N_STEPS
      if (prng1(seed + 13.1 + r * 1.1 + k * 0.08) < 0.26) {
        if (segs.length) segs.push('__BREAK__')
        continue
      }
      const wobble =
        5.5 * Math.sin((x / 95) * Math.PI * 2 + r * 0.8 + seed) +
        3.2 * Math.sin((x / 38) * Math.PI * 1.5 + r * 0.2) +
        1.4 * Math.sin((x + r * 20) / 17)
      const y = baseY + wobble
      segs.push(`${x.toFixed(1)} ${y.toFixed(1)}`)
    }
    horiz.push(joinBrokenPolyline(segs))
  }

  for (let c = 0; c <= cols; c++) {
    if (prng1(seed + 29.3 + c * 0.64) < 0.07) {
      vert.push('')
      continue
    }
    const baseX = (c * V) / cols
    const segs: string[] = []
    for (let k = 0; k <= N_STEPS; k++) {
      const y = (k * V) / N_STEPS
      if (prng1(seed + 17.2 + c * 0.91 + k * 0.09) < 0.26) {
        if (segs.length) segs.push('__BREAK__')
        continue
      }
      const wobble =
        4.5 * Math.sin((y / 88) * Math.PI * 2 + c * 0.9 + seed * 0.2) +
        2.8 * Math.sin((y / 35) * Math.PI * 1.2 + c * 0.3) +
        1.1 * Math.sin((y + c * 16) / 20)
      const x = baseX + wobble
      segs.push(`${x.toFixed(1)} ${y.toFixed(1)}`)
    }
    vert.push(joinBrokenPolyline(segs))
  }

  return { horiz, vert }
}

function onePolyline(pts: string[]): string {
  if (pts.length === 0) return ''
  return `M${pts[0]}` + pts.slice(1).map((p) => `L${p}`).join(' ')
}

function joinBrokenPolyline(points: string[]): string {
  if (points.length === 0) return ''
  const parts: string[] = []
  let cur: string[] = []
  for (const p of points) {
    if (p === '__BREAK__') {
      if (cur.length) {
        parts.push(onePolyline(cur))
        cur = []
      }
    } else {
      cur.push(p)
    }
  }
  if (cur.length) {
    parts.push(onePolyline(cur))
  }
  return parts.join(' ')
}
