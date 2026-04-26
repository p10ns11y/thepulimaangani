import { useMemo, type CSSProperties, type ElementType } from 'react'
import { useReducedMotion } from 'motion/react'

import { splitGraphemes } from '#/lib/grapheme'
import { cn } from '#/lib/utils'

type RedfillButterflyTextProps = {
  text: string
  className?: string
  as?: ElementType
}

/**
 * Redfill: looping butterfly motion per grapheme; `animation-delay` via `--bf-i` keeps a phase wave.
 * Respects `prefers-reduced-motion` (static text).
 */
export function RedfillButterflyText({ text, className, as: Tag = 'span' }: RedfillButterflyTextProps) {
  const reduced = useReducedMotion()
  const parts = useMemo(() => splitGraphemes(text), [text])

  if (reduced) {
    return <Tag className={className}>{text}</Tag>
  }

  return (
    <Tag className={cn('inline-flex flex-wrap overflow-visible', className)}>
      {parts.map((g, i) => (
        <span
          key={`bf-${i}`}
          className="redfill-butterfly-char"
          style={{ '--bf-i': i } as CSSProperties & { '--bf-i': number }}
        >
          {g}
        </span>
      ))}
    </Tag>
  )
}
