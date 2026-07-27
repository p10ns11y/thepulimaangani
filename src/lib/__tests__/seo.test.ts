import { describe, expect, it } from 'vitest'

import {
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_IMAGE_URL,
  SITE_ORIGIN,
  USER_FACING_SEO_PAGES,
  absolutePageUrl,
  buildSeoMeta,
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

describe('seo helpers', () => {
  it('exports a documented production origin and default OG path', () => {
    expect(SITE_ORIGIN).toMatch(/^https:\/\//)
    expect(SITE_ORIGIN).toContain('seiyul-alagi.vercel.app')
    expect(DEFAULT_OG_IMAGE_PATH).toBe('/og-default.png')
    expect(DEFAULT_OG_IMAGE_URL).toBe(`${SITE_ORIGIN}${DEFAULT_OG_IMAGE_PATH}`)
  })

  it('provides non-empty title and description for every user-facing page', () => {
    for (const page of USER_FACING_SEO_PAGES) {
      const copy = getPageSeoCopy(page)
      expect(copy.title.length).toBeGreaterThan(8)
      expect(copy.description.length).toBeGreaterThan(40)
      expect(copy.title).toMatch(/Thepulimaangani|Prosody|Metre/i)
    }
  })

  it('main page (home) is not bare root title alone', () => {
    const home = getPageSeoCopy('home')
    expect(home.title).not.toBe('Thepulimaangani')
    expect(home.title.toLowerCase()).toMatch(/prosody|lab|tamil/)
    expect(home.description.length).toBeGreaterThan(50)
  })

  it('buildSeoMeta for home includes title, description, OG, and Twitter fields', () => {
    const meta = buildSeoMeta({ page: 'home' })
    const title = metaTitle(meta)
    expect(title).toBeTruthy()
    expect(title).toBe(getPageSeoCopy('home').title)

    const description = metaByName(meta, 'description')
    expect(description).toBeTruthy()
    expect(description!.length).toBeGreaterThan(40)

    expect(metaByProperty(meta, 'og:title')).toBe(title)
    expect(metaByProperty(meta, 'og:description')).toBe(description)
    expect(metaByProperty(meta, 'og:image')).toBe(DEFAULT_OG_IMAGE_URL)
    expect(metaByProperty(meta, 'og:type')).toBe('website')
    expect(metaByProperty(meta, 'og:url')).toBe(absolutePageUrl('home'))

    expect(metaByName(meta, 'twitter:card')).toBe('summary_large_image')
    expect(metaByName(meta, 'twitter:title')).toBe(title)
    expect(metaByName(meta, 'twitter:description')).toBe(description)
    expect(metaByName(meta, 'twitter:image')).toBe(DEFAULT_OG_IMAGE_URL)
  })

  it('developer-evaluation meta is tab-aware for research and docs', () => {
    const base = buildSeoMeta({ page: 'developer-evaluation' })
    expect(metaTitle(base)).toMatch(/Developer Evaluation/i)
    expect(metaByName(base, 'description')).toBeTruthy()

    const research = buildSeoMeta({
      page: 'developer-evaluation',
      tab: 'research',
    })
    expect(metaTitle(research)).toMatch(/Research fields/i)
    expect(metaByProperty(research, 'og:title')).toMatch(/Research fields/i)
    expect(metaByName(research, 'description')).toMatch(/Research catalogue/i)
    expect(metaByProperty(research, 'og:url')).toContain('tab=research')
    expect(metaByName(research, 'twitter:image')).toBe(DEFAULT_OG_IMAGE_URL)

    const docs = buildSeoMeta({ page: 'developer-evaluation', tab: 'docs' })
    expect(metaTitle(docs)).toMatch(/Training & docs/i)
    expect(metaByName(docs, 'description')).toMatch(/train/i)
    expect(metaByProperty(docs, 'og:url')).toContain('tab=docs')
  })

  it('about family pages have distinct copy from home and each other', () => {
    const about = getPageSeoCopy('about')
    const history = getPageSeoCopy('about-history')
    const timeline = getPageSeoCopy('about-timeline')
    expect(about.title).not.toBe(history.title)
    expect(history.title).not.toBe(timeline.title)
    expect(about.description).not.toBe(history.description)

    for (const page of ['about', 'about-history', 'about-timeline'] as const) {
      const meta = buildSeoMeta({ page })
      expect(metaTitle(meta)).toBeTruthy()
      expect(metaByName(meta, 'description')).toBeTruthy()
      expect(metaByProperty(meta, 'og:image')).toBe(DEFAULT_OG_IMAGE_URL)
      expect(metaByName(meta, 'twitter:card')).toBe('summary_large_image')
    }
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
