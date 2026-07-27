import { SocialLinks } from '#/components/SocialLinks'

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
