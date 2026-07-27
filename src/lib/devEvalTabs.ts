/**
 * Shareable tab keys for `/developer-evaluation`.
 * URL search: `?tab=simple|research|docs` (invalid/missing → simple).
 */

export const DEV_EVAL_TAB_KEYS = ['simple', 'research', 'docs'] as const

export type DevEvalTab = (typeof DEV_EVAL_TAB_KEYS)[number]

export const DEFAULT_DEV_EVAL_TAB: DevEvalTab = 'simple'

export const DEV_EVAL_TAB_LABELS: Record<DevEvalTab, string> = {
  simple: 'Simple guide',
  research: 'Research fields',
  docs: 'Training & docs',
}

/** Validate raw search value; unknown → Simple guide. */
export function parseDevEvalTab(raw: unknown): DevEvalTab {
  if (raw === 'simple' || raw === 'research' || raw === 'docs') {
    return raw
  }
  return DEFAULT_DEV_EVAL_TAB
}

/** TanStack `validateSearch` shape for the developer-evaluation route. */
export function validateDevEvalSearch(search: Record<string, unknown>): {
  tab: DevEvalTab
} {
  return { tab: parseDevEvalTab(search.tab) }
}
