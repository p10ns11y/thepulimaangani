/**
 * Drives the real route `head` option functions shipped in src/routes/*
 * (not a reimplementation) and asserts SEO meta contract.
 */
import { describe, expect, it } from 'vitest'

import { Route as AboutHistoryRoute } from '#/routes/about.history'
import { Route as AboutTimelineRoute } from '#/routes/about.timeline'
import { Route as AboutRoute } from '#/routes/about'
import { Route as DeveloperEvaluationRoute } from '#/routes/developer-evaluation'
import { Route as HomeRoute } from '#/routes/index'
import { DEFAULT_OG_IMAGE_URL } from '#/lib/seo'

type MetaEntry =
  | { title?: string; name?: string; property?: string; content?: string }
  | Record<string, unknown>

function asMetaArray(headResult: unknown): MetaEntry[] {
  if (!headResult || typeof headResult !== 'object') return []
  const meta = (headResult as { meta?: unknown }).meta
  return Array.isArray(meta) ? (meta as MetaEntry[]) : []
}

function callHead(
  route: { options: { head?: (ctx: never) => unknown } },
  ctx: unknown,
): MetaEntry[] {
  const head = route.options.head
  if (typeof head !== 'function') {
    throw new Error('route is missing head()')
  }
  return asMetaArray(head(ctx as never))
}

function titleOf(meta: MetaEntry[]): string | undefined {
  for (const e of meta) {
    if (typeof e.title === 'string') return e.title
  }
  return undefined
}

function named(meta: MetaEntry[], name: string): string | undefined {
  for (const e of meta) {
    if (e.name === name && typeof e.content === 'string') return e.content
  }
  return undefined
}

function prop(meta: MetaEntry[], property: string): string | undefined {
  for (const e of meta) {
    if (e.property === property && typeof e.content === 'string') return e.content
  }
  return undefined
}

function expectFullShareMeta(meta: MetaEntry[]) {
  expect(titleOf(meta)?.length).toBeGreaterThan(8)
  expect(named(meta, 'description')?.length).toBeGreaterThan(40)
  // X.com large card (primary)
  expect(named(meta, 'twitter:card')).toBe('summary_large_image')
  expect(named(meta, 'twitter:site')).toBe('@peramanathan')
  expect(named(meta, 'twitter:creator')).toBe('@peramanathan')
  expect(named(meta, 'twitter:title')?.length).toBeGreaterThan(8)
  expect(named(meta, 'twitter:description')?.length).toBeGreaterThan(20)
  expect(named(meta, 'twitter:image')).toBe(DEFAULT_OG_IMAGE_URL)
  expect(named(meta, 'twitter:image')).toMatch(/^https:\/\//)
  expect(named(meta, 'twitter:image:alt')?.length).toBeGreaterThan(8)
  // OG mirrors + dimensions for crawlers
  expect(prop(meta, 'og:title')).toBe(named(meta, 'twitter:title'))
  expect(prop(meta, 'og:image')).toBe(DEFAULT_OG_IMAGE_URL)
  expect(prop(meta, 'og:image:width')).toBe('1200')
  expect(prop(meta, 'og:image:height')).toBe('600')
}

describe('route head builders (shipped routes)', () => {
  it('home route head exposes full SEO + share meta', () => {
    const meta = callHead(HomeRoute, {})
    expectFullShareMeta(meta)
    expect(titleOf(meta)).toMatch(/Prosody Lab|Tamil/i)
    expect(titleOf(meta)).not.toBe('Thepulimaangani')
  })

  it('developer-evaluation head is tab-aware', () => {
    const simple = callHead(DeveloperEvaluationRoute, {
      match: { search: { tab: 'simple' } },
    })
    expectFullShareMeta(simple)
    expect(titleOf(simple)).toMatch(/Developer Evaluation/i)

    const research = callHead(DeveloperEvaluationRoute, {
      match: { search: { tab: 'research' } },
    })
    expectFullShareMeta(research)
    expect(titleOf(research)).toMatch(/Research fields/i)
    expect(prop(research, 'og:url')).toContain('tab=research')
    expect(named(research, 'twitter:description')).toMatch(/Research/i)

    const docs = callHead(DeveloperEvaluationRoute, {
      match: { search: { tab: 'docs' } },
    })
    expect(titleOf(docs)).toMatch(/Training & docs/i)
    expect(prop(docs, 'og:url')).toContain('tab=docs')
  })

  it('about family routes define page-level title and description', () => {
    for (const route of [AboutRoute, AboutHistoryRoute, AboutTimelineRoute]) {
      const meta = callHead(route, {})
      expectFullShareMeta(meta)
    }
    const titles = [
      titleOf(callHead(AboutRoute, {})),
      titleOf(callHead(AboutHistoryRoute, {})),
      titleOf(callHead(AboutTimelineRoute, {})),
    ]
    expect(new Set(titles).size).toBe(3)
  })

  it('developer-evaluation validateSearch falls back for bad tab', () => {
    const validate = DeveloperEvaluationRoute.options.validateSearch
    expect(typeof validate).toBe('function')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed = (validate as (s: Record<string, unknown>) => { tab: string })({
      tab: 'nope',
    })
    expect(parsed.tab).toBe('simple')
  })
})
