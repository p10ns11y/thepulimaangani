import { Link } from '@tanstack/react-router'

type AboutSectionNavProps = {
  lang?: 'en' | 'ta'
}

const baseClass =
  'rounded-md border px-3 py-1.5 text-sm font-medium transition border-[var(--line)] text-[var(--sea-ink-soft)] hover:border-[var(--lagoon)]/60 hover:text-[var(--sea-ink)]'

const activeClass = 'border-[var(--lagoon)] bg-[var(--chip-bg)] text-[var(--sea-ink)]'

export function AboutSectionNav({ lang = 'en' }: AboutSectionNavProps) {
  return (
    <nav className="mb-6 flex flex-wrap items-center justify-center gap-2" aria-label="About section navigation">
      <Link to="/about" activeProps={{ className: `${baseClass} ${activeClass}` }} className={baseClass}>
        About
      </Link>
      <Link
        to="/about/timeline"
        search={{ lang }}
        activeProps={{ className: `${baseClass} ${activeClass}` }}
        className={baseClass}
      >
        Timeline
      </Link>
      <Link
        to="/about/history"
        search={{ lang }}
        activeProps={{ className: `${baseClass} ${activeClass}` }}
        className={baseClass}
      >
        History
      </Link>
    </nav>
  )
}
