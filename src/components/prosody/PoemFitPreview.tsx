import { useMemo, useRef } from 'react'

import { useFitPoemFontSize, LINE_HEIGHT_FACTOR } from '#/hooks/useFitPoemFontSize'
import { lineDiffOps } from '#/lib/prosody/layout/poemLineDiff'
import { cn } from '#/lib/utils'

type PoemFitPreviewProps = {
  /** Last committed poem (saved sample or Done). */
  text: string
  /**
   * While the bottom editor is open, pass the live draft so the card mirrors typing.
   * Lines that differ from `text` are tinted as “new / edited”.
   */
  draftForDiff?: string
  placeholder?: string
}

/** Read-only poem surface (Edit lives next to Live / Structure / Text flow). */
export function PoemFitPreview({
  text,
  draftForDiff,
  placeholder = 'No poem text yet…',
}: PoemFitPreviewProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const diffOps = useMemo(
    () => (draftForDiff === undefined ? null : lineDiffOps(text, draftForDiff)),
    [text, draftForDiff],
  )
  const displayText = draftForDiff !== undefined ? draftForDiff : text
  const measureText = useMemo(() => {
    if (diffOps && diffOps.length > 0) {
      return diffOps.map((lineOp) => lineOp.line).join('\n')
    }
    return displayText
  }, [diffOps, displayText])
  // Fit font to width so Tamil verse lines stay one hard line (no soft wrap).
  const fontSize = useFitPoemFontSize(measureText, boxRef, {
    minPx: 9,
    maxPx: 22,
    padX: 36,
    padY: 20,
  })
  const trimmed = measureText.length > 0
  const lineHeight = fontSize * LINE_HEIGHT_FACTOR

  return (
    <div
      className={cn(
        'prosody-poem-preview-inner relative w-full min-w-0 overflow-hidden rounded-xl border text-left',
        'border-rim/45 bg-[color:color-mix(in_oklab,var(--surface-2)_88%,var(--diamond-ice)_12%)]',
        'shadow-[inset_0_1px_0_0_color-mix(in_oklab,var(--diamond-glint)_50%,transparent),0_8px_28px_color-mix(in_oklab,var(--foreground)_3%,transparent)]',
      )}
      data-testid="poem-readonly-preview"
    >
      <div
        ref={boxRef}
        className="prosody-poem-preview-scroll font-tamil text-foreground min-h-[6.5rem] w-full min-w-0 max-w-full overflow-x-hidden overflow-y-auto px-3 py-2.5 sm:min-h-[7.5rem] sm:px-3.5 sm:py-3"
      >
        {trimmed ? (
          <pre
            className="m-0 w-full max-w-full whitespace-pre [overflow-wrap:normal] [word-break:normal]"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: `${lineHeight}px`,
              fontWeight: 500,
            }}
          >
            {diffOps && diffOps.length > 0
              ? diffOps.map((op, i) => (
                  <span
                    key={`poem-diff-${i}-${op.type}`}
                    className={cn(
                      'block whitespace-nowrap',
                      op.type === 'insert' && 'text-[color:var(--gem-emerald)]',
                      op.type === 'delete' &&
                        'text-[color:color-mix(in_oklab,var(--gem-ruby)_72%,var(--sea-ink)_28%)] line-through decoration-[color:color-mix(in_oklab,var(--gem-ruby)_40%,var(--rim)_60%)]',
                      op.type === 'equal' && 'text-foreground',
                    )}
                  >
                    {op.line || '\u00a0'}
                  </span>
                ))
              : displayText
                  .replace(/\r\n/g, '\n')
                  .split('\n')
                  .map((line, i) => (
                    <span
                      key={`poem-line-${i}`}
                      className="text-foreground block whitespace-nowrap"
                    >
                      {line || '\u00a0'}
                    </span>
                  ))}
          </pre>
        ) : (
          <p className="text-muted-foreground m-0 text-sm leading-relaxed">{placeholder}</p>
        )}
      </div>
    </div>
  )
}
