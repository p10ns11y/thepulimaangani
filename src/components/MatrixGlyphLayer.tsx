import { useRef, type CSSProperties } from 'react'

import { useMatrixGlyphFlow } from '#/hooks/useMatrixGlyphFlow'
import { usePrefersReducedMotion } from '#/hooks/usePrefersReducedMotion'
import { prng1 } from '#/lib/matrixPrng'

const COLS = 18
const ROWS = 12

type MatrixGlyphLayerProps = {
  chars: readonly string[]
  /** Same mask as the wire + depth stack */
  maskStyle: CSSProperties
}

/**
 * 216 absolute Tamil glyphs: slow lerp + targets across the full field (rAF, no grid prison).
 * Static grid positions when `prefers-reduced-motion: reduce` or `chars` is empty.
 */
export function MatrixGlyphLayer({ chars, maskStyle }: MatrixGlyphLayerProps) {
  const reduced = usePrefersReducedMotion()
  const elRefs = useRef<(HTMLSpanElement | null)[]>(new Array(216).fill(null))
  const run = !reduced && chars.length > 0
  useMatrixGlyphFlow(elRefs, run)

  if (chars.length === 0) return null

  return (
    <div
      className="absolute inset-0 z-[3] overflow-visible [contain:layout]"
      style={maskStyle}
    >
      {chars.map((char, i) => {
        const c = i % COLS
        const r = (i - c) / COLS
        const left = ((c + 0.5) / COLS) * 100
        const top = ((r + 0.5) / ROWS) * 100
        // When `run` is on, rAF owns left/top; putting them in React `style` would
        // re-apply the grid on every re-render and lock glyphs in cells.
        const baseStyle = {
          position: 'absolute' as const,
          fontSize: 'clamp(0.5rem, min(1.2vw, 1.7vh), 0.7rem)',
          transform: 'translate(-50%, -50%)',
          opacity: 0.48 + prng1(i * 0.5) * 0.4,
          zIndex: 1 + (i % 5),
        }
        return (
          <span
            key={i}
            ref={(el) => {
              elRefs.current[i] = el
            }}
            className="redpill-mx-glyph font-tamil text-[#5dff8a] select-none [text-shadow:0_0_10px_rgba(0,255,100,0.42)]"
            style={
              run
                ? baseStyle
                : { ...baseStyle, left: `${left}%`, top: `${top}%` }
            }
          >
            {char}
          </span>
        )
      })}
    </div>
  )
}
