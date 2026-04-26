import { useEffect, useRef, useState } from 'react'

import { cn } from '#/lib/utils'

import { TAMIL_PRETEXT_FONT } from './pretextConstants'

/** Warm module so the first layout pass is not blocked on dynamic import. */
const pretextModulePromise = import('@chenglou/pretext')

type PretextLineViewportProps = {
  text: string
  className?: string
  /** CSS pixel line height used for layout and row rhythm. */
  lineHeightPx?: number
  /** Canvas / Pretext font string (weight size family…). */
  font?: string
  /**
   * When false, uses `text` as-is for measurement (per-line slices). Default true trims whole string.
   */
  trimForMeasure?: boolean
}

/**
 * Client-side line breaking via [@chenglou/pretext](https://learn-pretext.com/).
 * SSR / first paint: falls back to a plain pre-wrap block with the same text.
 */
export function PretextLineViewport({
  text,
  className,
  lineHeightPx = 28,
  font = TAMIL_PRETEXT_FONT,
  trimForMeasure = true,
}: PretextLineViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [lines, setLines] = useState<string[] | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setWidth(el.clientWidth)
    })
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const source = trimForMeasure ? text.trim() : text.replace(/\r\n/g, '\n')
    if (!source || width <= 0) {
      setLines(null)
      return
    }
    let cancelled = false
    void pretextModulePromise.then(({ prepareWithSegments, layoutWithLines }) => {
      if (cancelled) return
      try {
        const prepared = prepareWithSegments(source, font, {
          whiteSpace: 'pre-wrap',
        })
        const { lines: layoutLines } = layoutWithLines(prepared, width, lineHeightPx)
        setLines(layoutLines.map((l) => l.text))
      } catch {
        setLines(null)
      }
    })
    return () => {
      cancelled = true
    }
  }, [text, width, lineHeightPx, font, trimForMeasure])

  return (
    <div ref={containerRef} className={cn('w-full min-w-0', className)}>
      {lines === null ? (
        <pre
          className="font-tamil text-foreground m-0 max-w-none whitespace-pre-wrap break-words"
          style={{ lineHeight: `${lineHeightPx}px` }}
        >
          {text}
        </pre>
      ) : (
        <div className="flex flex-col" style={{ lineHeight: `${lineHeightPx}px` }}>
          {lines.map((line, i) => (
            <div
              key={`${i}-${line.slice(0, 12)}`}
              className="font-tamil text-foreground min-w-0"
              style={{ minHeight: lineHeightPx }}
            >
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
