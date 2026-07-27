import { Link } from '@tanstack/react-router'

import { SocialLinks } from '#/components/SocialLinks'

const footerNavClass =
  'text-[var(--sea-ink-soft)] text-sm font-medium no-underline transition hover:text-[var(--sea-ink)] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lagoon)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer mt-16 px-4 pb-10 pt-8 sm:mt-20 sm:pb-12 sm:pt-10">
      <div className="page-wrap flex flex-col items-center justify-center gap-3.5 text-center sm:gap-4">
        <div className="flex max-w-md flex-col items-center gap-1.5">
          <p className="text-foreground m-0 text-sm font-semibold tracking-tight">
            Thepulimaangani
          </p>
          <p className="text-[var(--sea-ink-soft)] m-0 text-sm leading-relaxed">
            Tamil prosody analysis in the browser. Source on{' '}
            <a
              href="https://github.com/p10ns11y/thepulimaangani"
              className="text-[var(--lagoon-deep)] font-medium underline decoration-[var(--line)] underline-offset-2 transition hover:decoration-[var(--lagoon)]"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            .
          </p>
        </div>

        <nav
          aria-label="Site"
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1"
        >
          <Link to="/" className={footerNavClass}>
            Home
          </Link>
          <span className="text-[var(--line)] select-none" aria-hidden>
            ·
          </span>
          <Link to="/about" className={footerNavClass}>
            About
          </Link>
          <span className="text-[var(--line)] select-none" aria-hidden>
            ·
          </span>
          <Link
            to="/developer-evaluation"
            search={{ tab: 'simple' }}
            className={footerNavClass}
            title="How metre ML works"
          >
            Developer Evaluation
          </Link>
        </nav>

        <SocialLinks
          iconSize={22}
          className="flex items-center justify-center gap-0.5"
        />

        <p className="text-[var(--sea-ink-soft)] m-0 text-[0.7rem] leading-none tracking-wide opacity-75">
          &copy; {year}
        </p>
      </div>
    </footer>
  )
}
