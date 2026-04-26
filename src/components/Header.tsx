import { Link } from '@tanstack/react-router'

import { SocialLinks } from '#/components/SocialLinks'

import ThemeToggle from './ThemeToggle'

export default function Header() {
  const tagline = (
    <p className="text-muted-foreground m-0 text-center text-balance text-[0.7rem] leading-snug font-medium tracking-wide sm:text-xs md:text-sm">
      <span className="text-foreground/90">Seiyul Alagi</span>
      <span className="text-muted-foreground/60 px-1" aria-hidden>
        —
      </span>
      <span>Tamil Prosody</span>
    </p>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)]/95 px-3 backdrop-blur-lg sm:px-4">
      <nav className="page-wrap grid grid-cols-2 grid-rows-[auto_auto] items-center gap-x-2 gap-y-2 py-2.5 sm:grid-cols-[1fr_auto_1fr] sm:grid-rows-1 sm:gap-x-4 sm:gap-y-0 sm:py-3.5">
        <h2 className="col-start-1 row-start-1 m-0 min-w-0 self-center text-base font-semibold tracking-tight sm:justify-self-start">
          <Link
            to="/"
            className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-2.5 py-1.5 text-sm text-[var(--sea-ink)] no-underline shadow-[0_6px_20px_rgba(30,90,72,0.06)] sm:px-4 sm:py-2"
          >
            <span
              className="size-2 shrink-0 rounded-full bg-[linear-gradient(135deg,#56c6be,#3d9a94)]"
              aria-hidden
            />
            <span className="truncate">Thepulimaangani</span>
          </Link>
        </h2>

        <div className="col-span-2 row-start-2 justify-self-stretch sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:max-w-[min(100%,22rem)] sm:justify-self-center sm:px-2">
          {tagline}
        </div>

        <div className="col-start-2 row-start-1 flex flex-wrap items-center justify-end gap-1 self-center sm:col-start-3 sm:gap-2 sm:justify-self-end">
          <div className="flex items-center gap-0.5 rounded-full border border-transparent sm:border-[var(--chip-line)] sm:bg-[var(--chip-bg)]/60 sm:px-1">
            <Link
              to="/"
              className="nav-link rounded-md px-2 py-1.5 text-sm font-semibold sm:px-2.5"
              activeProps={{ className: 'nav-link is-active rounded-md px-2 py-1.5 text-sm font-semibold sm:px-2.5' }}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="nav-link rounded-md px-2 py-1.5 text-sm font-semibold sm:px-2.5"
              activeProps={{ className: 'nav-link is-active rounded-md px-2 py-1.5 text-sm font-semibold sm:px-2.5' }}
            >
              About
            </Link>
          </div>

          <div className="flex items-center gap-0.5 border-l border-[var(--line)] pl-1.5 sm:pl-3">
            <SocialLinks iconSize={20} className="flex items-center" />
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  )
}
