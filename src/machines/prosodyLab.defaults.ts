import { poemVariations } from '#/data/poemVariations'

export type VariationRow = { en: string; ta: string; example: string }

export type MetreBlock = {
  special_types: VariationRow[]
  variations: VariationRow[]
}

export const METRE_ORDER = ['venpaa', 'aciriyappa', 'kalippaa', 'vanjippaa'] as const
export type MetreKey = (typeof METRE_ORDER)[number]

export const METRE_TAB_LABEL: Record<MetreKey, string> = {
  venpaa: 'வெண்பா',
  aciriyappa: 'ஆசிரியப்பா',
  kalippaa: 'கலிப்பா',
  vanjippaa: 'வஞ்சிப்பா',
}

export function getMetreBlock(key: MetreKey): MetreBlock {
  const all = poemVariations as Record<string, MetreBlock>
  return all[key]
}

export function getFlatRows(metreKey: MetreKey): VariationRow[] {
  const b = getMetreBlock(metreKey)
  return [...b.special_types, ...b.variations]
}

const venFirst = getMetreBlock('venpaa')
export const defaultSampleRow: VariationRow =
  venFirst.special_types.find((r) => r.en === 'kalivenpaa') ?? venFirst.special_types[0]!
