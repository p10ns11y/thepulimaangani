import { getFootTypeDisplay } from '#/components/prosody/displayLabels'
import { splitFootDisplayLabel } from '#/lib/footDisplayLabelParts'
import type { ParsedFoot } from '#/types/parsedPoem'

/** Fidelity rules: `src/lib/prosodyDisplayContract.ts` */

/** Prefer WASM structured Tamil/Latin; else combined display string; else machine-pattern labels. */
export function resolveFootDisplayLabel(foot: ParsedFoot): string {
  const tt = foot.display_foot_type_tamil?.trim()
  const tl = foot.display_foot_type_latin?.trim()
  if (tt && tl) return `${tt} · ${tl}`
  if (tt) return tt
  const raw = foot.display_foot_type?.trim()
  if (raw && raw.length > 0) return raw
  return getFootTypeDisplay(foot.foot_type)
}

/** Tamil/Latin when WASM sends structured fields; else parse combined label / fallback to map. */
export function resolveFootDisplayParts(foot: ParsedFoot): { tamil: string; latin?: string } {
  const tt = foot.display_foot_type_tamil?.trim()
  const tl = foot.display_foot_type_latin?.trim()
  if (tt && tl) return { tamil: tt, latin: tl }
  if (tt) return { tamil: tt }
  const combined = resolveFootDisplayLabel(foot)
  return splitFootDisplayLabel(combined)
}
