/**
 * Split WASM / UI foot labels into Tamil vs Latin.
 * Order: strip trailing note after dash → `Name (latin)` → `Name · latin` (Rust combined field).
 */

export type FootDisplayParts = {
  tamil: string
  latin?: string
}

export function splitFootDisplayLabel(raw: string): FootDisplayParts {
  const trimmed = raw.trim()
  if (!trimmed) return { tamil: '' }

  // Drop trailing notes after em/en dash (e.g. "— from Rust")
  const beforeDash = trimmed.split(/\s*[—–]\s*/)[0]?.trim() ?? trimmed
  const main = beforeDash.length > 0 ? beforeDash : trimmed

  // `தேமா (thema)`
  const m = main.match(/^(.+?)\s*\(\s*([^)]+)\s*\)\s*$/u)
  if (m) {
    const tamil = m[1].trim()
    const latin = m[2].trim()
    if (tamil.length > 0 && latin.length > 0) {
      return { tamil, latin }
    }
  }

  // `தேமா · thema` (Rust `presentation.feet[].foot_type`)
  const dotIdx = main.indexOf(' · ')
  if (dotIdx !== -1) {
    const tamil = main.slice(0, dotIdx).trim()
    const latin = main.slice(dotIdx + 3).trim()
    if (tamil.length > 0 && latin.length > 0) {
      return { tamil, latin }
    }
  }

  return { tamil: main }
}
