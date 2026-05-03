import { splitFootDisplayLabel } from '#/lib/footDisplayLabelParts'
import { resolveFootDisplayParts } from '#/lib/footDisplayLabel'
import type { ParsedFoot } from '#/types/parsedPoem'
import { cn } from '#/lib/utils'

type FootTypeCaptionProps = {
  /** Prefer passing `foot` so WASM Tamil/Latin fields apply without string parsing. */
  foot?: ParsedFoot
  /** Legacy: single label string (parsed for Tamil/Latin when `foot` omitted). */
  label?: string
  className?: string
  align?: 'center' | 'start'
}

export function FootTypeCaption({ foot, label, className, align = 'center' }: FootTypeCaptionProps) {
  const parts =
    foot != null
      ? resolveFootDisplayParts(foot)
      : splitFootDisplayLabel(label ?? '')
  const { tamil, latin } = parts
  const alignClass = align === 'start' ? 'text-left' : 'text-center'

  if (!latin) {
    return (
      <span className={cn('block max-w-full font-tamil text-[0.65rem] leading-tight text-foreground/88', alignClass, className)}>
        {tamil}
      </span>
    )
  }

  return (
    <span className={cn('text-muted-foreground flex max-w-full flex-col gap-0.5', alignClass, className)}>
      <span className="font-tamil text-[0.65rem] leading-tight text-foreground/90">{tamil}</span>
      <span className="font-mono text-[0.6rem] leading-tight tracking-tight text-muted-foreground/95">{latin}</span>
    </span>
  )
}
