/**
 * Normalize for comparing editor text with `parsed.original_text`.
 *
 * **Do not `trim()` the whole string** — trailing newlines change physical line count
 * (`"a\\n"` vs `"a\\n\\n"`) but trim collapses them, breaking live-preview cache keys and
 * causing stale parses to pair with the wrong `physicalPoemLines()` layout.
 */
export function normalizePoemText(s: string): string {
  return s.replace(/\r\n/g, '\n').normalize('NFC')
}
