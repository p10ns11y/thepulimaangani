import { useEffect, useId, useRef } from 'react'

import { Button } from '#/components/ui/button'

type PoemEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onChange: (v: string) => void
  onApply: () => void
}

export function PoemEditDialog({ open, onOpenChange, value, onChange, onApply }: PoemEditDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const titleId = useId()

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open) {
      if (!d.open) {
        d.showModal()
        requestAnimationFrame(() => {
          taRef.current?.focus()
          const len = taRef.current?.value.length ?? 0
          taRef.current?.setSelectionRange(len, len)
        })
      }
    } else if (d.open) {
      d.close()
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      className="poem-edit-dialog text-foreground z-[80] m-0 max-h-[min(55vh,520px)] w-full max-w-[min(720px,100%)] border-0 bg-transparent p-0 shadow-none"
      aria-labelledby={titleId}
      onPointerDown={(e) => {
        if (e.target === ref.current) onOpenChange(false)
      }}
      onClose={() => onOpenChange(false)}
    >
      <div
        className="poem-edit-dialog-panel border-rim/50 text-foreground flex max-h-[min(55vh,520px)] flex-col overflow-hidden rounded-t-2xl border border-b-0 bg-[color:var(--surface-1)] p-0 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="border-rim/30 flex items-center justify-between border-b px-4 py-3"
          style={{
            background:
              'linear-gradient(135deg, color-mix(in oklab, var(--surface-2) 92%, var(--gem-diamond) 8%) 0%, var(--surface-1) 100%)',
          }}
        >
          <h2 id={titleId} className="font-tamil m-0 text-sm font-semibold tracking-tight sm:text-base">
            Edit poem
          </h2>
          <p className="text-muted-foreground m-0 hidden text-xs sm:block">Tap outside or Done to return</p>
        </div>
        <div className="prosody-poem-dialog-shimmer min-h-0 flex-1 px-3 pb-2 pt-3 sm:px-4">
          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            className="prosody-poem-input font-tamil field-sizing-fixed text-foreground max-h-[min(42vh,420px)] min-h-[12rem] w-full resize-y rounded-xl border border-rim/45 bg-[color:color-mix(in_oklab,var(--surface-2)_88%,var(--diamond-ice)_12%)] px-3 py-2.5 text-[0.875rem] leading-[1.6] shadow-inner focus-visible:border-rim/80 focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_oklab,var(--gem-diamond)_30%,transparent)] focus-visible:outline-none"
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
    </dialog>
  )
}
