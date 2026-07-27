/**
 * Prosody lab layout prefs (client-only). Pure helpers stay out of React so
 * collapse/expand policy is unit-testable without mounting the lab.
 */

export const INPUT_RAIL_EXPANDED_KEY = 'thepulimaangani.prosody.inputRailExpanded' as const

/** Default expanded so first visit keeps sample selection discoverable. */
export function readInputRailExpanded(): boolean {
  if (typeof window === 'undefined') return true
  const v = window.localStorage.getItem(INPUT_RAIL_EXPANDED_KEY)
  if (v === null) return true
  return v === '1' || v === 'true'
}

export function writeInputRailExpanded(expanded: boolean): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(INPUT_RAIL_EXPANDED_KEY, expanded ? '1' : '0')
}

/**
 * Grid template for the Prosody lab shell.
 * Expanded: golden-ish split (input | results). Collapsed: results claim full width.
 */
export function prosodyLabGridClass(inputRailExpanded: boolean): string {
  if (inputRailExpanded) {
    return 'lg:grid-cols-[minmax(0,38.2fr)_minmax(0,61.8fr)]'
  }
  return 'lg:grid-cols-1'
}
