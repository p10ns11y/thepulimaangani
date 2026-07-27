/**
 * Pure SEO / social-share meta helpers.
 *
 * Site origin is the production homepage on the GitHub repo (for absolute og:image URLs).
 * Paths under public/ are also exported for asset checks.
 */

/** Production origin used for absolute Open Graph / Twitter image URLs. */
export const SITE_ORIGIN = 'https://seiyul-alagi.vercel.app'

/** Default share card under `public/` (1200×630). */
export const DEFAULT_OG_IMAGE_PATH = '/og-default.png'

export const DEFAULT_OG_IMAGE_URL = `${SITE_ORIGIN}${DEFAULT_OG_IMAGE_PATH}`

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
}

const PAGE_COPY: Record<SeoPageKey, PageSeoCopy> = {
  home: {
    title: 'Thepulimaangani — Tamil Prosody Lab',
    description:
      'Paste Tamil poetry and analyse syllables, feet, bonds, and metre in the browser — Rust WebAssembly prosody parser, no install.',
  },
  about: {
    title: 'About — Thepulimaangani',
    description:
      'Tamil prosody on the open web: Sangam metre rules, WebAssembly parsing, and tools inspired by Avalokitam — rebuilt for the modern browser.',
  },
  'about-history': {
    title: 'History of Tamil Prosody — Thepulimaangani',
    description:
      'How Tamil Yappu relates to Sanskrit, Greek, and Latin prosody — comparative history of metre, acai, and literary contact.',
  },
  'about-timeline': {
    title: 'Timeline of Tamil Prosody — Thepulimaangani',
    description:
      'Key milestones in Tamil grammar and prosody across historical periods — from foundational texts to comparative traditions.',
  },
  'developer-evaluation': {
    title: 'Developer Evaluation · Metre ML — Thepulimaangani',
    description:
      'First-principles guide to metre ML: dense features, multi-head votes, entropy, dual-truth, and ADOPT — without classical over-claim.',
  },
}

const DEV_EVAL_TAB_COPY: Record<
  DevEvalTabKey,
  { titleSuffix: string; description: string }
> = {
  simple: {
    titleSuffix: 'Simple guide',
    description:
      'Plain-language story of how metre guessing works: structure engine, small model votes, and classical flags kept separate.',
  },
  research: {
    titleSuffix: 'Research fields',
    description:
      'Research catalogue of control, ML, information, and mining fields behind the Prosody Lab developer evaluation panel.',
  },
  docs: {
    titleSuffix: 'Training & docs',
    description:
      'How metre models are trained and where the portfolio docs live: beginner guide, methods portfolio, and PARSE_FEATURES.',
  },
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
  /** Absolute or site-absolute image URL; defaults to production OG card. */
  imageUrl?: string
  /** Full page URL for og:url (optional). */
  pageUrl?: string
}

/**
 * Build title + description + Open Graph + Twitter card meta for a page.
 * Pure: no DOM, no router — unit-testable contract for route `head` wiring.
 */
export function buildSeoMeta(options: BuildSeoMetaOptions): SeoMetaEntry[] {
  const { title, description } = getPageSeoCopy(options.page, {
    tab: options.tab,
  })
  const imageUrl = options.imageUrl ?? DEFAULT_OG_IMAGE_URL
  const pageUrl =
    options.pageUrl ??
    absolutePageUrl(options.page, options.tab)

  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Thepulimaangani' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: imageUrl },
    { property: 'og:url', content: pageUrl },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
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
