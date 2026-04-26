import { cn } from '#/lib/utils'

type SyllableChipProps = {
  syllableType: string
  text: string
  /** Structure tab vs live preview density. */
  variant?: 'compact' | 'comfortable'
}

export function SyllableChip({ syllableType, text, variant = 'comfortable' }: SyllableChipProps) {
  const isNer = syllableType === 'Ner'
  const compact = variant === 'compact'

  return (
    <span
      className={cn(
        'font-tamil inline-flex flex-col items-center rounded-md border font-medium text-center leading-tight',
        compact ? 'gap-0.5 px-1.5 py-1 text-sm' : 'gap-1 px-2.5 py-2 text-sm',
        isNer
          ? 'border-[rgba(79,184,178,0.45)] bg-[rgba(79,184,178,0.18)] text-[var(--lagoon-deep)]'
          : 'border-[rgba(47,106,74,0.28)] bg-[rgba(47,106,74,0.1)] text-[var(--palm)]',
      )}
    >
      <span className="max-w-[8rem] break-words">{text}</span>
      <span
        className={cn(
          'font-sans shrink-0 opacity-85',
          compact ? 'text-[0.65rem]' : 'text-xs',
          isNer ? 'text-[var(--lagoon-deep)]' : 'text-[var(--palm)]',
        )}
      >
        {isNer ? 'நேர்' : 'நிரை'}
      </span>
    </span>
  )
}
