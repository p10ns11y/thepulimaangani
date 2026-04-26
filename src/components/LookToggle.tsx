import { useAppActorRef, useAppSelector } from '#/components/AppActorProvider'
import { cn } from '#/lib/utils'
import type { AppLook } from '#/machines/app.machine'

const LOOKS: { id: AppLook; label: string }[] = [
  { id: 'real', label: 'Real' },
  { id: 'redpill', label: 'Redpill' },
]

type LookToggleProps = {
  /**
   * `compact`: no visible "Look" label, tighter padding (header toolbars).
   * `default`: labeled control for footers or settings panels.
   */
  variant?: 'default' | 'compact'
}

/**
 * Two-option look: the pressed segment is the **active** look.
 * Uses `app.LOOK.SET` for explicit selection and stable a11y.
 */
export function LookToggle({ variant = 'default' }: LookToggleProps) {
  const look = useAppSelector((s) => s.context.look)
  const actor = useAppActorRef()
  const compact = variant === 'compact'

  return (
    <div className={cn('flex items-center', compact ? 'gap-0.5' : 'gap-1 sm:gap-1.5')}>
      <p
        className={cn(
          'text-muted-foreground m-0 font-semibold uppercase tracking-wider',
          compact && 'sr-only',
          !compact && 'shrink-0 text-[0.55rem] sm:text-[0.65rem]',
        )}
        id="look-toggle-heading"
      >
        Look
      </p>
      <div
        className={cn(
          'inline-flex min-w-0 items-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] p-0.5',
          !compact && 'gap-0.5 shadow-[0_6px_18px_var(--brand-mark-glow)]',
        )}
        role="radiogroup"
        aria-labelledby="look-toggle-heading"
      >
        {LOOKS.map(({ id, label }) => {
          const active = look === id
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              title={active ? `Active: ${label}` : `Use ${label} look`}
              onClick={() => {
                if (!active) actor.send({ type: 'app.LOOK.SET', look: id })
              }}
              className={cn(
                'luxe-look-redpill-press font-semibold text-[var(--sea-ink)] transition redpill:transition-transform redpill:duration-150',
                compact
                  ? 'rounded-full px-2 py-1 text-[0.65rem] sm:px-2.5 sm:py-1.5 sm:text-xs'
                  : 'rounded-full px-2 py-1.5 text-[0.7rem] sm:px-3 sm:text-sm',
                active
                  ? 'bg-[var(--surface-1)] text-[var(--sea-ink)] shadow-sm ring-1 ring-[var(--rim)]/50'
                  : 'text-[var(--sea-ink)]/75 hover:text-[var(--sea-ink)]',
                id === 'redpill' && active && 'luxe-look-redpill-shine',
              )}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
