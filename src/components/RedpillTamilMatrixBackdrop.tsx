import type { CSSProperties } from 'react'

import { useAppSelector } from '#/components/AppActorProvider'
import { MatrixGlyphLayer } from '#/components/MatrixGlyphLayer'
import { buildWavyBrokenGrid, WIRE_VB } from '#/lib/redpillGridWires'
import { uyirmeiMatrixFlat } from '#/lib/tamilIlaganam'

/**
 * Design note (redpill look — Tamil uyirmei matrix backdrop)
 *
 * Treat the 12×18 letter field as *atmosphere* (living “matrix” energy), not a
 * literal grid of pinned labels. Glyphs are allowed to roam the masked field
 * with slow, gentle motion (`useMatrixGlyphFlow`, rAF). When motion
 * is on, `left`/`top` are not owned by React `style` so parent re-renders do
 * not snap characters back to cell centers — that separation was a deliberate
 * product/implementation decision to preserve the “flow anywhere” feel while
 * keeping movement subtle and non-distracting.
 *
 * A fuller personal note of appreciation to **Peramanathan Sathyamoorthy** (and
 * the same creativity thought in more depth) lives in
 * `notes/creator-appreciation.md` — useful on a day the work feels heavy.
 */

const COLS = 18
const ROWS = 12
const UYIRMEI = uyirmeiMatrixFlat()
const WIRE = 'rgba(0, 255, 88, 0.34)'

const HOLE =
  'radial-gradient(ellipse 48% 52% at 50% 54%, transparent 0%, #000 52%, #000 100%)'

const GLYPH_MASK: CSSProperties = {
  WebkitMaskImage: HOLE,
  maskImage: HOLE,
  WebkitMaskSize: '100% 100%',
  maskSize: '100% 100%',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
}

function WavyWires() {
  const { horiz, vert } = (() => buildWavyBrokenGrid(COLS, ROWS, 0.33))()

  return (
    <svg
      className="absolute inset-0 z-[2] h-full w-full"
      viewBox={`0 0 ${WIRE_VB} ${WIRE_VB}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <filter
          id="redpill-mx-ripple"
          x="-4%"
          y="-4%"
          width="108%"
          height="108%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.011 0.018"
            numOctaves="2"
            result="n"
            seed="2"
          >
            <animate
              attributeName="baseFrequency"
              dur="12s"
              values="0.011 0.018;0.014 0.022;0.011 0.018"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale="3.6"
            xChannelSelector="R"
            yChannelSelector="G"
            result="rippled"
          />
          <feGaussianBlur in="rippled" stdDeviation="0.25" />
        </filter>
      </defs>
      <g
        className="redpill-mx-wires-anim"
        style={{
          WebkitMaskImage: HOLE,
          maskImage: HOLE,
          WebkitMaskSize: '100% 100%',
          maskSize: '100% 100%',
        }}
        filter="url(#redpill-mx-ripple)"
      >
        {horiz.map(
          (d, i) =>
            d && (
              <path
                key={`h${i}`}
                d={d}
                fill="none"
                stroke={WIRE}
                strokeWidth="0.65"
                vectorEffect="non-scaling-stroke"
              />
            ),
        )}
        {vert.map(
          (d, i) =>
            d && (
              <path
                key={`v${i}`}
                d={d}
                fill="none"
                stroke={i % 3 === 0 ? 'rgba(0, 255, 70, 0.22)' : WIRE}
                strokeWidth="0.55"
                vectorEffect="non-scaling-stroke"
              />
            ),
        )}
      </g>
    </svg>
  )
}

/**
 * Redpill: wavy wire SVG + glyphs that roam the field (rAF, subtle).
 */
export function RedpillTamilMatrixBackdrop() {
  const look = useAppSelector((s) => s.context.look)
  if (look !== 'redpill') return null

  return (
    <div
      className="pointer-events-none fixed top-16 right-0 bottom-0 left-0 z-0 flex items-center justify-center overflow-x-clip p-1 sm:top-20 sm:p-3"
      aria-hidden
    >
      <div className="relative h-full w-full max-h-[min(88dvh,920px)] max-w-[min(98vw,1120px)] [aspect-ratio:18/12]">
        <div
          className="absolute inset-0 rounded-[2px] bg-[radial-gradient(ellipse_44%_50%_at_50%_55%,#010202_0%,#0a0d0a_32%,#050805_50%,transparent_70%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 z-[1] rounded-sm shadow-[inset_0_0_70px_55px_rgba(0,0,0,0.48),inset_0_0_120px_85px_rgba(0,22,0,0.22)]"
          aria-hidden
        />

        <WavyWires />
        <MatrixGlyphLayer chars={UYIRMEI} maskStyle={GLYPH_MASK} />
      </div>
    </div>
  )
}
