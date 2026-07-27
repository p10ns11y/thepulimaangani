import { describe, expect, it } from 'vitest'

import {
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_IMAGE_URL,
  SITE_ORIGIN,
  TWITTER_SITE_HANDLE,
  USER_FACING_SEO_PAGES,
  X_CARD_IMAGE_HEIGHT,
  X_CARD_IMAGE_WIDTH,
  X_DESCRIPTION_SOFT_MAX,
  X_TITLE_SOFT_MAX,
  absolutePageUrl,
  buildSeoMeta,
  clampForXCard,
  getPageSeoCopy,
  pagePath,
  type SeoMetaEntry,
} from '#/lib/seo'

function metaByName(
  entries: SeoMetaEntry[],
  name: string,
): string | undefined {
  for (const e of entries) {
    if ('name' in e && e.name === name) return e.content
  }
  return undefined
}

function metaByProperty(
  entries: SeoMetaEntry[],
  property: string,
): string | undefined {
  for (const e of entries) {
    if ('property' in e && e.property === property) return e.content
  }
  return undefined
}

function metaTitle(entries: SeoMetaEntry[]): string | undefined {
  for (const e of entries) {
    if ('title' in e && typeof e.title === 'string') return e.title
  }
  return undefined
}

describe('seo helpers (X.com first)', () => {
  it('exports production origin, X card path, and @handle', () => {
    expect(SITE_ORIGIN).toMatch(/^https:\/\//)
    expect(SITE_ORIGIN).toContain('seiyul-alagi.vercel.app')
    expect(DEFAULT_OG_IMAGE_PATH).toBe('/og-default.jpg')
    expect(DEFAULT_OG_IMAGE_URL).toBe(`${SITE_ORIGIN}${DEFAULT_OG_IMAGE_PATH}`)
    expect(DEFAULT_OG_IMAGE_URL).toMatch(/^https:\/\//)
    expect(TWITTER_SITE_HANDLE).toBe('@peramanathan')
    expect(X_CARD_IMAGE_WIDTH).toBe(1200)
    expect(X_CARD_IMAGE_HEIGHT).toBe(600)
    // Exact 2:1 for summary_large_image
    expect(X_CARD_IMAGE_WIDTH / X_CARD_IMAGE_HEIGHT).toBe(2)
  })

  it('provides non-empty title and description for every user-facing page', () => {
    for (const page of USER_FACING_SEO_PAGES) {
      const copy = getPageSeoCopy(page)
      expect(copy.title.length).toBeGreaterThan(8)
      expect(copy.description.length).toBeGreaterThan(40)
      expect(copy.imageAlt.length).toBeGreaterThan(8)
      expect(copy.title).toMatch(/Thepulimaangani|Prosody|Metre/i)
    }
  })

  it('main page (home) is not bare root title alone', () => {
    const home = getPageSeoCopy('home')
    expect(home.title).not.toBe('Thepulimaangani')
    expect(home.title.toLowerCase()).toMatch(/prosody|lab|tamil/)
    expect(home.description.length).toBeGreaterThan(50)
  })

  it('buildSeoMeta emits a complete X large-image card contract', () => {
    const meta = buildSeoMeta({ page: 'home' })
    const title = metaTitle(meta)
    expect(title).toBeTruthy()
    expect(title).toBe(getPageSeoCopy('home').title)

    const description = metaByName(meta, 'description')
    expect(description).toBeTruthy()
    expect(description!.length).toBeGreaterThan(40)

    // X card core
    expect(metaByName(meta, 'twitter:card')).toBe('summary_large_image')
    expect(metaByName(meta, 'twitter:site')).toBe('@peramanathan')
    expect(metaByName(meta, 'twitter:creator')).toBe('@peramanathan')
    expect(metaByName(meta, 'twitter:title')).toBeTruthy()
    expect(metaByName(meta, 'twitter:title')!.length).toBeLessThanOrEqual(
      X_TITLE_SOFT_MAX,
    )
    expect(metaByName(meta, 'twitter:description')!.length).toBeLessThanOrEqual(
      X_DESCRIPTION_SOFT_MAX,
    )
    expect(metaByName(meta, 'twitter:image')).toBe(DEFAULT_OG_IMAGE_URL)
    expect(metaByName(meta, 'twitter:image')).toMatch(/^https:\/\//)
    expect(metaByName(meta, 'twitter:image:alt')).toBeTruthy()
    expect(metaByName(meta, 'twitter:url')).toBe(absolutePageUrl('home'))

    // OG mirrors + image dimensions Twitterbot/other crawlers use
    expect(metaByProperty(meta, 'og:title')).toBe(metaByName(meta, 'twitter:title'))
    expect(metaByProperty(meta, 'og:image')).toBe(DEFAULT_OG_IMAGE_URL)
    expect(metaByProperty(meta, 'og:image:secure_url')).toBe(DEFAULT_OG_IMAGE_URL)
    expect(metaByProperty(meta, 'og:image:width')).toBe('1200')
    expect(metaByProperty(meta, 'og:image:height')).toBe('600')
    expect(metaByProperty(meta, 'og:image:type')).toBe('image/jpeg')
    expect(metaByProperty(meta, 'og:image:alt')).toBe(
      metaByName(meta, 'twitter:image:alt'),
    )
    expect(metaByProperty(meta, 'og:type')).toBe('website')
    expect(metaByProperty(meta, 'og:url')).toBe(absolutePageUrl('home'))
  })

  it('developer-evaluation meta is tab-aware for research and docs', () => {
    const base = buildSeoMeta({ page: 'developer-evaluation' })
    expect(metaTitle(base)).toMatch(/Developer Evaluation/i)
    expect(metaByName(base, 'twitter:card')).toBe('summary_large_image')

    const research = buildSeoMeta({
      page: 'developer-evaluation',
      tab: 'research',
    })
    expect(metaTitle(research)).toMatch(/Research fields/i)
    expect(metaByName(research, 'twitter:title')).toMatch(/Research fields/i)
    expect(metaByName(research, 'twitter:description')).toMatch(/Research catalogue/i)
    expect(metaByName(research, 'twitter:url')).toContain('tab=research')
    expect(metaByName(research, 'twitter:image')).toBe(DEFAULT_OG_IMAGE_URL)
    expect(metaByName(research, 'twitter:image:alt')).toMatch(/Research/i)

    const docs = buildSeoMeta({ page: 'developer-evaluation', tab: 'docs' })
    expect(metaTitle(docs)).toMatch(/Training & docs/i)
    expect(metaByName(docs, 'twitter:url')).toContain('tab=docs')
  })

  it('about family pages define X card meta, not only root defaults', () => {
    for (const page of ['about', 'about-history', 'about-timeline'] as const) {
      const meta = buildSeoMeta({ page })
      expect(metaByName(meta, 'twitter:card')).toBe('summary_large_image')
      expect(metaByName(meta, 'twitter:image')).toBe(DEFAULT_OG_IMAGE_URL)
      expect(metaByName(meta, 'twitter:site')).toBe('@peramanathan')
      expect(metaTitle(meta)).toBeTruthy()
      expect(metaByName(meta, 'description')).toBeTruthy()
    }
  })

  it('clampForXCard truncates long strings on word boundaries', () => {
    const long = 'alpha beta gamma delta epsilon zeta eta theta'
    const clamped = clampForXCard(long, 20)
    expect(clamped.length).toBeLessThanOrEqual(20)
    expect(clamped.endsWith('…')).toBe(true)
    expect(clampForXCard('short', 70)).toBe('short')
  })

  it('pagePath and absolutePageUrl encode tab only when non-default', () => {
    expect(pagePath('home')).toBe('/')
    expect(pagePath('developer-evaluation')).toBe('/developer-evaluation')
    expect(pagePath('developer-evaluation', 'simple')).toBe(
      '/developer-evaluation',
    )
    expect(pagePath('developer-evaluation', 'research')).toBe(
      '/developer-evaluation?tab=research',
    )
    expect(absolutePageUrl('about-timeline')).toBe(
      `${SITE_ORIGIN}/about/timeline`,
    )
  })
})
