import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

export type StructureAccordionRowProps = {
  title: string
  subtitle: string
  expanded: boolean
  onToggle: () => void
  children: ReactNode
}

/**
 * Shared Structure accordion chrome — motion/focus classes live in styles.css
 * so every panel (Metre / Bonds / Syllables) stays interaction-consistent.
 */
export function StructureAccordionRow({
  title,
  subtitle,
  expanded,
  onToggle,
  children,
}: StructureAccordionRowProps) {
  return (
    <div className="border-rim/35 bg-surface-1/55 structure-accordion-row overflow-hidden rounded-lg border">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="structure-accordion-trigger hover:bg-surface-2/55 focus-visible:ring-ring/60 flex w-full items-start gap-2 px-3 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset"
      >
        <ChevronDown
          className={`structure-accordion-chevron text-muted-foreground mt-0.5 size-4 shrink-0 ${expanded ? 'rotate-180' : ''}`}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="text-foreground block text-sm font-medium">{title}</span>
          <span className="text-muted-foreground block text-[0.7rem] leading-snug">{subtitle}</span>
        </span>
      </button>
      {expanded ? (
        <div className="structure-accordion-panel border-rim/25 border-t px-3 pt-1 pb-3">{children}</div>
      ) : null}
    </div>
  )
}
