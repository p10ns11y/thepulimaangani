import { isNerSyllableType } from '#/lib/prosody/syllableType'
import { cn } from '#/lib/utils'

type SyllableAnnotationCellProps = {
  syllableType: string
  text: string
  /** Stagger `rise-in` for a soft cascade when the preview updates. */
  staggerMs?: number
  /** Snappier enter animation for embedded live preview */
  motionVariant?: 'default' | 'live'
}

export function SyllableAnnotationCell({
  syllableType,
  text,
  staggerMs = 0,
  motionVariant = 'default',
}: SyllableAnnotationCellProps) {
  const isNer = isNerSyllableType(syllableType)
  const motionClass =
    motionVariant === 'live'
      ? 'live-syllable-pop motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100'
      : 'rise-in motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:translate-y-0'

  return (
    <span
      className={cn(
        'font-tamil inline-flex min-w-[1.5rem] flex-col items-center rounded-md px-1.5 py-0.5 text-center text-[0.82rem] leading-tight shadow-sm',
        motionClass,
        'border',
        isNer
          ? 'syllable-chip-ner [border-color:color-mix(in_oklab,var(--syllable-ner-border),transparent_18%)] bg-gradient-to-b from-[color:var(--syllable-ner-bg)] to-[color:var(--syllable-ner-tint-to)] text-[color:var(--syllable-ner-text)]'
          : 'syllable-chip-nirai [border-color:color-mix(in_oklab,var(--syllable-nirai-border),transparent_15%)] bg-gradient-to-b from-[color:var(--syllable-nirai-bg)] to-[color:var(--syllable-nirai-tint-to)] text-[color:var(--syllable-nirai-text)]',
      )}
      data-syllable-type={isNer ? 'ner' : 'nirai'}
      style={{ animationDelay: `${staggerMs}ms` }}
    >
      <span className="max-w-[6rem] break-words">{text}</span>
      <span
        className={cn(
          'font-sans tracking-wide opacity-90',
          'text-[0.56rem] font-medium',
          isNer ? 'text-[color:var(--syllable-ner-text)]' : 'text-[color:var(--syllable-nirai-text)]',
        )}
      >
        {isNer ? 'நேர்' : 'நிரை'}
      </span>
    </span>
  )
}
