import { useRef, useState } from 'react'

import { Pencil } from 'lucide-react'

import { useFitPoemFontSize, LINE_HEIGHT_FACTOR } from '#/hooks/useFitPoemFontSize'
import { cn } from '#/lib/utils'

type PoemFitPreviewProps = {
  text: string
  onOpenEditor: () => void
  placeholder?: string
}

export function PoemFitPreview({ text, onOpenEditor, placeholder = 'Tap to add a Tamil poem…' }: PoemFitPreviewProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const fontSize = useFitPoemFontSize(text, boxRef, { minPx: 10, maxPx: 22, padX: 24, padY: 20 })
  const [hover, setHover] = useState(false)
  const trimmed = text.length > 0
  const lineHeight = fontSize * LINE_HEIGHT_FACTOR

  return (
    <div className="group/poem relative w-full min-w-0">
      <div
        className={cn(
          'prosody-poem-preview-frame pointer-events-none absolute inset-0 rounded-xl',
          'opacity-90 transition-opacity duration-300',
          hover ? 'opacity-100' : null,
        )}
        aria-hidden
      />
      <button
        type="button"
        onClick={() => onOpenEditor()}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={cn(
          'prosody-poem-preview-inner relative w-full min-w-0 cursor-pointer rounded-xl border text-left',
          'border-rim/45 bg-[color:color-mix(in_oklab,var(--surface-2)_88%,var(--diamond-ice)_12%)]',
          'shadow-[inset_0_1px_0_0_color-mix(in_oklab,var(--diamond-glint)_50%,transparent),0_12px_40px_color-mix(in_oklab,var(--foreground)_4%,transparent)]',
          'transition-[transform,box-shadow,border-color] duration-300 ease-out',
          'hover:border-rim/70 hover:shadow-[0_16px_48px_color-mix(in_oklab,var(--gem-diamond)_12%,transparent)]',
          'focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_oklab,var(--gem-diamond)_35%,transparent)] focus-visible:outline-none',
        )}
        aria-label="Edit poem, opens bottom editor"
      >
        <div className="prosody-poem-diamond-glint pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden">
          <span className="prosody-poem-sparkle-1 absolute -left-1/4 top-0 h-px w-1/2 bg-gradient-to-r from-transparent via-[color:var(--sparkle)] to-transparent opacity-0 transition-opacity duration-500 group-hover/poem:opacity-90" />
          <span className="prosody-poem-sparkle-2 absolute bottom-2 right-3 size-1.5 rounded-full bg-[color:var(--gem-yellow-sapphire)] opacity-40 blur-[0.5px] transition-transform duration-500 group-hover/poem:scale-125" />
        </div>

        <div className="flex items-start justify-between gap-2 px-3 py-2.5 pr-2 sm:px-3.5 sm:py-3">
          <div
            ref={boxRef}
            className="font-tamil text-foreground min-h-[6.5rem] w-full min-w-0 max-w-full overflow-hidden sm:min-h-[7.5rem]"
          >
            {trimmed ? (
              <pre
                className="m-0 max-w-full whitespace-pre"
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: `${lineHeight}px`,
                  fontWeight: 500,
                }}
              >
                {text}
              </pre>
            ) : (
              <p className="text-muted-foreground m-0 text-sm leading-relaxed">{placeholder}</p>
            )}
          </div>
          <span
            className={cn(
              'text-muted-foreground inline-flex shrink-0 items-center gap-1 rounded-md border border-rim/25 bg-surface-1/80 px-1.5 py-1 text-[0.65rem] font-medium',
              'transition-transform duration-300 group-hover/poem:translate-y-0',
            )}
            aria-hidden
          >
            <Pencil className="size-3.5 opacity-80" />
            <span className="hidden sm:inline">Edit</span>
          </span>
        </div>
      </button>
    </div>
  )
}
