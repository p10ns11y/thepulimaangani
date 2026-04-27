import { useEffect, useId, useRef, type ReactNode } from 'react'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

type PoemEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onChange: (v: string) => void
  onApply: () => void
  onCursorLineChange: (lineIndex: number) => void
  /** focused current-line live preview shown above editor body */
  liveContextRail?: ReactNode
  paperPhysicsEnabled: boolean
  onPaperPhysicsEnabledChange: (enabled: boolean) => void
  typewriterSoundEnabled: boolean
  onTypewriterSoundEnabledChange: (enabled: boolean) => void
}

function lineIndexAtCursor(value: string, cursor: number): number {
  if (cursor <= 0) return 0
  let count = 0
  for (let i = 0; i < cursor && i < value.length; i++) {
    if (value[i] === '\n') count += 1
  }
  return count
}

export function PoemEditDialog({
  open,
  onOpenChange,
  value,
  onChange,
  onApply,
  onCursorLineChange,
  liveContextRail,
  paperPhysicsEnabled,
  onPaperPhysicsEnabledChange,
  typewriterSoundEnabled,
  onTypewriterSoundEnabledChange,
}: PoemEditDialogProps) {
  const taRef = useRef<HTMLTextAreaElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const t = requestAnimationFrame(() => {
      taRef.current?.focus()
      const len = taRef.current?.value.length ?? 0
      taRef.current?.setSelectionRange(len, len)
      onCursorLineChange(lineIndexAtCursor(taRef.current?.value ?? '', len))
    })
    return () => cancelAnimationFrame(t)
  }, [open, onCursorLineChange])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="prosody-poem-editor-dock-outer">
      <div className="prosody-poem-editor-dock-inner relative mx-auto w-full max-w-2xl px-3 pb-2 sm:px-4">
        {liveContextRail ? (
          <div className="pointer-events-none absolute inset-x-0 -top-40 z-0 flex justify-center px-1 sm:px-2">
            <div className="pointer-events-auto w-full">{liveContextRail}</div>
          </div>
        ) : null}
        {liveContextRail ? (
          <div
            className="pointer-events-none absolute inset-x-12 -top-1 z-10 h-2 rounded-full border border-rim/35 bg-[color:color-mix(in_oklab,var(--surface-3)_72%,transparent)] shadow-inner sm:inset-x-16"
            aria-hidden
          />
        ) : null}
        <section
          className="prosody-poem-editor-dock"
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
        >
          <div
            className={cn(
              'border-rim/50 text-foreground',
              'flex max-h-[min(74vh,680px)] w-full min-w-0 flex-col overflow-hidden',
              'rounded-t-2xl border border-b-0 bg-[color:var(--surface-1)] p-0',
              'shadow-[0_-12px_40px_color-mix(in_oklab,var(--foreground)_6%,transparent),0_0_0_1px_color-mix(in_oklab,var(--rim)_35%,transparent)]',
            )}
            onKeyDown={(e) => e.stopPropagation()}
          >
        <div
          className="border-rim/30 flex flex-col gap-1.5 border-b px-3 py-2.5 sm:px-4 sm:py-3"
          style={{
            background:
              'linear-gradient(135deg, color-mix(in oklab, var(--surface-2) 92%, var(--gem-diamond) 8%) 0%, var(--surface-1) 100%)',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <h2 id={titleId} className="font-tamil m-0 shrink-0 text-sm font-semibold tracking-tight sm:text-base">
              Edit poem
            </h2>
            <div className="flex min-w-0 flex-col items-end gap-1.5 text-right">
              <p className="text-muted-foreground m-0 text-[0.68rem] leading-snug sm:text-[0.72rem]">
                Esc to close
              </p>
              <div className="flex flex-wrap justify-end gap-1.5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={paperPhysicsEnabled}
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[0.62rem] font-semibold tracking-wide',
                    paperPhysicsEnabled
                      ? 'border-emerald-500/55 bg-[color:color-mix(in_oklab,var(--surface-2)_88%,var(--gem-emerald)_12%)] text-foreground'
                      : 'border-rim/40 bg-[color:color-mix(in_oklab,var(--surface-3)_75%,var(--surface-1)_25%)] text-muted-foreground',
                  )}
                  onClick={() => onPaperPhysicsEnabledChange(!paperPhysicsEnabled)}
                >
                  Paper physics
                </button>
                <button
                  type="button"
                  role="switch"
                  aria-checked={typewriterSoundEnabled}
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[0.62rem] font-semibold tracking-wide',
                    typewriterSoundEnabled
                      ? 'border-sky-500/55 bg-[color:color-mix(in_oklab,var(--surface-2)_88%,var(--gem-diamond)_12%)] text-foreground'
                      : 'border-rim/40 bg-[color:color-mix(in_oklab,var(--surface-3)_75%,var(--surface-1)_25%)] text-muted-foreground',
                  )}
                  onClick={() => onTypewriterSoundEnabledChange(!typewriterSoundEnabled)}
                >
                  Typewriter sound
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="prosody-poem-dialog-shimmer min-h-0 flex-1 overflow-y-auto px-3 pb-2 pt-3 sm:px-4">
          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              onCursorLineChange(lineIndexAtCursor(e.target.value, e.target.selectionStart ?? 0))
            }}
            onClick={(e) => {
              onCursorLineChange(lineIndexAtCursor(value, e.currentTarget.selectionStart ?? 0))
            }}
            onKeyUp={(e) => {
              onCursorLineChange(lineIndexAtCursor(value, e.currentTarget.selectionStart ?? 0))
            }}
            onSelect={(e) => {
              onCursorLineChange(lineIndexAtCursor(value, e.currentTarget.selectionStart ?? 0))
            }}
            spellCheck={false}
            className="prosody-poem-input font-tamil text-foreground max-h-[min(44vh,460px)] min-h-[12rem] w-full resize-y rounded-xl border border-rim/45 bg-[color:color-mix(in_oklab,var(--surface-2)_92%,var(--diamond-ice)_8%)] px-3 py-2.5 text-[0.875rem] leading-[1.6] shadow-inner focus-visible:border-rim/80 focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_oklab,var(--gem-diamond)_30%,transparent)] focus-visible:outline-none"
            placeholder="Enter Tamil poem…"
          />
        </div>
        <div
          className="border-rim/25 flex flex-wrap items-center justify-end gap-2 border-t px-3 py-3 sm:px-4"
          style={{ background: 'color-mix(in oklab, var(--surface-2) 70%, var(--gem-pearl) 30%)' }}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => {
              onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-9"
            onClick={() => {
              onApply()
              onOpenChange(false)
            }}
          >
            Done
          </Button>
        </div>
          </div>
        </section>
      </div>
    </div>
  )
}

