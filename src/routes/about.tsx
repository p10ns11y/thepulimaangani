import { Outlet, createFileRoute, useLocation } from '@tanstack/react-router'

import { AboutSectionNav } from '#/components/about/AboutSectionNav'
import { SOCIAL_GITHUB_HREF, SOCIAL_X_HREF } from '#/components/SocialLinks'
import { buildSeoMeta } from '#/lib/seo'

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: buildSeoMeta({ page: 'about' }),
  }),
  component: About,
})

function About() {
  const location = useLocation()
  const isAboutLanding = location.pathname === '/about'

  if (!isAboutLanding) {
    return <Outlet />
  }

  return (
    <main className="page-wrap px-4 py-12 sm:py-16">
      <article className="island-shell mx-auto max-w-2xl rounded-2xl p-6 sm:p-10">
        <AboutSectionNav />
        <p className="island-kicker mb-2">About</p>
        <h1 className="display-title mb-2 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
          Thepulimaangani: Tamil Prosody on the Open Web
        </h1>
        <p className="mb-5 text-base italic leading-relaxed text-[var(--sea-ink-soft)]">
          (Because nothing says “romantic Friday night” like debugging a Rust parser for 7th-century metre.)
        </p>
        <div className="flex flex-col gap-4 text-base leading-relaxed text-[var(--sea-ink-soft)]">
          <p className="m-0">
            Welcome to the glorious intersection of Sangam poetry and WebAssembly.
          </p>
          <p className="m-0">
            We took the ancient, brain-melting rules of Tamil prosody — those delightful{' '}
            <strong className="text-[var(--sea-ink)]">நேர் / நிரை</strong> syllables, the picky little feet,
            the line patterns that have made scholars cry into their palm-leaf manuscripts for centuries — and
            shoved the whole thing into your browser using Rust compiled to{' '}
            <strong className="text-[var(--sea-ink)]">வலை அசெம்பிளி</strong>.
          </p>
          <div className="flex justify-center">
            <div className="font-tamil w-fit max-w-full rounded-xl border border-[var(--line)] bg-[var(--chip-bg)]/50 px-4 py-3 text-left text-[var(--sea-ink)]">
              <p className="m-0 mb-2 font-semibold leading-relaxed">திறந்த வலையத்து செய்யுள் அலகி</p>
              <p className="m-0 mb-2 font-semibold leading-relaxed">இரசுட்டு செய்இணைப்பு வேகமொழி - நீய்ய்நேர்</p>
              <p className="m-0 mb-2 font-semibold leading-relaxed">நிரைந்த அசைசீர் தளைஇயைய தீர்க்குறை</p>
              <p className="m-0 font-semibold leading-relaxed">தாளடிவ ணங்கிதொடைப்  பூசு</p>
            </div>
          </div>
          <p className="m-0">
            No install. No “please download this 2003-era .exe”. Just paste your poem and watch the machine do
            what your high-school Tamil teacher only threatened to do with a ruler.
          </p>
          <p className="m-0">
            Inspired by the legendary{' '}
            <a
              href="https://github.com/virtualvinodh/avalokitam"
              className="text-[var(--lagoon-deep)] font-medium underline decoration-[var(--line)] underline-offset-2 transition hover:decoration-[var(--lagoon)]"
              target="_blank"
              rel="noreferrer"
            >
              <strong>Avalokitam</strong>
            </a>
            , but rebuilt for the modern age with cleaner extension points than a Tamil grammar textbook has
            exceptions.
          </p>
          <p className="m-0">
            Whether you’re a professional Tamil poet, a linguistics masochist, or just someone who wants to know
            why that one line in your WhatsApp verse feels… off, you’ve come to the right place.
          </p>
          <p className="m-0">
            <strong className="font-tamil text-[var(--sea-ink)]">தேபுளிமாங்கனி</strong>
            {' — '}
            because if the ancient poets had browsers, they would have used this instead of counting on their
            fingers.
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
