import type { LivePreviewState } from '#/types/livePreview'
import { alignSyllablesToWords } from '#/lib/alignSyllablesToWords'
import { mapFeetToPhysicalLines, physicalPoemLines } from '#/lib/mapFeetToPhysicalLines'
import { cn } from '#/lib/utils'

import { PretextLineViewport } from './PretextLineViewport'
import { TAMIL_PRETEXT_FONT_COMPACT } from './pretextConstants'
import { SyllableAnnotationCell } from './SyllableAnnotationCell'

type SyllableLivePreviewProps = {
  poemText: string
  live: LivePreviewState
  /** Tighter chrome for embedding inside the result panel */
  variant?: 'default' | 'compact'
}

export function SyllableLivePreview({ poemText, live, variant = 'default' }: SyllableLivePreviewProps) {
  const compact = variant === 'compact'
  const trimmed = poemText.trim()
  if (!trimmed) return null

  const parsed = live.parsed
  const isRefreshing = live.status === 'syncing' || live.status === 'pending'

  const feet = parsed ? parsed.lines.flatMap((ln) => ln.feet) : []
  const physicalLines = physicalPoemLines(poemText)
  const feetByLine = parsed ? mapFeetToPhysicalLines(poemText, feet) : []

  return (
    <div className={cn(compact ? 'space-y-2' : 'space-y-3')}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <p className="text-muted-foreground m-0 flex items-center gap-2 text-xs font-medium tracking-wide">
          <span>{compact ? 'Live' : 'Live syllables'}</span>
          {isRefreshing ? (
            <span
              className="luxe-live-pulse-dot motion-safe:animate-pulse inline-block size-1.5 rounded-full"
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
      {!compact ? (
        <p className="text-muted-foreground m-0 max-w-xl text-xs leading-relaxed">
          Each source line is one row (no column wrap); the row below colours each syllable (நேர் / நிரை)
          without extra labels. Across several lines, grouping is still approximate until the engine emits
          line-scoped feet.
        </p>
      ) : null}

      {(live.status === 'invalid' || live.status === 'error') && live.message ? (
        <p className="text-muted-foreground m-0 text-sm leading-relaxed">{live.message}</p>
      ) : null}

      {parsed ? (
        <div
          className={cn(
            'max-w-full overflow-hidden rounded-xl border',
            compact
              ? 'border-rim/50 bg-surface-3/65 shadow-none'
              : 'max-w-3xl rounded-2xl border-rim/55 bg-gradient-to-b from-surface-1/95 via-surface-2/80 to-surface-3/55 shadow-[0_18px_48px_color-mix(in_oklab,var(--foreground)_6%,transparent)]',
          )}
        >
          {physicalLines.map((lineText, lineIdx) => {
            const lineFeet = feetByLine[lineIdx] ?? []
            const syllables = lineFeet.flatMap((f) => f.syllables)
            const groups = alignSyllablesToWords(lineText, syllables)
            const pretextSource = lineText.length === 0 ? '\u00a0' : lineText

            let stagger = 0

            return (
              <div
                key={`live-block-${lineIdx}`}
                className={cn(
                  'border-b border-border/80 last:border-b-0',
                  compact ? 'px-3 py-2.5 sm:px-3.5' : 'border-rim/45 px-4 py-4 sm:px-5 sm:py-5',
                )}
              >
                <div
                  className={cn(
                    'text-foreground/90 rounded-md',
                    isRefreshing && 'live-line-shimmer',
                  )}
                >
                  <PretextLineViewport
                    text={pretextSource}
                    trimForMeasure={false}
                    lineHeightPx={compact ? 24 : 26}
                    font={TAMIL_PRETEXT_FONT_COMPACT}
                    className={cn(compact ? 'text-[0.92rem] leading-snug' : 'text-[0.98rem] leading-relaxed')}
                  />
                </div>

                {groups.length > 0 ? (
                  <div
                    key={`chips-lv-${live.layoutVersion}-line-${lineIdx}`}
                    className={cn(
                      'flex flex-wrap items-end border-t',
                      'motion-safe:transition-[opacity,transform] motion-safe:duration-300 motion-safe:ease-out',
                      compact
                        ? 'mt-2 gap-x-4 gap-y-1.5 border-rim/45 pt-2'
                        : 'mt-3 gap-x-6 gap-y-2.5 border-rim/35 pt-3',
                      isRefreshing && 'opacity-[0.72]',
                    )}
                    aria-busy={isRefreshing}
                    aria-label="Syllable preview for this line"
                  >
                    {groups.map(({ word, syllables: syls }, gi) => (
                      <div
                        key={`${lineIdx}-g-${gi}-${word.slice(0, 8)}`}
                        className="inline-flex flex-col gap-1"
                      >
                        <div className="flex flex-wrap items-end gap-1">
                          {syls.map((syl, sylIdx) => {
                            const ms = stagger
                            stagger += compact ? 28 : 38
                            return (
                              <SyllableAnnotationCell
                                key={`${live.layoutVersion}-${lineIdx}-${gi}-${sylIdx}`}
                                syllableType={syl.syllable_type}
                                text={syl.text}
                                staggerMs={ms}
                                motionVariant={compact ? 'live' : 'default'}
                              />
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground border-rim/35 mt-3 border-t pt-3 text-xs">
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
