import { describe, expect, it } from 'vitest'

import {
  ALL_OG_IMAGE_PATHS,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_IMAGE_URL,
  PAGE_OG_IMAGE_PATHS,
  SITE_ORIGIN,
  TWITTER_SITE_HANDLE,
  USER_FACING_SEO_PAGES,
  X_CARD_IMAGE_HEIGHT,
  X_CARD_IMAGE_WIDTH,
  X_DESCRIPTION_SOFT_MAX,
  X_TITLE_SOFT_MAX,
  absoluteAssetUrl,
  absolutePageUrl,
  buildSeoMeta,
  clampForXCard,
  defaultImageUrlForPage,
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
    expect(X_CARD_IMAGE_WIDTH / X_CARD_IMAGE_HEIGHT).toBe(2)
  })

  it('maps each page (and Dev Eval tabs) to a distinct Imagine share path', () => {
    expect(defaultImageUrlForPage('home')).toBe(DEFAULT_OG_IMAGE_URL)
    expect(defaultImageUrlForPage('about')).toBe(
      absoluteAssetUrl(PAGE_OG_IMAGE_PATHS.about),
    )
    expect(defaultImageUrlForPage('about-history')).toBe(
      absoluteAssetUrl(PAGE_OG_IMAGE_PATHS['about-history']),
    )
    expect(defaultImageUrlForPage('about-timeline')).toBe(
      absoluteAssetUrl(PAGE_OG_IMAGE_PATHS['about-timeline']),
    )
    expect(defaultImageUrlForPage('developer-evaluation')).toBe(
      absoluteAssetUrl(PAGE_OG_IMAGE_PATHS['developer-evaluation']),
    )
    expect(defaultImageUrlForPage('developer-evaluation', 'simple')).toBe(
      absoluteAssetUrl(PAGE_OG_IMAGE_PATHS['developer-evaluation']),
    )
    expect(defaultImageUrlForPage('developer-evaluation', 'research')).toBe(
      absoluteAssetUrl(PAGE_OG_IMAGE_PATHS['dev-eval-research']),
    )
    expect(defaultImageUrlForPage('developer-evaluation', 'docs')).toBe(
      absoluteAssetUrl(PAGE_OG_IMAGE_PATHS['dev-eval-docs']),
    )

    const urls = USER_FACING_SEO_PAGES.map((p) => defaultImageUrlForPage(p))
    // about family + home + dev-eval are not all identical
    expect(new Set(urls).size).toBeGreaterThanOrEqual(4)
    expect(ALL_OG_IMAGE_PATHS.length).toBeGreaterThanOrEqual(7)
    for (const path of ALL_OG_IMAGE_PATHS) {
      expect(path).toMatch(/^\/og-.*\.jpg$/)
    }
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

    expect(metaByName(meta, 'twitter:card')).toBe('summary_large_image')
    expect(metaByName(meta, 'twitter:site')).toBe('@peramanathan')
    expect(metaByName(meta, 'twitter:creator')).toBe('@peramanathan')
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

    expect(metaByProperty(meta, 'og:title')).toBe(metaByName(meta, 'twitter:title'))
    expect(metaByProperty(meta, 'og:image')).toBe(DEFAULT_OG_IMAGE_URL)
    expect(metaByProperty(meta, 'og:image:width')).toBe('1200')
    expect(metaByProperty(meta, 'og:image:height')).toBe('600')
    expect(metaByProperty(meta, 'og:image:type')).toBe('image/jpeg')
  })

  it('developer-evaluation meta is tab-aware including share image', () => {
    const research = buildSeoMeta({
      page: 'developer-evaluation',
      tab: 'research',
    })
    expect(metaTitle(research)).toMatch(/Research fields/i)
    expect(metaByName(research, 'twitter:title')).toMatch(/Research fields/i)
    expect(metaByName(research, 'twitter:url')).toContain('tab=research')
    expect(metaByName(research, 'twitter:image')).toBe(
      absoluteAssetUrl(PAGE_OG_IMAGE_PATHS['dev-eval-research']),
    )
    expect(metaByName(research, 'twitter:image:alt')).toMatch(/Research/i)

    const docs = buildSeoMeta({ page: 'developer-evaluation', tab: 'docs' })
    expect(metaByName(docs, 'twitter:image')).toBe(
      absoluteAssetUrl(PAGE_OG_IMAGE_PATHS['dev-eval-docs']),
    )
    expect(metaByName(docs, 'twitter:url')).toContain('tab=docs')

    const simple = buildSeoMeta({
      page: 'developer-evaluation',
      tab: 'simple',
    })
    expect(metaByName(simple, 'twitter:image')).toBe(
      absoluteAssetUrl(PAGE_OG_IMAGE_PATHS['developer-evaluation']),
    )
  })

  it('about family pages use their own Imagine cards', () => {
    const about = buildSeoMeta({ page: 'about' })
    expect(metaByName(about, 'twitter:image')).toBe(
      absoluteAssetUrl(PAGE_OG_IMAGE_PATHS.about),
    )
    const history = buildSeoMeta({ page: 'about-history' })
    expect(metaByName(history, 'twitter:image')).toBe(
      absoluteAssetUrl(PAGE_OG_IMAGE_PATHS['about-history']),
    )
    const timeline = buildSeoMeta({ page: 'about-timeline' })
    expect(metaByName(timeline, 'twitter:image')).toBe(
      absoluteAssetUrl(PAGE_OG_IMAGE_PATHS['about-timeline']),
    )
    expect(metaByName(about, 'twitter:image')).not.toBe(
      metaByName(history, 'twitter:image'),
    )
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
    expect(pagePath('developer-evaluation', 'research')).toBe(
      '/developer-evaluation?tab=research',
    )
    expect(absolutePageUrl('about-timeline')).toBe(
      `${SITE_ORIGIN}/about/timeline`,
    )
  })
})
