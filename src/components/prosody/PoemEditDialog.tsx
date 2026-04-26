import { useEffect, useId, useRef, type ReactNode } from 'react'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

type PoemEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onChange: (v: string) => void
  onApply: () => void
  /** e.g. changed-line syllable strip (lives under the title on narrow screens) */
  changeStrip?: ReactNode
}

export function PoemEditDialog({ open, onOpenChange, value, onChange, onApply, changeStrip }: PoemEditDialogProps) {
  const taRef = useRef<HTMLTextAreaElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const t = requestAnimationFrame(() => {
      taRef.current?.focus()
      const len = taRef.current?.value.length ?? 0
      taRef.current?.setSelectionRange(len, len)
    })
    return () => cancelAnimationFrame(t)
  }, [open])

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
      <div className="prosody-poem-editor-dock-inner mx-auto w-full max-w-2xl px-3 pb-2 sm:px-4">
        <section
          className="prosody-poem-editor-dock"
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
        >
          <div
            className={cn(
              'border-rim/50 text-foreground',
              'flex max-h-[min(52vh,480px)] w-full min-w-0 flex-col overflow-hidden',
              'rounded-t-2xl border border-b-0 bg-[color:var(--surface-1)] p-0',
              'shadow-[0_-12px_40px_color-mix(in_oklab,var(--foreground)_6%,transparent),0_0_0_1px_color-mix(in_oklab,var(--rim)_35%,transparent)]',
            )}
            onKeyDown={(e) => e.stopPropagation()}
          >
        <div
          className="border-rim/30 flex flex-col gap-2 border-b px-3 py-2.5 sm:px-4 sm:py-3"
          style={{
            background:
              'linear-gradient(135deg, color-mix(in oklab, var(--surface-2) 92%, var(--gem-diamond) 8%) 0%, var(--surface-1) 100%)',
          }}
        >
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <h2 id={titleId} className="font-tamil m-0 shrink-0 text-sm font-semibold tracking-tight sm:text-base">
              Edit poem
            </h2>
            <div className="min-w-0 sm:max-w-[min(24rem,52vw)] sm:text-right">
              {changeStrip ? <div className="mb-1 sm:mb-0">{changeStrip}</div> : null}
              <p className="text-muted-foreground m-0 text-[0.7rem] leading-snug sm:text-xs">
                Scroll the page to read the live preview. Done or Esc to close.
              </p>
            </div>
          </div>
        </div>
        <div className="prosody-poem-dialog-shimmer min-h-0 flex-1 px-3 pb-2 pt-3 sm:px-4">
          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            className="prosody-poem-input font-tamil text-foreground max-h-[min(38vh,400px)] min-h-[10rem] w-full resize-y rounded-xl border border-rim/45 bg-[color:color-mix(in_oklab,var(--surface-2)_88%,var(--diamond-ice)_12%)] px-3 py-2.5 text-[0.875rem] leading-[1.6] shadow-inner focus-visible:border-rim/80 focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_oklab,var(--gem-diamond)_30%,transparent)] focus-visible:outline-none"
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

