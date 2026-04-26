import { SocialLinks } from '#/components/SocialLinks'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t border-[var(--line)] px-4 pb-12 pt-10 text-[var(--sea-ink-soft)]">
      <div className="page-wrap flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-start">
        <div className="max-w-lg text-center sm:text-left">
          <p className="text-foreground m-0 text-sm font-medium tracking-tight">Thepulimaangani</p>
          <p className="mt-1.5 m-0 text-sm leading-relaxed">
            Tamil prosody analysis in the browser. Source on{' '}
            <a
              href="https://github.com/p10ns11y/thepulimaangani"
              className="text-[var(--lagoon-deep)] underline decoration-[var(--line)] underline-offset-2 transition hover:decoration-[var(--lagoon)]"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            .
          </p>
          <p className="mt-2 m-0 text-xs opacity-90">&copy; {year}</p>
        </div>

        <div className="flex flex-col items-center gap-2 sm:items-end">
          <span className="text-xs font-medium tracking-wide text-[var(--sea-ink-soft)]">Connect</span>
          <SocialLinks iconSize={26} className="flex items-center gap-1" />
        </div>
      </div>
    </footer>
  )
}
