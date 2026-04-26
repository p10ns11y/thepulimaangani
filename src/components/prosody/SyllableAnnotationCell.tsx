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
  const isNer = syllableType === 'Ner'
  const motionClass =
    motionVariant === 'live'
      ? 'live-syllable-pop motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100'
      : 'rise-in motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:translate-y-0'

  return (
    <span
      className={cn(
        'font-tamil inline-flex min-w-[1.75rem] flex-col items-center rounded-lg px-2 py-1 text-center text-[0.95rem] leading-snug shadow-sm',
        motionClass,
        'border',
        isNer
          ? '[border-color:color-mix(in_oklab,var(--syllable-ner-border),transparent_25%)] bg-gradient-to-b from-[color:var(--syllable-ner-bg)] to-[color:var(--syllable-ner-tint-to)] text-[color:var(--syllable-ner-text)]'
          : '[border-color:color-mix(in_oklab,var(--syllable-nirai-border),transparent_22%)] bg-gradient-to-b from-[color:var(--syllable-nirai-bg)] to-[color:var(--syllable-nirai-tint-to)] text-[color:var(--syllable-nirai-text)]',
      )}
      style={{ animationDelay: `${staggerMs}ms` }}
    >
      <span className="max-w-[7rem] break-words">{text}</span>
      <span
        className={cn(
          'font-sans tracking-wide opacity-90',
          'text-[0.65rem]',
          isNer ? 'text-[color:var(--syllable-ner-text)]' : 'text-[color:var(--syllable-nirai-text)]',
        )}
      >
        {isNer ? 'நேர்' : 'நிரை'}
      </span>
    </span>
  )
}
