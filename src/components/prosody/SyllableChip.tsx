import { isNerSyllableType } from '#/lib/prosody/syllableType'
import { cn } from '#/lib/utils'

type SyllableChipProps = {
  syllableType: string
  text: string
  /** Structure tab vs live preview density. */
  variant?: 'compact' | 'comfortable'
}

export function SyllableChip({ syllableType, text, variant = 'comfortable' }: SyllableChipProps) {
  const isNer = isNerSyllableType(syllableType)
  const compact = variant === 'compact'

  return (
    <span
      className={cn(
        'font-tamil inline-flex flex-col items-center rounded-md border font-medium text-center leading-tight',
        compact ? 'gap-0.5 px-1.5 py-1 text-sm' : 'gap-1 px-2.5 py-2 text-sm',
        isNer
          ? 'syllable-chip-ner text-[color:var(--syllable-ner-text)] [border-color:var(--syllable-ner-border)] [background-color:var(--syllable-ner-bg)]'
          : 'syllable-chip-nirai text-[color:var(--syllable-nirai-text)] [border-color:var(--syllable-nirai-border)] [background-color:var(--syllable-nirai-bg)]',
      )}
      data-syllable-type={isNer ? 'ner' : 'nirai'}
    >
      <span className="max-w-[8rem] break-words">{text}</span>
      <span
        className={cn(
          'font-sans shrink-0 opacity-90',
          compact ? 'text-[0.65rem] font-medium' : 'text-xs font-medium',
          isNer ? 'text-[color:var(--syllable-ner-text)]' : 'text-[color:var(--syllable-nirai-text)]',
        )}
      >
        {isNer ? 'நேர்' : 'நிரை'}
      </span>
    </span>
  )
}
