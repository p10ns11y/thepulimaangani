import { createFileRoute } from '@tanstack/react-router'

import { SOCIAL_GITHUB_HREF, SOCIAL_X_HREF } from '#/components/SocialLinks'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main className="page-wrap px-4 py-12 sm:py-16">
      <article className="island-shell mx-auto max-w-2xl rounded-2xl p-6 sm:p-10">
        <p className="island-kicker mb-2">About</p>
        <h1 className="display-title mb-5 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
          Tamil prosody on the open web
        </h1>
        <div className="flex flex-col gap-4 text-base leading-relaxed text-[var(--sea-ink-soft)]">
          <p className="m-0">
            <strong className="text-[var(--sea-ink)]">Thepulimaangani</strong> analyses classical Tamil
            metre in the browser: syllables (நேர் / நிரை), feet, and line patterns via a Rust parser
            compiled to WebAssembly.
          </p>
          <p className="m-0">
            It follows the spirit of{' '}
            <a
              href="https://github.com/virtualvinodh/avalokitam"
              className="text-[var(--lagoon-deep)] font-medium underline decoration-[var(--line)] underline-offset-2 transition hover:decoration-[var(--lagoon)]"
              target="_blank"
              rel="noreferrer"
            >
              Avalokitam
            </a>
            , rebuilt for a modern stack and clearer extension points.
          </p>
          <p className="m-0 text-sm">
            Code:{' '}
            <a
              href={SOCIAL_GITHUB_HREF}
              className="text-[var(--lagoon-deep)] font-medium underline decoration-[var(--line)] underline-offset-2 transition hover:decoration-[var(--lagoon)]"
              target="_blank"
              rel="noreferrer"
            >
              github.com/p10ns11y/thepulimaangani
            </a>
            {' · '}
            <a
              href={SOCIAL_X_HREF}
              className="text-[var(--lagoon-deep)] font-medium underline decoration-[var(--line)] underline-offset-2 transition hover:decoration-[var(--lagoon)]"
              target="_blank"
              rel="noreferrer"
            >
              @peramanathan
            </a>
          </p>
        </div>
      </article>
    </main>
  )
}
