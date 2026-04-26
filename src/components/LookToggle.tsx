import { useAppActorRef, useAppSelector } from '#/components/AppActorProvider'
import { cn } from '#/lib/utils'

/** Toggles `data-look` (real / fantasy) via the app machine. */
export function LookToggle() {
  const look = useAppSelector((s) => s.context.look)
  const actor = useAppActorRef()
  const label = look === 'real' ? 'Switch to fantasy look' : 'Switch to real look'

  return (
    <button
      type="button"
      onClick={() => {
        actor.send({ type: 'app.LOOK.TOGGLE' })
      }}
      aria-pressed={look === 'fantasy'}
      aria-label={label}
      title={label}
      className={cn(
        'luxe-look-fantasy-press rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink)] shadow-[0_8px_22px_var(--brand-mark-glow)] transition hover:-translate-y-0.5 fantasy:transition-transform fantasy:duration-150',
        look === 'fantasy' && 'luxe-look-fantasy-shine',
      )}
    >
      {look === 'real' ? 'Real' : 'Fantasy'}
    </button>
  )
}
