import { useEffect, useRef, type MutableRefObject } from 'react'

import { prng1 } from '#/lib/matrixPrng'

const N = 216

type GlyphState = {
  x: number
  y: number
  tx: number
  ty: number
  /** time (epoch ms) to pick a new target */
  nextPick: number
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}

function initState(i: number, now: number): GlyphState {
  const c = i % 18
  const r = (i - c) / 18
  const x = ((c + 0.5) / 18) * 100
  const y = ((r + 0.5) / 12) * 100
  return {
    x,
    y,
    tx: x,
    ty: y,
    nextPick: now + 800 + prng1(i) * 2200,
  }
}

function pickNewTarget(s: GlyphState, i: number, t: number): void {
  const far = prng1(i * 0.2 + 9) < 0.22
  const spread = far ? 42 + prng1(i * 0.3 + t * 0.00001) * 45 : 16 + prng1(i * 0.1) * 28
  s.tx = clamp(s.x + (prng1(i * 1.1 + 3) - 0.5) * spread, 4, 96)
  s.ty = clamp(s.y + (prng1(i * 1.2 + 5) - 0.5) * spread, 4, 96)
}

/**
 * Drives 216 absolutely positioned glyphs: slow lerp + occasional new targets + tiny
 * non-deterministic wobble. Non-blocking via rAF; direct `style` updates, no React re-render.
 */
export function useMatrixGlyphFlow(
  elRefs: MutableRefObject<(HTMLSpanElement | null)[]>,
  run: boolean,
): void {
  const states = useRef<GlyphState[] | null>(null)
  const rafId = useRef(0)
  if (states.current === null) {
    const now = typeof performance !== 'undefined' ? performance.now() : 0
    states.current = Array.from({ length: N }, (_, i) => initState(i, now))
  }

  useEffect(() => {
    if (!run) {
      if (rafId.current) cancelAnimationFrame(rafId.current)
      rafId.current = 0
      return
    }
    const S = states.current!
    // One sync so the first frame matches state (left/top are not in React `style` when run).
    for (let i = 0; i < N; i++) {
      const s = S[i]!
      const el = elRefs.current[i]
      if (el) {
        el.style.left = `${s.x}%`
        el.style.top = `${s.y}%`
      }
    }
    let last = performance.now()
    const tick = (t: number) => {
      const delta = Math.min(48, t - last)
      last = t
      // Very gentle easing — visible drift over many seconds, not a sprint
      const follow = 1 - Math.exp(-delta * 0.00011)

      for (let i = 0; i < N; i++) {
        const s = S[i]!
        s.x += (s.tx - s.x) * follow
        s.y += (s.ty - s.y) * follow
        s.x = clamp(s.x, 2.5, 97.5)
        s.y = clamp(s.y, 2.5, 97.5)

        // whisper of brownian motion (keeps the field alive; stays subtle)
        s.x = clamp(s.x + (Math.random() - 0.5) * 0.045, 2.5, 97.5)
        s.y = clamp(s.y + (Math.random() - 0.5) * 0.045, 2.5, 97.5)

        if (t >= s.nextPick) {
          pickNewTarget(s, i, t)
          s.nextPick = t + 4200 + prng1(i * 0.4 + 7) * 11_000
        }

        const el = elRefs.current[i]
        if (el) {
          el.style.left = `${s.x}%`
          el.style.top = `${s.y}%`
        }
      }
      rafId.current = requestAnimationFrame(tick)
    }
    rafId.current = requestAnimationFrame(tick)
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [run, elRefs])
}
