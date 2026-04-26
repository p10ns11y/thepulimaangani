import { Link } from '@tanstack/react-router'
import { useReducedMotion } from 'motion/react'

import { useAppSelector } from '#/components/AppActorProvider'
import { AythamEmojiChase } from '#/components/AythamEmojiChase'
import { RedfillButterflyText } from '#/components/RedfillButterflyText'
import { SocialLinks } from '#/components/SocialLinks'

import { LookToggle } from './LookToggle'

const TITLE = 'Thepulimaangani'
const SUBLINE = 'Seiyul Alagi \u00b7 Tamil Prosody'

/**
 * Shell header: wordmark (left) · aytham↔butterfly chase (center, redfill md+) · toolbar (right).
 */
export default function Header() {
  const look = useAppSelector((s) => s.context.look)
  const reducedPreference = useReducedMotion()
  const isRedfill = look === 'redfill'
  /** `null` while hydrating: allow motion; `true` = user prefers reduced motion. */
  const chaseAsStatic = reducedPreference === true

  return (
    <header className="relative z-20 border-b border-[var(--line)] bg-[var(--header-bg)]/90 backdrop-blur-md supports-backdrop-filter:bg-[var(--header-bg)]/80">
      <nav className="page-wrap grid min-w-0 grid-cols-1 gap-2.5 py-2.5 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-3 sm:py-3 md:gap-6">
        <div className="min-w-0 justify-self-start sm:min-w-0">
          <Link
            to="/"
            className="group flex max-w-full flex-col gap-0.5 no-underline outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_oklab,var(--lagoon)_50%,transparent)]"
          >
            <span className="inline-flex min-w-0 items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full bg-[linear-gradient(135deg,var(--brand-mark-a),var(--brand-mark-b))] ring-1 ring-white/20"
                aria-hidden
              />
              {isRedfill ? (
                <RedfillButterflyText
                  text={TITLE}
                  className="min-w-0 text-base font-semibold tracking-tight text-[var(--sea-ink)] transition-colors group-hover:text-[var(--sea-ink)]/90 sm:text-lg"
                />
              ) : (
                <span className="truncate text-base font-semibold tracking-tight text-[var(--sea-ink)] transition-colors group-hover:text-[var(--sea-ink)]/90 sm:text-lg">
                  {TITLE}
                </span>
              )}
            </span>
            {isRedfill ? (
              <RedfillButterflyText
                as="div"
                text={SUBLINE}
                className="pl-0 text-[0.68rem] leading-relaxed text-[var(--sea-ink-soft)] sm:pl-4 sm:text-xs"
              />
            ) : (
              <span className="pl-0 text-[0.68rem] leading-snug text-[var(--sea-ink-soft)] sm:pl-4 sm:text-xs">
                <span className="text-foreground/90">Seiyul Alagi</span>
                <span className="text-muted-foreground/50 px-1.5" aria-hidden>
                  ·
                </span>
                <span className="text-muted-foreground">Tamil Prosody</span>
              </span>
            )}
          </Link>
        </div>

        <div className="hidden justify-center justify-self-center sm:flex">
          {isRedfill ? <AythamEmojiChase reducedMotion={chaseAsStatic} /> : null}
        </div>

        <div
          className="col-span-1 flex w-full min-w-0 flex-wrap items-center justify-between gap-2 sm:col-start-3 sm:w-auto sm:justify-end sm:justify-self-end sm:gap-1 sm:rounded-2xl sm:border sm:border-[var(--chip-line)]/70 sm:bg-[var(--chip-bg)]/45 sm:p-0.5 sm:pl-2 sm:pr-1 sm:shadow-sm"
          aria-label="Site and display controls"
        >
          <div className="flex min-w-0 items-center sm:pl-0.5">
            <Link
              to="/"
              className="nav-link rounded-md px-2.5 py-1.5 text-sm font-medium sm:px-2.5"
              activeProps={{
                className: 'nav-link is-active rounded-md px-2.5 py-1.5 text-sm font-medium sm:px-2.5',
              }}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="nav-link rounded-md px-2.5 py-1.5 text-sm font-medium sm:px-2.5"
              activeProps={{
                className: 'nav-link is-active rounded-md px-2.5 py-1.5 text-sm font-medium sm:px-2.5',
              }}
            >
              About
            </Link>
          </div>

          <div className="hidden h-5 w-px shrink-0 bg-[var(--line)] sm:block" aria-hidden />

          <div className="flex min-w-0 items-center gap-1 sm:gap-1.5 sm:pr-0.5">
            <SocialLinks iconSize={18} className="flex items-center [&_a]:p-1.5" />
            <LookToggle variant="compact" />
          </div>
        </div>
      </nav>
    </header>
  )
}
