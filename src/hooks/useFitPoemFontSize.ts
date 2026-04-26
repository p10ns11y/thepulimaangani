import { useLayoutEffect, useState, type RefObject } from 'react'

const LINE_HEIGHT_FACTOR = 1.55
const TAMIL_STACK = `"Noto Sans Tamil", "Manrope", ui-sans-serif, sans-serif`

let measureCanvas: HTMLCanvasElement | null = null

function measureLineWidthPx(line: string, fontSizePx: number, fontWeight: number): number {
  if (!line) return 0
  if (!measureCanvas) measureCanvas = document.createElement('canvas')
  const ctx = measureCanvas.getContext('2d')
  if (!ctx) return 0
  ctx.font = `${fontWeight} ${fontSizePx}px ${TAMIL_STACK}`
  return ctx.measureText(line).width
}

function splitLines(text: string): string[] {
  if (!text) return ['']
  return text.replace(/\r\n/g, '\n').split('\n')
}

/**
 * Picks a font size so the poem’s longest line fits the container width
 * and the full block fits height — no soft wrapping, only newlines.
 */
export function useFitPoemFontSize(
  text: string,
  containerRef: RefObject<HTMLDivElement | null>,
  options: { minPx?: number; maxPx?: number; fontWeight?: number; padX?: number; padY?: number } = {},
): number {
  const { minPx = 10, maxPx = 24, fontWeight = 500, padX = 20, padY = 16 } = options
  const [fontSize, setFontSize] = useState(maxPx)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    const compute = () => {
      const w = el.clientWidth - padX
      const h = el.clientHeight - padY
      const lines = splitLines(text)
      if (w <= 0 || h <= 0) {
        setFontSize(minPx)
        return
      }
      if (lines.length === 0 || (lines.length === 1 && lines[0] === '')) {
        setFontSize(maxPx)
        return
      }

      let lo = minPx
      let hi = maxPx
      let best = minPx
      while (lo <= hi) {
        const mid = (lo + hi) >> 1
        const lineH = mid * LINE_HEIGHT_FACTOR
        let maxLineW = 0
        for (const line of lines) {
          maxLineW = Math.max(maxLineW, measureLineWidthPx(line, mid, fontWeight))
        }
        const totalH = lines.length * lineH
        if (maxLineW <= w && totalH <= h) {
          best = mid
          lo = mid + 1
        } else {
          hi = mid - 1
        }
      }
      setFontSize(best)
    }

    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [text, containerRef, minPx, maxPx, fontWeight, padX, padY])

  return fontSize
}

export { LINE_HEIGHT_FACTOR }
