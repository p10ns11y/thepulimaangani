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
        'border border-[var(--line)]/60',
        isNer
          ? 'bg-gradient-to-b from-[rgba(79,184,178,0.28)] to-[rgba(79,184,178,0.1)] text-[var(--lagoon-deep)]'
          : 'bg-gradient-to-b from-[rgba(47,106,74,0.18)] to-[rgba(47,106,74,0.06)] text-[var(--palm)]',
      )}
      style={{ animationDelay: `${staggerMs}ms` }}
    >
      <span className="max-w-[7rem] break-words">{text}</span>
      <span
        className={cn(
          'font-sans tracking-wide opacity-90',
          'text-[0.65rem]',
          isNer ? 'text-[var(--lagoon-deep)]' : 'text-[var(--palm)]',
        )}
      >
        {isNer ? 'நேர்' : 'நிரை'}
      </span>
    </span>
  )
}
