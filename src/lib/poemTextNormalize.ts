/**
 * Normalize for comparing editor text with `parsed.original_text`, and as **parser input**
 * before WASM (see {@link normalizePoemText}).
 *
 * **Do not `trim()` the whole string** — trailing newlines change physical line count
 * (`"a\\n"` vs `"a\\n\\n"`) but trim collapses them, breaking live-preview cache keys and
 * causing stale parses to pair with the wrong `physicalPoemLines()` layout.
 */
export function normalizePoemText(s: string): string {
  let t = s.replace(/\r\n/g, '\n').normalize('NFC')
  // Rust `to_prosodic_units` skips unknown graphemes; ASCII parens are dropped and interior
  // letters were lost (e.g. தெருமந்திட்(டு) → தெருமந்திட் foot wrong). Merge optional sandhi
  // hints by removing `()` until parser accepts those graphemes natively.
  t = t.replace(/[()]/g, '')
  return t
}
