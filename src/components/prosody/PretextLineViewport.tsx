import { useEffect, useRef, useState } from 'react'

import { cn } from '#/lib/utils'

import { TAMIL_PRETEXT_FONT } from './pretextConstants'

/** Warm module so the first layout pass is not blocked on dynamic import. */
const pretextModulePromise = import('@chenglou/pretext')

const fallbackPreClass =
  'font-tamil text-foreground m-0 w-max min-w-0 max-w-none whitespace-pre [overflow-wrap:normal] [word-break:normal]'

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
  /**
   * When true (default), each newline in the source is a hard row: lines are not soft-wrapped to fit
   * the column (matches poem / prosody layout). The container may scroll horizontally when a row is
   * longer than the viewport.
   */
  atomicSourceLines?: boolean
}

/**
 * Client-side line layout via [@chenglou/pretext](https://learn-pretext.com/).
 * SSR / first paint: falls back to a plain `pre` block with the same text (no soft-wrap when atomic).
 */
export function PretextLineViewport({
  text,
  className,
  lineHeightPx = 28,
  font = TAMIL_PRETEXT_FONT,
  trimForMeasure = true,
  atomicSourceLines = true,
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
    void pretextModulePromise.then(({ prepareWithSegments, layoutWithLines, measureNaturalWidth }) => {
      if (cancelled) return
      try {
        if (atomicSourceLines) {
          const sourceRows = source.split('\n')
          const out: string[] = []
          for (const row of sourceRows) {
            if (row.length === 0) {
              out.push('')
              continue
            }
            const prepared = prepareWithSegments(row, font, {
              whiteSpace: 'pre-wrap',
              wordBreak: 'keep-all',
            })
            const natural = measureNaturalWidth(prepared)
            const maxW = Math.max(width, natural, 1)
            const { lines: layoutLines } = layoutWithLines(prepared, maxW, lineHeightPx)
            for (const ll of layoutLines) {
              out.push(ll.text)
            }
          }
          setLines(out)
        } else {
          const prepared = prepareWithSegments(source, font, {
            whiteSpace: 'pre-wrap',
          })
          const { lines: layoutLines } = layoutWithLines(prepared, width, lineHeightPx)
          setLines(layoutLines.map((l) => l.text))
        }
      } catch {
        setLines(null)
      }
    })
    return () => {
      cancelled = true
    }
  }, [text, width, lineHeightPx, font, trimForMeasure, atomicSourceLines])

  return (
    <div ref={containerRef} className={cn('w-full min-w-0 overflow-x-auto', className)}>
      {lines === null ? (
        <pre className={fallbackPreClass} style={{ lineHeight: `${lineHeightPx}px` }}>
          {text}
        </pre>
      ) : (
        <div className="flex w-max min-w-0 flex-col" style={{ lineHeight: `${lineHeightPx}px` }}>
          {lines.map((line, i) => (
            <div
              key={`${i}-${line.slice(0, 12)}`}
              className="font-tamil text-foreground max-w-none whitespace-nowrap"
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
