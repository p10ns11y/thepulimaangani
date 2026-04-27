import { useCallback } from 'react'

import { usePrefersReducedMotion } from '#/hooks/usePrefersReducedMotion'
import { useTypewriterPaperPhysics, type TypewriterPhysicsCue } from '#/hooks/useTypewriterPaperPhysics'
import { alignSyllablesToWords } from '#/lib/alignSyllablesToWords'
import { mapFeetToPhysicalLines, physicalPoemLines } from '#/lib/mapFeetToPhysicalLines'
import { cn } from '#/lib/utils'
import type { LivePreviewState } from '#/types/livePreview'

const CONTEXT_RADIUS = 1

type PoemEditLiveContextRailProps = {
  poemText: string
  live: LivePreviewState
  focusLine: number
  editorOpen: boolean
  physicsEnabled: boolean
  /** When true, editor events emit typewriter cues even if `physicsEnabled` is false. */
  soundCuesEnabled: boolean
  /** From `useTypewriterSound` in parent; no-ops when sound off. */
  onSoundCue: (cue: TypewriterPhysicsCue) => void
  className?: string
}

function clampFocusLine(focusLine: number, lineCount: number): number {
  if (lineCount <= 0) return 0
  return Math.max(0, Math.min(focusLine, lineCount - 1))
}

export function PoemEditLiveContextRail({
  poemText,
  live,
  focusLine,
  editorOpen,
  physicsEnabled,
  soundCuesEnabled,
  onSoundCue,
  className,
}: PoemEditLiveContextRailProps) {
  const reducedMotion = usePrefersReducedMotion()
  const lines = physicalPoemLines(poemText)

  const hasLines = lines.length > 0
  const focus = clampFocusLine(focusLine, lines.length)
  const start = Math.max(0, focus - CONTEXT_RADIUS)
  const end = Math.min(lines.length - 1, focus + CONTEXT_RADIUS)
  const visibleLines = hasLines ? lines.slice(start, end + 1) : []

  const parsed = live.parsed
  const feetByLine = parsed ? mapFeetToPhysicalLines(poemText, parsed.lines.flatMap((ln) => ln.feet)) : []
  const lineFeetFocus = feetByLine[focus] ?? []
  const activeLineSyllableCount = lineFeetFocus.flatMap((f) => f.syllables).length

  const onCue = useCallback(
    (cue: TypewriterPhysicsCue) => {
      onSoundCue(cue)
    },
    [onSoundCue],
  )

  const physicsTransform = useTypewriterPaperPhysics({
    enabled: physicsEnabled,
    cuesEnabled: soundCuesEnabled,
    reducedMotion,
    editorOpen,
    focusLine: focus,
    layoutVersion: live.layoutVersion,
    liveStatus: live.status,
    activeLineSyllableCount,
    onPhysicsCue: onCue,
  })

  const { translateY, rotateZ, scale } = physicsTransform

  const isBusy = live.status === 'syncing' || live.status === 'pending'
  const statusLabel =
    live.status === 'ready'
      ? 'Live'
      : live.status === 'invalid'
        ? 'சரிபார்க்கவும்'
        : live.status === 'error'
          ? 'பிழை'
          : 'புதுப்பிப்பு'

  if (!hasLines) return null

  return (
    <section
      className={cn(
        'mx-auto w-full max-w-[min(34rem,90%)] rounded-[2px] border px-2.5 py-1.5 sm:px-3',
        'border-[color:color-mix(in_oklab,var(--rim)_62%,var(--foreground)_12%)]',
        'bg-[color:color-mix(in_oklab,var(--surface-1)_76%,var(--surface-2)_24%)] backdrop-blur-[1px]',
        'shadow-[0_1px_0_color-mix(in_oklab,var(--rim)_28%,transparent),0_12px_24px_color-mix(in_oklab,var(--foreground)_14%,transparent)]',
        className,
      )}
      style={{
        backgroundImage:
          'repeating-linear-gradient(to bottom, color-mix(in oklab, var(--rim) 18%, transparent) 0, color-mix(in oklab, var(--rim) 18%, transparent) 1px, transparent 1px, transparent 1.3rem)',
        transform: `translate3d(0, ${translateY}px, 0) rotateZ(${rotateZ}deg) scale(${scale})`,
        transformOrigin: 'top center',
        willChange: physicsEnabled && !reducedMotion ? 'transform' : undefined,
      }}
    >
      <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-[color:color-mix(in_oklab,var(--gem-gold)_45%,transparent)]" aria-hidden />
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="m-0 text-[0.58rem] font-semibold tracking-[0.08em] text-foreground/75">PAPER PREVIEW</p>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[0.56rem] font-semibold tracking-wide',
            'border-rim/45 bg-[color:color-mix(in_oklab,var(--surface-3)_82%,var(--surface-1)_18%)] text-foreground',
          )}
        >
          <span
            className={cn(
              'inline-block size-1.5 rounded-full',
              live.status === 'ready'
                ? 'bg-emerald-500'
                : live.status === 'invalid' || live.status === 'error'
                  ? 'bg-amber-500'
                  : 'bg-sky-500',
              isBusy && 'animate-pulse',
            )}
            aria-hidden
          />
          {statusLabel}
        </span>
      </div>

      <div className="max-h-36 space-y-1 overflow-hidden pr-1">
        {visibleLines.map((lineText, localIdx) => {
          const lineIdx = start + localIdx
          const lineFeet = feetByLine[lineIdx] ?? []
          const syllables = lineFeet.flatMap((f) => f.syllables)
          const groups = alignSyllablesToWords(lineText, syllables)
          const active = lineIdx === focus

          return (
            <div
              key={`ctx-line-${lineIdx}-${live.layoutVersion}`}
              className={cn(
                'rounded-lg border px-2.5 transition-colors',
                active ? 'py-2' : 'py-1',
                active
                  ? 'border-rim/70 bg-[color:color-mix(in_oklab,var(--surface-1)_88%,var(--surface-3)_12%)] shadow-sm'
                  : 'border-rim/35 bg-[color:color-mix(in_oklab,var(--surface-2)_70%,var(--surface-3)_30%)]',
              )}
            >
              <div className={cn('flex items-center gap-2', active ? 'mb-1.5' : 'mb-0.5')}>
                <span className="text-muted-foreground text-[0.58rem] font-semibold tracking-wide">அடி {lineIdx + 1}</span>
                <p className="font-tamil m-0 truncate text-[0.66rem] leading-[1.3] text-foreground/95">{lineText || '\u00a0'}</p>
              </div>
              {active && groups.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="inline-flex min-w-full items-end gap-1.5 pb-0.5">
                    {groups.flatMap(({ syllables: syls }) => syls).map((syl, sylIdx) => {
                      const isNer = syl.syllable_type === 'Ner'
                      return (
                        <span
                          key={`ctx-syl-${lineIdx}-${sylIdx}-${live.layoutVersion}`}
                          className={cn(
                            'font-tamil inline-flex min-w-[1.2rem] flex-col items-center rounded-md border px-1 py-0.5 text-[0.6rem] leading-tight',
                            isNer
                              ? '[border-color:var(--syllable-ner-border)] [background-color:color-mix(in_oklab,var(--syllable-ner-bg),white_14%)] text-[color:var(--syllable-ner-text)]'
                              : '[border-color:var(--syllable-nirai-border)] [background-color:color-mix(in_oklab,var(--syllable-nirai-bg),white_14%)] text-[color:var(--syllable-nirai-text)]',
                          )}
                        >
                          <span className="max-w-[4.2rem] truncate">{syl.text}</span>
                          <span className="font-sans text-[0.44rem] uppercase tracking-wide opacity-85">
                            {isNer ? 'நேர்' : 'நிரை'}
                          </span>
                        </span>
                      )
                    })}
                  </div>
                </div>
              ) : active ? (
                <p className="text-muted-foreground m-0 text-[0.68rem]">பகுப்பு வரும் வரை காத்திருக்கிறது…</p>
              ) : (
                <div className="h-2" aria-hidden />
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
