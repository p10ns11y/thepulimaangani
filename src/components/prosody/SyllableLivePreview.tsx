import type { LivePreviewState } from '#/types/livePreview'
import { feetPerPhysicalLine, groupsFromFeet } from '#/lib/prosody/layout/parserFeetLayout'
import { physicalPoemLines } from '#/lib/prosody/layout/mapFeetToPhysicalLines'
import { cn } from '#/lib/utils'

import { SyllableAnnotationCell } from './SyllableAnnotationCell'

type SyllableLivePreviewProps = {
  poemText: string
  live: LivePreviewState
  /** Tighter chrome for embedding inside the result panel */
  variant?: 'default' | 'compact'
  /** When true, suppress pulse/shimmer motion for calm edit-focus mode. */
  disableLiveAnimations?: boolean
}

/**
 * Live preview layout (the simple flex fix):
 * - Outer: `mx-auto w-fit max-w-full` → block centered, not full tab stretch
 * - Poem card: `flex flex-col items-start` → children keep intrinsic width (LTR)
 * - Text + chips: start-aligned; never justify-center / text-align:center
 */
export function SyllableLivePreview({
  poemText,
  live,
  variant = 'default',
  disableLiveAnimations = false,
}: SyllableLivePreviewProps) {
  const compact = variant === 'compact'
  const trimmed = poemText.trim()
  if (!trimmed) return null

  const parsed = live.parsed
  const isRefreshing = live.status === 'syncing' || live.status === 'pending'

  const physicalLines = physicalPoemLines(poemText)
  const feetByLine = parsed ? feetPerPhysicalLine(parsed, poemText) : []

  return (
    <div className={cn('mx-auto w-fit max-w-full', compact ? 'space-y-2' : 'space-y-3')}>
      <div className="flex w-full flex-wrap items-end justify-between gap-2">
        <p className="text-muted-foreground m-0 flex items-center gap-2 text-xs font-medium tracking-wide">
          <span>{compact ? 'Live' : 'Live syllables'}</span>
          {isRefreshing ? (
            <span
              className={cn(
                'luxe-live-pulse-dot inline-block size-1.5 rounded-full',
                !disableLiveAnimations && 'motion-safe:animate-pulse',
              )}
              aria-label="Updating layout"
              title="Updating layout"
            />
          ) : null}
        </p>
        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-[0.7rem] sm:gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block size-2 rounded-sm border [border-color:var(--syllable-ner-border)] [background-color:color-mix(in_oklab,var(--syllable-ner-swatch),transparent_35%)]"
              aria-hidden
            />
            நேர்
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block size-2 rounded-sm border [border-color:var(--syllable-nirai-border)] [background-color:color-mix(in_oklab,var(--syllable-nirai-swatch),transparent_40%)]"
              aria-hidden
            />
            நிரை
          </span>
        </div>
      </div>

      {(live.status === 'invalid' || live.status === 'error') && live.message ? (
        <p className="text-muted-foreground m-0 text-sm leading-relaxed">{live.message}</p>
      ) : null}

      {parsed ? (
        <div
          className={cn(
            'flex max-w-full flex-col items-start overflow-x-auto rounded-xl border',
            compact
              ? 'border-rim/50 bg-surface-3/65 shadow-none'
              : 'border-rim/55 bg-surface-1/90 shadow-[0_8px_28px_color-mix(in_oklab,var(--foreground)_4%,transparent)]',
          )}
          data-testid="live-poem-card"
        >
          {physicalLines.map((lineText, lineIdx) => {
            const lineFeet = feetByLine[lineIdx] ?? []
            const groups = groupsFromFeet(lineFeet)
            const displayLine = lineText.length === 0 ? '\u00a0' : lineText

            let stagger = 0

            return (
              <div
                key={`live-block-${lineIdx}`}
                className={cn(
                  // no w-full: under flex-col items-start, width follows content (LTR)
                  'border-b border-border/70 last:border-b-0',
                  compact ? 'px-3 py-3 sm:px-4' : 'px-4 py-4 sm:px-5',
                  isRefreshing && !disableLiveAnimations && 'live-line-shimmer opacity-[0.85]',
                )}
                data-testid="live-line-column"
              >
                <p
                  className={cn(
                    'font-tamil text-foreground m-0 text-left whitespace-pre-wrap break-words',
                    compact ? 'text-[0.95rem] leading-snug' : 'text-[1rem] leading-relaxed',
                  )}
                >
                  {displayLine}
                </p>

                {groups.length > 0 ? (
                  <div
                    key={`chips-lv-${live.layoutVersion}-line-${lineIdx}`}
                    className={cn(
                      'mt-2 flex flex-wrap items-end justify-start border-rim/40 border-t pt-2',
                      compact ? 'gap-x-1.5 gap-y-1.5' : 'gap-x-2 gap-y-2',
                    )}
                    aria-busy={isRefreshing}
                    aria-label="Syllable preview for this line"
                  >
                    {groups.map(({ word, syllables: syls }, gi) => (
                      <div
                        key={`${lineIdx}-g-${gi}-${word.slice(0, 8)}`}
                        className="inline-flex flex-col items-start gap-0.5"
                      >
                        <div className="flex flex-wrap items-end justify-start gap-1">
                          {syls.map((syl, sylIdx) => {
                            const ms = stagger
                            stagger += compact ? 24 : 32
                            return (
                              <SyllableAnnotationCell
                                key={`${live.layoutVersion}-${lineIdx}-${gi}-${sylIdx}`}
                                syllableType={syl.syllable_type}
                                text={syl.text}
                                staggerMs={disableLiveAnimations ? 0 : ms}
                                motionVariant={
                                  disableLiveAnimations ? 'default' : compact ? 'live' : 'default'
                                }
                              />
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground border-rim/40 m-0 mt-2 border-t pt-2 text-left text-xs">
                    No syllables for this line.
                  </p>
                )}
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
