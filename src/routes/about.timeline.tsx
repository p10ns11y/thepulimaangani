import { Link, createFileRoute } from '@tanstack/react-router'

import { AboutSectionNav } from '#/components/about/AboutSectionNav'
import timelineEnglish from '#/data/timeline_english.json'
import timelineTamil from '#/data/timeline_tamil.json'
import { buildSeoMeta } from '#/lib/seo'

type TimelineLang = 'en' | 'ta'

type TimelineItem = {
  id: number
  period: string
  title: string
  category: string
  description: string
  highlight: string
}

export const Route = createFileRoute('/about/timeline')({
  validateSearch: (search: Record<string, unknown>) => ({
    lang: search.lang === 'ta' ? 'ta' : 'en',
  }),
  head: () => ({
    meta: buildSeoMeta({ page: 'about-timeline' }),
  }),
  component: AboutTimeline,
})

function AboutTimeline() {
  const { lang } = Route.useSearch()
  const currentLang: TimelineLang = lang === 'ta' ? 'ta' : 'en'
  const isTamil = currentLang === 'ta'
  const items: TimelineItem[] = isTamil ? (timelineTamil as TimelineItem[]) : (timelineEnglish as TimelineItem[])
  const foundationalItems = items.filter((item) => item.id <= 5)
  const comparativeItems = items.filter((item) => item.id > 5)

  return (
    <main className="page-wrap px-4 py-12 sm:py-16">
      <article className="island-shell mx-auto max-w-4xl rounded-2xl p-6 sm:p-10">
        <AboutSectionNav lang={currentLang} />
        <p className="island-kicker mb-2">About</p>
        <h1 className="display-title mb-3 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
          {isTamil ? 'தமிழ் யாப்பு காலவரிசை' : 'Timeline of Tamil Prosody'}
        </h1>
        <p className="mb-6 text-base leading-relaxed text-[var(--sea-ink-soft)]">
          {isTamil
            ? 'தமிழ் இலக்கணம் மற்றும் யாப்பு மரபின் முக்கிய கட்டங்களை காலவரிசையாக பார்க்கவும்.'
            : 'Explore key milestones in Tamil grammar and prosody across major historical periods.'}
        </p>

        <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
          <span className="text-sm font-medium text-[var(--sea-ink-soft)]">
            {isTamil ? 'மொழி:' : 'Language:'}
          </span>
          <Link
            to="/about/timeline"
            search={{ lang: 'en' as TimelineLang }}
            className={`rounded-md border px-3 py-1.5 text-sm transition ${
              !isTamil
                ? 'border-[var(--lagoon)] bg-[var(--chip-bg)] text-[var(--sea-ink)]'
                : 'border-[var(--line)] text-[var(--sea-ink-soft)] hover:border-[var(--lagoon)]/50'
            }`}
          >
            English
          </Link>
          <Link
            to="/about/timeline"
            search={{ lang: 'ta' as TimelineLang }}
            className={`rounded-md border px-3 py-1.5 text-sm transition ${
              isTamil
                ? 'border-[var(--lagoon)] bg-[var(--chip-bg)] text-[var(--sea-ink)]'
                : 'border-[var(--line)] text-[var(--sea-ink-soft)] hover:border-[var(--lagoon)]/50'
            }`}
          >
            தமிழ்
          </Link>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-lg font-semibold tracking-tight text-[var(--sea-ink)]">
              {isTamil ? 'முக்கிய இலக்கண & யாப்பு நூல்கள்' : 'Major Grammar & Prosody Works'}
            </h2>
            <div className="space-y-4">
              {foundationalItems.map((item) => (
                <section
                  key={item.id}
                  className="rounded-xl border border-[var(--line)] bg-[var(--bg-base)]/80 p-4 sm:p-5"
                >
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--sea-ink-soft)]">
                    {item.period}
                  </p>
                  <h3 className="text-xl font-semibold tracking-tight text-[var(--sea-ink)]">{item.title}</h3>
                  <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">{item.category}</p>
                  <p className="mt-3 text-sm font-medium text-[var(--lagoon-deep)]">{item.highlight}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--sea-ink-soft)]">{item.description}</p>
                </section>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold tracking-tight text-[var(--sea-ink)]">
              {isTamil ? 'ஒப்பீடு & வெளிப்புற செல்வாக்குகள்' : 'Influence & Comparative Context'}
            </h2>
            <div className="space-y-4">
              {comparativeItems.map((item) => (
                <section
                  key={item.id}
                  className="rounded-xl border border-[var(--line)] bg-[var(--bg-base)]/80 p-4 sm:p-5"
                >
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--sea-ink-soft)]">
                    {item.period}
                  </p>
                  <h3 className="text-xl font-semibold tracking-tight text-[var(--sea-ink)]">{item.title}</h3>
                  <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">{item.category}</p>
                  <p className="mt-3 text-sm font-medium text-[var(--lagoon-deep)]">{item.highlight}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--sea-ink-soft)]">{item.description}</p>
                </section>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link
            to="/about/timeline"
            search={{ lang: currentLang }}
            className="font-medium text-[var(--lagoon-deep)] underline decoration-[var(--line)] underline-offset-2 transition hover:decoration-[var(--lagoon)]"
          >
            {isTamil ? 'காலவரிசை' : 'Timeline'}
          </Link>
          <span className="text-[var(--sea-ink-soft)]" aria-hidden>
            |
          </span>
          <Link
            to="/about"
            className="font-medium text-[var(--lagoon-deep)] underline decoration-[var(--line)] underline-offset-2 transition hover:decoration-[var(--lagoon)]"
          >
            {isTamil ? 'About' : 'About'}
          </Link>
        </div>
      </article>
    </main>
  )
}
