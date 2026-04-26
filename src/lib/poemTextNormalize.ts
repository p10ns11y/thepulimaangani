/** Normalize for comparing editor text with `parsed.original_text`. */
export function normalizePoemText(s: string): string {
  return s.trim().replace(/\r\n/g, '\n')
}
