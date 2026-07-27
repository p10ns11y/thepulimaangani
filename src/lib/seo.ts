/**
 * Pure SEO / social-share meta helpers — **X.com (Twitter Cards) first**.
 *
 * Target card: `summary_large_image` with absolute HTTPS `twitter:image`.
 * Image: 1200×600 (2:1) baseline JPEG under `public/` (X large-card crop).
 * Site origin is the production homepage (absolute image URLs for Twitterbot).
 */

/** Production origin used for absolute Open Graph / X image URLs. */
export const SITE_ORIGIN = 'https://seiyul-alagi.vercel.app'

/**
 * Default X large card under `public/` (1200×600, 2:1).
 * Derived from the README Grok Imagine banner via Imagine edit + crop.
 */
export const DEFAULT_OG_IMAGE_PATH = '/og-default.jpg'

/** Secondary Imagine card (temple courtyard + prosody lab motif). */
export const PROSODY_LAB_OG_IMAGE_PATH = '/og-prosody-lab.jpg'

/** X summary_large_image recommended dimensions (exact 2:1). */
export const X_CARD_IMAGE_WIDTH = 1200
export const X_CARD_IMAGE_HEIGHT = 600

export const DEFAULT_OG_IMAGE_URL = `${SITE_ORIGIN}${DEFAULT_OG_IMAGE_PATH}`
export const PROSODY_LAB_OG_IMAGE_URL = `${SITE_ORIGIN}${PROSODY_LAB_OG_IMAGE_PATH}`

/**
 * Maintainer X handle (matches `SOCIAL_X_HREF` in SocialLinks).
 * Used for `twitter:site` / `twitter:creator` so cards attribute correctly on X.
 */
export const TWITTER_SITE_HANDLE = '@peramanathan'

export type SeoPageKey =
  | 'home'
  | 'about'
  | 'about-history'
  | 'about-timeline'
  | 'developer-evaluation'

export type DevEvalTabKey = 'simple' | 'research' | 'docs'

export type PageSeoCopy = {
  title: string
  description: string
  /** Alt text for the share image (twitter:image:alt / og:image:alt). */
  imageAlt: string
}

const PAGE_COPY: Record<SeoPageKey, PageSeoCopy> = {
  home: {
    title: 'Thepulimaangani — Tamil Prosody Lab',
    description:
      'Paste Tamil poetry and analyse syllables, feet, bonds, and metre in the browser — Rust WebAssembly prosody parser, no install.',
    imageAlt:
      'Thepulimaangani: Tamil prosody lab — classical musicians and glowing யாப்பு layer labels',
  },
  about: {
    title: 'About — Thepulimaangani',
    description:
      'Tamil prosody on the open web: Sangam metre rules, WebAssembly parsing, and tools inspired by Avalokitam — rebuilt for the modern browser.',
    imageAlt: 'About Thepulimaangani — Tamil prosody on the open web',
  },
  'about-history': {
    title: 'History of Tamil Prosody — Thepulimaangani',
    description:
      'How Tamil Yappu relates to Sanskrit, Greek, and Latin prosody — comparative history of metre, acai, and literary contact.',
    imageAlt: 'History of Tamil prosody — Thepulimaangani',
  },
  'about-timeline': {
    title: 'Timeline of Tamil Prosody — Thepulimaangani',
    description:
      'Key milestones in Tamil grammar and prosody across historical periods — from foundational texts to comparative traditions.',
    imageAlt: 'Timeline of Tamil prosody — Thepulimaangani',
  },
  'developer-evaluation': {
    title: 'Developer Evaluation · Metre ML — Thepulimaangani',
    description:
      'First-principles guide to metre ML: dense features, multi-head votes, entropy, dual-truth, and ADOPT — without classical over-claim.',
    imageAlt: 'Developer Evaluation: how metre ML works in Thepulimaangani',
  },
}

const DEV_EVAL_TAB_COPY: Record<
  DevEvalTabKey,
  { titleSuffix: string; description: string; imageAlt: string }
> = {
  simple: {
    titleSuffix: 'Simple guide',
    description:
      'Plain-language story of how metre guessing works: structure engine, small model votes, and classical flags kept separate.',
    imageAlt: 'Simple guide — how metre guessing works in Thepulimaangani',
  },
  research: {
    titleSuffix: 'Research fields',
    description:
      'Research catalogue of control, ML, information, and mining fields behind the Prosody Lab developer evaluation panel.',
    imageAlt: 'Research fields — metre ML catalogue in Thepulimaangani',
  },
  docs: {
    titleSuffix: 'Training & docs',
    description:
      'How metre models are trained and where the portfolio docs live: beginner guide, methods portfolio, and PARSE_FEATURES.',
    imageAlt: 'Training and docs — metre ML portfolio in Thepulimaangani',
  },
}

/** Soft limits X displays cleanly (title ~70, description ~200). */
export const X_TITLE_SOFT_MAX = 70
export const X_DESCRIPTION_SOFT_MAX = 200

export function clampForXCard(
  text: string,
  max: number,
): string {
  const t = text.trim()
  if (t.length <= max) return t
  // Prefer break at word boundary when truncating.
  const slice = t.slice(0, max - 1)
  const lastSpace = slice.lastIndexOf(' ')
  const base = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice
  return `${base.trimEnd()}…`
}

export function getPageSeoCopy(
  page: SeoPageKey,
  options?: { tab?: DevEvalTabKey },
): PageSeoCopy {
  if (page === 'developer-evaluation' && options?.tab) {
    const tab = DEV_EVAL_TAB_COPY[options.tab]
    if (options.tab === 'simple') {
      return { ...PAGE_COPY[page] }
    }
    return {
      title: `${tab.titleSuffix} · Developer Evaluation — Thepulimaangani`,
      description: tab.description,
      imageAlt: tab.imageAlt,
    }
  }
  return { ...PAGE_COPY[page] }
}

/** TanStack Router / HeadContent-compatible meta entries. */
export type SeoMetaEntry =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string }

export type BuildSeoMetaOptions = {
  page: SeoPageKey
  /** Active Dev Eval tab when page is developer-evaluation. */
  tab?: DevEvalTabKey
  /** Absolute HTTPS image URL; defaults to production X card. */
  imageUrl?: string
  /** Full page URL for og:url / twitter:url (optional). */
  pageUrl?: string
}

/** Default image per page (absolute HTTPS for Twitterbot). */
export function defaultImageUrlForPage(page: SeoPageKey): string {
  void page
  return DEFAULT_OG_IMAGE_URL
}

/**
 * Build document meta optimized for **X.com large image cards**, with OG mirrors.
 * Pure: no DOM, no router — unit-testable contract for route `head` wiring.
 *
 * X requirements covered:
 * - `twitter:card` = summary_large_image
 * - absolute HTTPS `twitter:image` (+ alt, dimensions via og:image:*)
 * - `twitter:title` / `twitter:description` / `twitter:url`
 * - `twitter:site` / `twitter:creator` (@handle)
 */
export function buildSeoMeta(options: BuildSeoMetaOptions): SeoMetaEntry[] {
  const copy = getPageSeoCopy(options.page, { tab: options.tab })
  const title = clampForXCard(copy.title, X_TITLE_SOFT_MAX)
  const description = clampForXCard(copy.description, X_DESCRIPTION_SOFT_MAX)
  const imageUrl =
    options.imageUrl ?? defaultImageUrlForPage(options.page)
  const pageUrl =
    options.pageUrl ?? absolutePageUrl(options.page, options.tab)
  const imageAlt = copy.imageAlt
  const imageType = imageUrl.toLowerCase().endsWith('.png')
    ? 'image/png'
    : 'image/jpeg'

  return [
    { title: copy.title },
    { name: 'description', content: copy.description },

    // —— Open Graph (Facebook / iMessage / generic; X also reads these) ——
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Thepulimaangani' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: pageUrl },
    { property: 'og:image', content: imageUrl },
    { property: 'og:image:secure_url', content: imageUrl },
    { property: 'og:image:type', content: imageType },
    { property: 'og:image:width', content: String(X_CARD_IMAGE_WIDTH) },
    { property: 'og:image:height', content: String(X_CARD_IMAGE_HEIGHT) },
    { property: 'og:image:alt', content: imageAlt },

    // —— X.com / Twitter Cards (primary share target) ——
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: TWITTER_SITE_HANDLE },
    { name: 'twitter:creator', content: TWITTER_SITE_HANDLE },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:url', content: pageUrl },
    { name: 'twitter:image', content: imageUrl },
    { name: 'twitter:image:alt', content: imageAlt },
  ]
}

/** Path segment (no origin) for each page key. */
export function pagePath(
  page: SeoPageKey,
  tab?: DevEvalTabKey,
): string {
  switch (page) {
    case 'home':
      return '/'
    case 'about':
      return '/about'
    case 'about-history':
      return '/about/history'
    case 'about-timeline':
      return '/about/timeline'
    case 'developer-evaluation': {
      if (tab && tab !== 'simple') {
        return `/developer-evaluation?tab=${tab}`
      }
      return '/developer-evaluation'
    }
  }
}

export function absolutePageUrl(
  page: SeoPageKey,
  tab?: DevEvalTabKey,
): string {
  const path = pagePath(page, tab)
  if (path === '/') return `${SITE_ORIGIN}/`
  return `${SITE_ORIGIN}${path}`
}

/** All user-facing page keys that must define page-level SEO (not root-only). */
export const USER_FACING_SEO_PAGES: readonly SeoPageKey[] = [
  'home',
  'about',
  'about-history',
  'about-timeline',
  'developer-evaluation',
] as const
